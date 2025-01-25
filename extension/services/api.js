// API Service for Quantum Wallet Extension
const API_SERVICE = {
  BASE_URL: '', // Will be set dynamically based on current tab

  async initializeApiUrl() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      if (currentTab?.url) {
        const url = new URL(currentTab.url);
        if (url.hostname.includes('.repl.co')) {
          this.BASE_URL = `https://${url.hostname}`;
        } else {
          this.BASE_URL = 'http://localhost:5000';
        }
      }
      console.log('Using API base URL:', this.BASE_URL);
    } catch (error) {
      console.error('Error determining API URL:', error);
      this.BASE_URL = 'http://localhost:5000';
    }
  },

  async makeRequest(endpoint, options = {}) {
    if (!this.BASE_URL) {
      await this.initializeApiUrl();
    }

    const url = `${this.BASE_URL}${endpoint}`;
    console.log(`Making ${options.method || 'GET'} request to:`, url);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  // Auth endpoints
  async register({ username, password }) {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async login({ username, password }) {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async logout() {
    return this.makeRequest('/api/auth/logout', {
      method: 'POST'
    });
  },

  // Wallet endpoints with enhanced parameters
  async generateWallet(params) {
    const { chain, options = {} } = params;
    return this.makeRequest('/api/wallet/generate', {
      method: 'POST',
      body: JSON.stringify({
        chain,
        network: options.network || 'mainnet',
        walletType: options.walletType || 'default',
        encryption: options.encryption || 'quantum',
        derivationPath: options.derivationPath,
        mnemonicStrength: options.mnemonicStrength || 256,
        quantumAlgorithm: options.quantumAlgorithm || 'dilithium',
      })
    });
  },

  async getWalletBalance(params) {
    const { address, chain, options = {} } = params;
    return this.makeRequest('/api/wallet/balance', {
      method: 'POST',
      body: JSON.stringify({
        address,
        chain,
        network: options.network || 'mainnet',
        tokenAddress: options.tokenAddress, // For token balances
        tokenDecimals: options.tokenDecimals,
        tokenSymbol: options.tokenSymbol,
      })
    });
  },

  async getUserWallets(params = {}) {
    return this.makeRequest('/api/wallet', {
      method: 'GET',
      body: JSON.stringify({
        chain: params.chain, // Optional filter by chain
        network: params.network, // Optional filter by network
        includeBalances: params.includeBalances || false,
        includeTokens: params.includeTokens || false,
      })
    });
  },

  // Transaction endpoints with enhanced parameters
  async getTransactionHistory(params) {
    const { address, chain, options = {} } = params;
    return this.makeRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        address,
        chain,
        network: options.network || 'mainnet',
        limit: options.limit || 10,
        offset: options.offset || 0,
        startDate: options.startDate,
        endDate: options.endDate,
        type: options.type, // 'all', 'sent', 'received'
        tokenAddress: options.tokenAddress, // For token transactions
      })
    });
  },

  async sendTransaction(params) {
    const { fromAddress, toAddress, amount, chain, options = {} } = params;
    return this.makeRequest('/api/transaction/send', {
      method: 'POST',
      body: JSON.stringify({
        fromAddress,
        toAddress,
        amount,
        chain,
        network: options.network || 'mainnet',
        gasPrice: options.gasPrice, // For ETH
        gasLimit: options.gasLimit, // For ETH
        nonce: options.nonce,
        data: options.data, // For smart contract interactions
        memo: options.memo, // For chains that support memos
        tokenAddress: options.tokenAddress, // For token transfers
        tokenDecimals: options.tokenDecimals,
        tokenSymbol: options.tokenSymbol,
        priority: options.priority || 'medium', // 'low', 'medium', 'high'
        quantumSignature: options.quantumSignature || true,
      })
    });
  },

  // Settings endpoints
  async updateSettings(settings) {
    return this.makeRequest('/api/settings', {
      method: 'POST',
      body: JSON.stringify({
        ...settings,
        preferredCurrency: settings.preferredCurrency || 'USD',
        autoLockTimeout: settings.autoLockTimeout || 15,
        securityLevel: settings.securityLevel || 'high',
        networks: settings.networks || {
          ethereum: { enabled: true, network: 'mainnet' },
          bitcoin: { enabled: true, network: 'mainnet' },
          solana: { enabled: true, network: 'mainnet' },
        },
      })
    });
  },

  async exportWallets(params = {}) {
    return this.makeRequest('/api/wallet/export', {
      method: 'POST',
      body: JSON.stringify({
        format: params.format || 'json',
        chains: params.chains, // Array of chains to export
        includePrivateKeys: params.includePrivateKeys || false,
        encryptionPassword: params.encryptionPassword,
        quantumEncryption: params.quantumEncryption || true,
      })
    });
  },

  // Check current user
  async getCurrentUser() {
    try {
      const response = await this.makeRequest('/api/user', {
        method: 'GET'
      });
      return response;
    } catch (error) {
      if (error.message.includes('401')) {
        return null;
      }
      throw error;
    }
  }
};

export default API_SERVICE;