// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Quantum Wallet Extension installed');
  initializeExtension();
});

let API_BASE = 'http://localhost:5000';

async function initializeExtension() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    if (currentTab?.url) {
      const url = new URL(currentTab.url);
      if (url.hostname.includes('.repl.co')) {
        API_BASE = `https://${url.hostname}`;
      }
    }
    // Verify API is accessible
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      mode: 'cors'
    });
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status}`);
    }
    console.log('Extension initialized with API base:', API_BASE);
  } catch (error) {
    console.error('Extension initialization error:', error);
    // Fallback to default API_BASE
    API_BASE = 'http://0.0.0.0:5000';
    console.log('Falling back to default API base:', API_BASE);
  }
}

async function makeApiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    console.log(`Making ${options.method || 'GET'} request to:`, url);

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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API response from ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);

  if (request.type === 'API_REQUEST') {
    makeApiRequest(request.endpoint, request.options)
      .then(data => {
        console.log('API request successful:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('API request failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async response
  }

  if (request.type === 'GET_BALANCE') {
    makeApiRequest('/api/wallet/balance', {
      method: 'POST',
      body: JSON.stringify({
        chain: request.chain,
        address: request.address,
      }),
    })
      .then(data => sendResponse({ success: true, balance: data.balance }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.type === 'GET_TRANSACTIONS') {
    makeApiRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        chain: request.chain,
        address: request.address,
      }),
    })
      .then(data => sendResponse({ success: true, transactions: data.transactions }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.type === 'OPEN_LOGIN_PAGE') {
    chrome.tabs.create({ url: `${API_BASE}/login` });
    return true;
  }
});