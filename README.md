# Polygon On-Chain Asset Dashboard

A dashboard application for querying and displaying asset information of wallet addresses on the Polygon network.

## Features

- **Token Balance Display**: Automatically displays all token balances under a wallet address, including native tokens (MATIC) and ERC-20 tokens
- **Transaction History**: Displays wallet transaction history, including sent and received transactions
- **NFT Holdings**: Shows all NFTs held by an address, including images and detailed information
- **DeFi Positions**: Analyzes DeFi protocol positions (Aave, QuickSwap, etc.)
- **Asset Analytics**: Provides asset distribution charts, health reports, and yield statistics
- **Wallet Connection**: Supports MetaMask and other Web3 wallets
- **Token Swap**: Token exchange functionality
- **Asset Sharing**: Share asset information on social media

## Tech Stack

- **React**: Frontend framework
- **Ethers.js**: Blockchain interaction library
- **Alchemy/Infura**: Blockchain data APIs
- **CoinGecko**: Token price API

## Installation and Setup

### Method 1: Using Batch Scripts (Recommended for Windows)

1. **Install Dependencies**: Double-click `安装依赖.bat` (Install Dependencies.bat)
2. **Start Server**: Double-click `启动服务器.bat` (Start Server.bat)

The browser will automatically open at http://localhost:3000

### Method 2: Using Command Line

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file and add the following configuration (at least one API service is required):

**Quick Setup**: Double-click `配置API密钥.bat` (Configure API Key.bat) for automatic configuration

**Manual Setup**: Create a `.env` file and add the following content:
```
# Alchemy API Configuration (Recommended for NFT queries)
REACT_APP_ALCHEMY_API_KEY=cT66sbNw3dDYSBilF0pIL

# Infura API Configuration (Optional)
REACT_APP_INFURA_API_KEY=your_infura_project_id
REACT_APP_INFURA_PROJECT_ID=your_infura_project_id

# Polygon RPC URL (Optional, uses default public RPC if not provided)
REACT_APP_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your_key

# PolygonScan API Configuration (Optional, for transaction history)
REACT_APP_POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

**Get API Keys**:
- Alchemy: Visit https://www.alchemy.com/ to register and create an application
- Infura: Visit https://www.infura.io/ to register and create a project
- PolygonScan: Visit https://polygonscan.com/apis to register and get an API key

3. Start the development server:
```bash
npm start
```

The application will run at http://localhost:3000

**Note**: If the project path contains Chinese characters, it is recommended to use batch scripts to start the server to avoid encoding issues.

## Project Structure

```
/src
├── /components          # React Components
│   ├── Header.js        # Top navigation bar with wallet address input
│   ├── TokenBalance.js  # Token balance display module
│   ├── TransactionHistory.js # Transaction history module
│   ├── NFTCollection.js # NFT display module
│   ├── WalletConnect.js # Wallet connection component
│   ├── Swap.js          # Token swap component
│   ├── ShareAssets.js   # Asset sharing component
│   ├── DefiPositions.js # DeFi positions component
│   ├── AssetOverview.js # Asset overview component
│   ├── Loader.js        # Loading animation component
│   └── ErrorBoundary.js # Error boundary component
├── /utils               # Utility functions
│   ├── ethersUtils.js   # Ethers.js related utility functions
│   ├── polygonAPI.js    # Polygon blockchain API wrapper
│   ├── formatters.js    # Data formatting utilities
│   └── avatarGenerator.js # Avatar generation utility
├── /services            # API Services
│   ├── alchemyService.js # Alchemy API service
│   ├── infuraService.js  # Infura API service
│   ├── priceService.js   # CoinGecko price service
│   ├── defiService.js    # DeFi protocol service
│   └── achievementService.js # Achievement system service
├── App.js               # Main application entry file
└── index.js             # Project entry file
```

## Usage

1. Enter a Polygon wallet address in the top input box
2. Click the "Query" button or press Enter
3. View token balances, transaction history, and NFT holdings

## Features

### Token Balance
- Automatically displays all ERC-20 token balances under a wallet address
- Displays native token (MATIC) balance
- Supports displaying token names, symbols, and balances
- Real-time price information from CoinGecko

### Transaction History
- Displays wallet sent and received transaction records
- Includes transaction time, amount, Gas fees, and other information
- Supports pagination to load more transaction records
- Click transaction hash to view details on PolygonScan
- Filter and search functionality

### NFT Collection
- Shows all NFTs held by an address
- Displays NFT images, names, and collection information
- Click NFT to view detailed information
- Supports viewing NFT details on PolygonScan
- Multiple view modes (grid, wall, showcase)

### DeFi Positions
- Analyzes positions in DeFi protocols (Aave, QuickSwap, etc.)
- Displays collateral, debt, health factors, and other metrics
- Shows liquidity pool positions

### Asset Analytics
- Asset distribution charts
- Portfolio bubble visualization
- Asset health reports
- Yield statistics and APY calculations

### Additional Features
- Wallet connection (MetaMask support)
- Token swap functionality
- Asset sharing on social media
- Dark/Light theme toggle
- Achievement system
- Responsive design

## Notes

- **API Configuration**: At least the Alchemy API key needs to be configured to use NFT functionality. Token balance queries can use public RPC, but it is recommended to configure API keys for better performance and stability
- **Network Requirements**: Must be able to access the Polygon network and API services
- **First Load**: The first query may take some time, please be patient
- **Browser Compatibility**: It is recommended to use Chrome or Firefox browsers for the best experience
- **Data Accuracy**: Data comes from the blockchain network and may have delays. Please refer to the blockchain explorer for accuracy

## Development

### Build Production Version
```bash
npm run build
```

The built files will be located in the `build` directory.

### Technical Details
- Uses React Hooks for state management
- Uses Ethers.js v6 for blockchain interaction
- Supports Alchemy and Infura API services
- Responsive design, supports mobile access
- Error boundary handling for improved user experience
- Glassmorphism UI design
- Advanced animations and transitions

## License

MIT
