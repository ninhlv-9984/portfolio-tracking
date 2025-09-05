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
    logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    color: '#f7931a'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    color: '#627eea'
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    color: '#f3ba2f'
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    color: '#23292f'
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    color: '#0033ad'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    color: '#00d4aa'
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    logo: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
    color: '#e6007a'
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    logo: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    color: '#c2a633'
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    color: '#e84142'
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    color: '#2a5ada'
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    logo: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
    color: '#8247e5'
  },
  {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    logo: 'https://assets.coingecko.com/coins/images/10365/small/near.png',
    color: '#000000'
  },
  {
    symbol: 'APT',
    name: 'Aptos',
    logo: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
    color: '#000000'
  },
  {
    symbol: 'ARB',
    name: 'Arbitrum',
    logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    color: '#28a0f0'
  },
  {
    symbol: 'OP',
    name: 'Optimism',
    logo: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    color: '#ff0420'
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    logo: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
    color: '#bfbbbb'
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    logo: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
    color: '#ff007a'
  },
  {
    symbol: 'ATOM',
    name: 'Cosmos',
    logo: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
    color: '#2e3148'
  },
  {
    symbol: 'FIL',
    name: 'Filecoin',
    logo: 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png',
    color: '#0090ff'
  },
  {
    symbol: 'ICP',
    name: 'Internet Computer',
    logo: 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png',
    color: '#3b00b9'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    color: '#26a17b'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    color: '#2775ca'
  },
  {
    symbol: 'BUSD',
    name: 'Binance USD',
    logo: 'https://assets.coingecko.com/coins/images/9576/small/BUSD.png',
    color: '#f0b90b'
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