/**
 * Crypto logo paths (local assets)
 * All logos are stored locally in /public/assets/crypto-logos/
 */
export const CRYPTO_LOGOS: Record<string, string> = {
  BTC: '/assets/crypto-logos/btc.png',
  ETH: '/assets/crypto-logos/eth.png',
  BNB: '/assets/crypto-logos/bnb.png',
  SOL: '/assets/crypto-logos/sol.png',
  USDT: '/assets/crypto-logos/usdt.png',
  USDC: '/assets/crypto-logos/usdc.png',
  USD: '/assets/crypto-logos/usdt.png', // Using USDT logo for merged USD
  OKB: '/assets/crypto-logos/okb.png',
  PAXG: '/assets/crypto-logos/paxg.png',
  XPL: '/assets/crypto-logos/xpl.svg',
};

/**
 * Get logo URL for a crypto symbol
 * Returns a placeholder SVG if logo is not found
 */
export const getCryptoLogoUrl = (symbol: string): string => {
  if (CRYPTO_LOGOS[symbol]) {
    return CRYPTO_LOGOS[symbol];
  }

  // Fallback: generate a simple SVG with the symbol letter
  const firstLetter = symbol.substring(0, 1);
  const svg = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="#6366f1"/>
      <text x="64" y="84" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
    </svg>
  `)}`;

  return svg;
};
