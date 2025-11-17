import crypto from 'crypto';

/**
 * OKX API Authentication Utility
 * Implements the authentication mechanism for OKX REST API v5
 */
export class OKXAuth {
  constructor(apiKey, secretKey, passphrase) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.passphrase = passphrase;
    this.baseUrl = 'https://www.okx.com';
  }

  /**
   * Generate signature for OKX API request
   * @param {string} timestamp - ISO timestamp
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} requestPath - API endpoint path
   * @param {string} body - Request body (empty string for GET requests)
   * @returns {string} Base64 encoded signature
   */
  generateSignature(timestamp, method, requestPath, body = '') {
    const message = timestamp + method.toUpperCase() + requestPath + body;
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * Get authentication headers for API request
   * @param {string} method - HTTP method
   * @param {string} requestPath - API endpoint path
   * @param {string} body - Request body (empty for GET)
   * @returns {Object} Headers object
   */
  getAuthHeaders(method, requestPath, body = '') {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(timestamp, method, requestPath, body);

    return {
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.passphrase,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated API request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint (e.g., '/api/v5/account/balance')
   * @param {Object} params - Query parameters for GET or body for POST
   * @returns {Promise<Object>} API response
   */
  async request(method, endpoint, params = null) {
    let requestPath = endpoint;
    let body = '';

    if (method.toUpperCase() === 'GET' && params) {
      const queryString = new URLSearchParams(params).toString();
      requestPath = queryString ? `${endpoint}?${queryString}` : endpoint;
    } else if (params) {
      body = JSON.stringify(params);
    }

    const headers = this.getAuthHeaders(method, requestPath, body);
    const url = `${this.baseUrl}${requestPath}`;

    try {
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: headers,
        body: method.toUpperCase() === 'GET' ? undefined : body
      });

      const data = await response.json();

      return {
        status: response.status,
        statusText: response.statusText,
        data: data
      };
    } catch (error) {
      return {
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Get trading account balance
   * @param {string} ccy - Optional currency filter (e.g., 'BTC' or 'BTC,ETH')
   * @returns {Promise<Object>} Trading account balance
   */
  async getAccountBalance(ccy = null) {
    const params = ccy ? { ccy } : null;
    return this.request('GET', '/api/v5/account/balance', params);
  }

  /**
   * Get funding account balance (includes earning accounts)
   * @param {string} ccy - Optional currency filter (e.g., 'BTC' or 'BTC,ETH')
   * @returns {Promise<Object>} Funding account balance
   */
  async getFundingBalance(ccy = null) {
    const params = ccy ? { ccy } : null;
    return this.request('GET', '/api/v5/asset/balances', params);
  }

  /**
   * Get Simple Earn (Savings) balance
   * @param {string} ccy - Optional currency filter (e.g., 'BTC' or 'BTC,ETH')
   * @returns {Promise<Object>} Savings balance
   */
  async getSavingsBalance(ccy = null) {
    const params = ccy ? { ccy } : null;
    return this.request('GET', '/api/v5/finance/savings/balance', params);
  }

  /**
   * Get account configuration
   * @returns {Promise<Object>} Account configuration
   */
  async getAccountConfig() {
    return this.request('GET', '/api/v5/account/config');
  }

  /**
   * Get positions
   * @param {string} instType - Instrument type (MARGIN, SWAP, FUTURES, OPTION)
   * @param {string} instId - Optional instrument ID
   * @returns {Promise<Object>} Positions
   */
  async getPositions(instType = null, instId = null) {
    const params = {};
    if (instType) params.instType = instType;
    if (instId) params.instId = instId;

    return this.request('GET', '/api/v5/account/positions', Object.keys(params).length ? params : null);
  }

  /**
   * Get recent fills (last 3 days)
   * @param {Object} options - Query options
   * @param {string} options.instType - Instrument type (SPOT, MARGIN, SWAP, FUTURES, OPTION)
   * @param {string} options.instId - Instrument ID (e.g., 'BTC-USDT')
   * @param {string} options.ordId - Order ID
   * @param {string} options.after - Pagination: earlier than this fill ID
   * @param {string} options.before - Pagination: newer than this fill ID
   * @param {number} options.limit - Number of results (default 100, max 100)
   * @returns {Promise<Object>} Fill history
   */
  async getFills(options = {}) {
    const params = {};
    if (options.instType) params.instType = options.instType;
    if (options.instId) params.instId = options.instId;
    if (options.ordId) params.ordId = options.ordId;
    if (options.after) params.after = options.after;
    if (options.before) params.before = options.before;
    if (options.limit) params.limit = options.limit;

    return this.request('GET', '/api/v5/trade/fills', Object.keys(params).length ? params : null);
  }

  /**
   * Get historical fills (last 3 months)
   * @param {Object} options - Query options
   * @param {string} options.instType - Instrument type (SPOT, MARGIN, SWAP, FUTURES, OPTION)
   * @param {string} options.instId - Instrument ID (e.g., 'BTC-USDT')
   * @param {string} options.ordId - Order ID
   * @param {string} options.after - Pagination: earlier than this fill ID
   * @param {string} options.before - Pagination: newer than this fill ID
   * @param {number} options.limit - Number of results (default 100, max 100)
   * @returns {Promise<Object>} Fill history
   */
  async getFillsHistory(options = {}) {
    const params = {};
    if (options.instType) params.instType = options.instType;
    if (options.instId) params.instId = options.instId;
    if (options.ordId) params.ordId = options.ordId;
    if (options.after) params.after = options.after;
    if (options.before) params.before = options.before;
    if (options.limit) params.limit = options.limit;

    return this.request('GET', '/api/v5/trade/fills-history', Object.keys(params).length ? params : null);
  }

  /**
   * Get all fills with automatic pagination (last 3 months)
   * @param {Object} options - Query options
   * @param {string} options.instType - Instrument type (SPOT, MARGIN, SWAP, FUTURES, OPTION)
   * @param {string} options.instId - Instrument ID (e.g., 'BTC-USDT')
   * @param {string} options.ordId - Order ID
   * @param {number} options.limit - Number of results per page (default 100, max 100)
   * @param {Function} options.onProgress - Callback function called with each page of results
   * @returns {Promise<Array>} All fills
   */
  async getAllFills(options = {}) {
    const allFills = [];
    let after = null;
    let pageCount = 0;
    const limit = options.limit || 100;

    while (true) {
      pageCount++;

      const queryOptions = {
        instType: options.instType,
        instId: options.instId,
        ordId: options.ordId,
        limit: limit
      };

      if (after) {
        queryOptions.after = after;
      }

      // Use fills-history for complete historical data (3 months)
      const response = await this.getFillsHistory(queryOptions);

      if (response.error) {
        throw new Error(`API Error: ${response.error}`);
      }

      if (response.data?.code !== '0') {
        throw new Error(`API returned error code ${response.data?.code}: ${response.data?.msg}`);
      }

      const fills = response.data?.data || [];

      if (fills.length === 0) {
        break;
      }

      allFills.push(...fills);

      // Call progress callback if provided
      if (options.onProgress) {
        options.onProgress({
          page: pageCount,
          fillsInPage: fills.length,
          totalFills: allFills.length,
          latestFill: fills[0],
          oldestFill: fills[fills.length - 1]
        });
      }

      // Check if there are more pages
      if (fills.length < limit) {
        break; // Last page
      }

      // Set 'after' to the last fill ID for next iteration
      after = fills[fills.length - 1].billId;

      // Rate limiting: wait 250ms between requests (max 10 requests per 2 seconds)
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    return allFills;
  }

  /**
   * Get current account balance for all currencies
   * @returns {Promise<Object>} Account balance
   */
  async getBalance() {
    return this.request('GET', '/api/v5/account/balance');
  }

  /**
   * Get ticker price for a specific instrument
   * @param {string} instId - Instrument ID (e.g., 'BTC-USDT')
   * @returns {Promise<Object>} Ticker data
   */
  async getTicker(instId) {
    return this.request('GET', '/api/v5/market/ticker', { instId });
  }

  /**
   * Get ticker prices for multiple instruments
   * @param {string} instType - Instrument type (SPOT, SWAP, FUTURES, etc.)
   * @returns {Promise<Object>} Ticker data for all instruments of that type
   */
  async getTickers(instType) {
    return this.request('GET', '/api/v5/market/tickers', { instType });
  }

  /**
   * Get all fills across all instrument types
   * @param {Function} onProgress - Optional progress callback
   * @returns {Promise<Array>} All fills from all instrument types
   */
  async getAllFillsAllTypes(onProgress) {
    const instTypes = ['SPOT', 'MARGIN', 'SWAP', 'FUTURES', 'OPTION'];
    const allFills = [];

    for (const instType of instTypes) {
      try {
        const fills = await this.getAllFills({
          instType: instType,
          limit: 100,
          onProgress: onProgress ? (progress) => {
            onProgress({
              ...progress,
              instType: instType
            });
          } : undefined
        });

        allFills.push(...fills);
      } catch (error) {
        // Skip instrument types with no access or data
        if (!error.message.includes('50013') && !error.message.includes('50111')) {
          console.warn(`Warning fetching ${instType} fills:`, error.message);
        }
      }
    }

    return allFills;
  }
}
