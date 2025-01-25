import API_SERVICE from './services/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // UI Elements
  const loginSection = document.getElementById('loginSection');
  const signupSection = document.getElementById('signupSection');
  const mainContent = document.getElementById('mainContent');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignupBtn = document.getElementById('showSignup');
  const showLoginBtn = document.getElementById('showLogin');
  const logoutBtn = document.getElementById('logoutBtn');
  const username = document.getElementById('username');
  const notification = document.getElementById('notification');
  const walletOptions = document.querySelectorAll('.wallet-option');
  const tabButtons = document.querySelectorAll('.tab-button');


  let currentWallet = null;

  // UI Helpers
  const showNotification = (message, isError = false) => {
    notification.textContent = message;
    notification.className = `notification show ${isError ? 'error' : ''}`;
    setTimeout(() => {
      notification.className = 'notification';
    }, 3000);
  };

  const showLoadingState = (element, isLoading) => {
    if (!element) return;
    const originalText = element.textContent;
    element.disabled = isLoading;
    if (isLoading) {
      element.setAttribute('data-original-text', originalText);
      element.innerHTML = '<span class="loading"></span> Processing...';
    } else {
      element.textContent = element.getAttribute('data-original-text') || originalText;
    }
  };

  const showSection = (section) => {
    // Hide all sections
    [loginSection, signupSection, mainContent].forEach(el => {
      if (el) el.style.display = 'none';
    });
    // Show the requested section
    if (section) section.style.display = 'block';
  };

  const switchTab = (tabName, tabContainer) => {
    const forms = tabContainer.querySelectorAll('.tab-pane');
    forms.forEach(form => form.classList.remove('active'));
    const activeForm = tabContainer.querySelector(`#${tabName}Form`);
    if (activeForm) activeForm.classList.add('active');
  };

  // Initialize API and check auth status
  const initialize = async () => {
    try {
      await API_SERVICE.initializeApiUrl();
      const user = await API_SERVICE.getCurrentUser();

      if (user) {
        if (username) username.textContent = user.username;
        showSection(mainContent);
        await loadUserWallets();
      } else {
        showSection(loginSection);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      showNotification('Failed to initialize application', true);
      showSection(loginSection);
    }
  };

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    showLoadingState(submitBtn, true);

    try {
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;

      await API_SERVICE.login({ username, password });
      showSection(mainContent);
      await loadUserWallets();
      showNotification('Login successful');
      loginForm.reset();
    } catch (error) {
      console.error('Login error:', error);
      showNotification(error.message || 'Login failed', true);
    } finally {
      showLoadingState(submitBtn, false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    showLoadingState(submitBtn, true);

    try {
      const username = document.getElementById('signupUsername').value;
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await API_SERVICE.register({ username, password });
      showSection(mainContent);
      await loadUserWallets();
      showNotification('Account created successfully');
      signupForm.reset();
    } catch (error) {
      console.error('Signup error:', error);
      showNotification(error.message || 'Registration failed', true);
    } finally {
      showLoadingState(submitBtn, false);
    }
  };

  // Wallet Management
  const handleWalletCreation = async (event) => {
    const button = event.currentTarget;
    const chain = button.getAttribute('data-chain');
    if (!chain) return;

    showLoadingState(button, true);
    try {
      showNotification('Generating quantum-enhanced wallet...');

      // Enhanced parameters for wallet generation
      const result = await API_SERVICE.generateWallet({
        chain,
        options: {
          network: 'mainnet',
          walletType: 'default',
          encryption: 'quantum',
          mnemonicStrength: 256,
          quantumAlgorithm: 'dilithium',
        }
      });

      if (result.success) {
        currentWallet = result.wallet;
        await loadUserWallets();
        showNotification('Wallet created successfully!');
      }
    } catch (error) {
      console.error('Wallet creation error:', error);
      showNotification(error.message || 'Failed to create wallet', true);
    } finally {
      showLoadingState(button, false);
    }
  };

  const loadUserWallets = async () => {
    const walletList = document.getElementById('walletList');
    if (!walletList) return;

    try {
      const { wallets } = await API_SERVICE.getUserWallets({
        includeBalances: true,
        includeTokens: true
      });

      walletList.innerHTML = '';

      if (!wallets || wallets.length === 0) {
        walletList.innerHTML = '<div class="empty-state">No wallets found. Create one to get started!</div>';
        return;
      }

      for (const wallet of wallets) {
        try {
          const balance = await API_SERVICE.getWalletBalance({
            address: wallet.address,
            chain: wallet.chain,
            options: {
              network: wallet.network || 'mainnet',
              includeTokens: true
            }
          });

          const walletElement = document.createElement('div');
          walletElement.className = 'wallet-item';
          walletElement.innerHTML = `
            <div class="wallet-details">
              <h3>${wallet.chain}</h3>
              <p class="address">${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}</p>
              <p class="balance">Balance: ${balance.total}</p>
              ${balance.tokens ? `<p class="tokens">Tokens: ${balance.tokens.length}</p>` : ''}
            </div>
            <button class="copy-address" data-address="${wallet.address}">Copy Address</button>
          `;
          walletElement.addEventListener('click', () => showWalletDetails(wallet));
          walletList.appendChild(walletElement);
        } catch (error) {
          console.error('Error loading wallet balance:', error);
        }
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
      showNotification('Failed to load wallets', true);
      walletList.innerHTML = '<div class="error-state">Failed to load wallets. Please try again.</div>';
    }
  };

  const showWalletDetails = (wallet) => {
    const walletInfo = document.getElementById('walletInfo');
    if (!walletInfo) return;

    currentWallet = wallet;
    const chainElement = document.getElementById('walletChain');
    const addressElement = document.getElementById('walletAddress');
    const balanceElement = document.getElementById('balance');

    if (chainElement) chainElement.textContent = wallet.chain;
    if (addressElement) addressElement.textContent = wallet.address;
    if (balanceElement) balanceElement.textContent = 'Loading balance...';

    showSection(walletInfo);

    // Load balance immediately
    API_SERVICE.getWalletBalance(wallet.address, wallet.chain)
      .then(balance => {
        if (balanceElement) balanceElement.textContent = `Balance: ${balance}`;
      })
      .catch(error => {
        console.error('Error fetching balance:', error);
        if (balanceElement) balanceElement.textContent = 'Failed to load balance';
      });
  };

  // Transaction History Management
  const loadTransactionHistory = async (address, chain) => {
    try {
      const { transactions } = await API_SERVICE.getTransactionHistory({
        address,
        chain,
        options: {
          limit: 20,
          network: 'mainnet',
          includeTokenTransfers: true,
        }
      });

      const transactionList = document.getElementById('transactionList');
      if (!transactionList) return;
      transactionList.innerHTML = '';

      if (!transactions || transactions.length === 0) {
        transactionList.innerHTML = '<div class="empty-state">No transactions found.</div>';
        return;
      }

      transactions.forEach(tx => {
        const txElement = document.createElement('div');
        txElement.className = 'transaction-item';
        txElement.innerHTML = `
          <div class="tx-type">${tx.type}</div>
          <div class="tx-amount">
            ${tx.tokenSymbol ? `${tx.amount} ${tx.tokenSymbol}` : tx.amount}
          </div>
          <div class="tx-date">${new Date(tx.date).toLocaleString()}</div>
          <div class="tx-status ${tx.status.toLowerCase()}">${tx.status}</div>
        `;
        transactionList.appendChild(txElement);
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
      showNotification('Failed to load transaction history', true);
    }
  };



  // Settings Management
  const handleSettingsUpdate = async () => {
    try {
      const autoRefresh = document.getElementById('autoRefresh')?.checked;
      const showNotifications = document.getElementById('showNotifications')?.checked;

      if (autoRefresh === null || showNotifications === null) return;

      await API_SERVICE.updateSettings({ autoRefresh, showNotifications });
      showNotification('Settings updated successfully');
    } catch (error) {
      console.error('Settings update error:', error);
      showNotification('Failed to update settings', true);
    }
  };

  const handleWalletExport = async () => {
    try {
      const exportData = await API_SERVICE.exportWallets();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quantum-wallets.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Wallets exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Failed to export wallets', true);
    }
  };

  // Event Listeners
  loginForm?.addEventListener('submit', handleLogin);
  signupForm?.addEventListener('submit', handleSignup);

  showSignupBtn?.addEventListener('click', () => showSection(signupSection));
  showLoginBtn?.addEventListener('click', () => showSection(loginSection));

  // Auth tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      if (!tabName) return;

      // Handle different tab contexts
      if (['login', 'signup'].includes(tabName)) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        switchTab(tabName, loginSection); // Assuming both login and signup are within loginSection container. Adjust if needed.
      } else {
        // Handle main content tabs
        const allTabs = document.querySelectorAll('.tab-content');
        allTabs.forEach(tab => {
          if (tab) tab.style.display = 'none';
        });
        const selectedTab = document.getElementById(`${tabName}Tab`);
        if (selectedTab) {
          selectedTab.style.display = 'block';
          if (tabName === 'transactions' && currentWallet) {
            loadTransactionHistory(currentWallet.address, currentWallet.chain);
          }
        }
      }
    });
  });

  walletOptions.forEach(option => {
    option.addEventListener('click', handleWalletCreation);
  });

  logoutBtn?.addEventListener('click', async () => {
    try {
      await API_SERVICE.logout();
      currentWallet = null;
      showNotification('Logged out successfully');
      showSection(loginSection);
    } catch (error) {
      showNotification('Failed to logout', true);
    }
  });

  // Copy address functionality
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('copy-address')) {
      e.stopPropagation(); // Prevent wallet details from opening
      const address = e.target.getAttribute('data-address');
      if (!address) return;

      try {
        await navigator.clipboard.writeText(address);
        showNotification('Address copied to clipboard');
      } catch (error) {
        console.error('Copy error:', error);
        showNotification('Failed to copy address', true);
      }
    }
  });

  // Settings event listeners
  document.getElementById('autoRefresh')?.addEventListener('change', handleSettingsUpdate);
  document.getElementById('showNotifications')?.addEventListener('change', handleSettingsUpdate);
  document.getElementById('exportWallets')?.addEventListener('click', handleWalletExport);

  // Refresh buttons
  document.getElementById('refreshWallets')?.addEventListener('click', loadUserWallets);
  document.getElementById('refreshTransactions')?.addEventListener('click', async () => {
    if (currentWallet) {
      await loadTransactionHistory(currentWallet.address, currentWallet.chain);
    }
  });

  document.getElementById('refreshBalance')?.addEventListener('click', async () => {
    if (currentWallet) {
      try {
        const balance = await API_SERVICE.getWalletBalance(currentWallet.address, currentWallet.chain);
        document.getElementById('balance')?.textContent = `Balance: ${balance}`;
        showNotification('Balance updated');
      } catch (error) {
        showNotification('Failed to refresh balance', true);
      }
    }
  });

  // Initialize
  await initialize();
});