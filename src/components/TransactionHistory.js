/**
 * Transaction history component
 */
import React, { useState, useEffect } from 'react';
import { getAssetTransfers } from '../services/alchemyService';
import { getTransactionsViaAPI } from '../utils/polygonAPI';
import { formatAddress, formatDateTime, formatRelativeTime, formatTokenBalance, formatGasFee } from '../utils/formatters';
import Loader from './Loader';
import './TransactionHistory.css';

const TransactionHistory = ({ address, onTransactionsUpdate }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, sent, received
  const [filterStatus, setFilterStatus] = useState('all'); // all, success, failed

  useEffect(() => {
    if (!address) return;
    
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let txData = [];
        
        // Prefer Alchemy API
        try {
          const transfers = await getAssetTransfers(address, 50);
          if (Array.isArray(transfers)) {
            txData = transfers
              .filter(tx => tx && tx.hash) // Filter invalid transactions
              .map(tx => ({
                hash: tx.hash || '',
                from: tx.from || '',
                to: tx.to || '',
                value: tx.value?.toString() || '0',
                asset: tx.asset || 'MATIC',
                category: tx.category || 'external',
                blockNum: tx.blockNum || '',
                timestamp: tx.metadata?.blockTimestamp ? new Date(tx.metadata.blockTimestamp).getTime() / 1000 : null,
                status: 'success'
              }));
          }
        } catch (alchemyError) {
          console.warn('Alchemy API unavailable, trying PolygonScan API:', alchemyError);
          
          // Fallback to PolygonScan API
          try {
            const result = await getTransactionsViaAPI(address, page, 20);
            if (result && result.status === '1' && Array.isArray(result.result)) {
              txData = result.result
                .filter(tx => tx && tx.hash) // Filter invalid transactions
                .map(tx => ({
                  hash: tx.hash || '',
                  from: tx.from || '',
                  to: tx.to || '',
                  value: tx.value || '0',
                  asset: 'MATIC',
                  category: 'external',
                  blockNum: tx.blockNumber || '',
                  timestamp: tx.timeStamp ? parseInt(tx.timeStamp) : null,
                  status: tx.txreceipt_status === '1' ? 'success' : 'failed',
                  gasUsed: tx.gasUsed || '0',
                  gasPrice: tx.gasPrice || '0'
                }));
              setHasMore(result.result.length === 20);
            }
          } catch (polygonError) {
            console.error('Failed to fetch transaction history:', polygonError);
            throw polygonError;
          }
        }
        
        setTransactions(txData);
        // Use setTimeout to avoid updating parent component state during render
        setTimeout(() => {
          if (onTransactionsUpdate) {
            onTransactionsUpdate(txData);
          }
        }, 0);
      } catch (err) {
        setError('Failed to fetch transaction history: ' + err.message);
        console.error('Failed to fetch transaction history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, page]);

  // Filter and search transactions
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => {
        const isOutgoing = tx.from?.toLowerCase() === address.toLowerCase();
        return filterType === 'sent' ? isOutgoing : !isOutgoing;
      });
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    // Search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.hash?.toLowerCase().includes(searchLower) ||
        tx.from?.toLowerCase().includes(searchLower) ||
        tx.to?.toLowerCase().includes(searchLower) ||
        tx.value?.toString().includes(searchTerm)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterType, filterStatus, searchTerm, address]);

  if (!address) {
    return (
      <div className="transaction-history-section">
        <h2>Transaction History</h2>
        <p className="empty-message">Please enter a wallet address to view transaction history</p>
      </div>
    );
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="transaction-history-section">
        <h2>Transaction History</h2>
        <Loader message="Loading transaction history..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-section">
        <h2>Transaction History</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const isOutgoing = (tx) => tx.from?.toLowerCase() === address.toLowerCase();

  const exportData = () => {
    const dataStr = JSON.stringify(filteredTransactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${address.slice(0, 10)}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="transaction-history-section">
      <div className="section-header">
        <h2>Transaction History</h2>
        {filteredTransactions.length > 0 && (
          <button onClick={exportData} className="export-button">
            📥 Export Data
          </button>
        )}
      </div>
      
      {transactions.length === 0 ? (
        <p className="empty-message">No transactions found for this address</p>
      ) : (
        <>
          <div className="transaction-filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search transaction hash, address or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          {filteredTransactions.length === 0 && transactions.length > 0 ? (
            <p className="empty-message">No matching transactions found</p>
          ) : (
            <>
              <div className="transactions-list">
                {filteredTransactions.map((tx, index) => {
              const value = formatTokenBalance(tx.value || '0', 18);
              const gasFee = tx.gasUsed && tx.gasPrice 
                ? formatGasFee(tx.gasUsed, tx.gasPrice)
                : null;
              
              return (
                <div key={index} className={`transaction-item ${tx.status}`}>
                  <div className="transaction-header">
                    <div className="transaction-type">
                      {isOutgoing(tx) ? '📤 Sent' : '📥 Received'}
                    </div>
                    <div className={`transaction-status ${tx.status}`}>
                      {tx.status === 'success' ? '✓ Success' : '✗ Failed'}
                    </div>
                  </div>
                  
                  <div className="transaction-details">
                    <div className="transaction-address">
                      <span className="label">{isOutgoing(tx) ? 'To' : 'From'}:</span>
                      <span className="value">{formatAddress(isOutgoing(tx) ? tx.to : tx.from)}</span>
                    </div>
                    
                    <div className="transaction-amount">
                      <span className="label">Amount:</span>
                      <span className="value">{value} {tx.asset || 'MATIC'}</span>
                    </div>
                    
                    {tx.timestamp && (
                      <div className="transaction-time">
                        <span className="label">Time:</span>
                        <span className="value" title={formatDateTime(tx.timestamp)}>
                          {formatRelativeTime(tx.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    {gasFee && (
                      <div className="transaction-gas">
                        <span className="label">Gas Fee:</span>
                        <span className="value">{gasFee}</span>
                      </div>
                    )}
                    
                    <div className="transaction-hash">
                      <span className="label">Transaction Hash:</span>
                      <a
                        href={`https://polygonscan.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hash-link"
                      >
                        {formatAddress(tx.hash)}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
              {hasMore && (
                <div className="load-more-container">
                  <button
                    onClick={() => setPage(page + 1)}
                    className="load-more-button"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;

