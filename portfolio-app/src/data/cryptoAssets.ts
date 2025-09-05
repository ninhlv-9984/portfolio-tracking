export interface CryptoAsset {
  symbol: string
  name: string
  logo: string
  color?: string
}

export const CRYPTO_ASSETS: CryptoAsset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    color: '#f7931a'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    color: '#627eea'
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    color: '#f3ba2f'
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
    color: '#23292f'
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png',
    color: '#0033ad'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    color: '#00d4aa'
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
    color: '#e6007a'
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
    color: '#c2a633'
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    color: '#e84142'
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    color: '#2a5ada'
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    color: '#8247e5'
  },
  {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    logo: 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
    color: '#000000'
  },
  {
    symbol: 'APT',
    name: 'Aptos',
    logo: 'https://cryptologos.cc/logos/aptos-apt-logo.png',
    color: '#000000'
  },
  {
    symbol: 'ARB',
    name: 'Arbitrum',
    logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    color: '#28a0f0'
  },
  {
    symbol: 'OP',
    name: 'Optimism',
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    color: '#ff0420'
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    logo: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
    color: '#bfbbbb'
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    color: '#ff007a'
  },
  {
    symbol: 'ATOM',
    name: 'Cosmos',
    logo: 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
    color: '#2e3148'
  },
  {
    symbol: 'FIL',
    name: 'Filecoin',
    logo: 'https://cryptologos.cc/logos/filecoin-fil-logo.png',
    color: '#0090ff'
  },
  {
    symbol: 'ICP',
    name: 'Internet Computer',
    logo: 'https://cryptologos.cc/logos/internet-computer-icp-logo.png',
    color: '#3b00b9'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    color: '#26a17b'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    color: '#2775ca'
  }
]

export const getAssetBySymbol = (symbol: string): CryptoAsset | undefined => {
  return CRYPTO_ASSETS.find(asset => asset.symbol === symbol.toUpperCase())
}

export const searchAssets = (query: string): CryptoAsset[] => {
  const lowerQuery = query.toLowerCase()
  return CRYPTO_ASSETS.filter(asset => 
    asset.symbol.toLowerCase().includes(lowerQuery) ||
    asset.name.toLowerCase().includes(lowerQuery)
  )
}