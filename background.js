// Listener for setting the browser proxy dynamically
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SET_PROXY') {
    const config = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: request.proxy.protocol.includes('socks') ? 'socks5' : 'http',
          host: request.proxy.ip,
          port: parseInt(request.proxy.port)
        },
        bypassList: ['localhost', '127.0.0.1']
      }
    };

    chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
      console.log('Proxy applied successfully');
      sendResponse({ status: 'success' });
    });
    return true;
  }

  if (request.type === 'CLEAR_PROXY') {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      sendResponse({ status: 'cleared' });
    });
    return true;
  }
});