const listContainer = document.getElementById('listContainer');
const refreshBtn = document.getElementById('refreshBtn');
const clearBtn = document.getElementById('clearBtn');
const regionFilter = document.getElementById('regionFilter');
const statusBadge = document.getElementById('proxyStatus');

async function fetchProxies() {
  listContainer.innerHTML = '<div class="loader">Syncing Live Nodes...</div>';
  
  const country = regionFilter.value !== 'all' ? `&country=${regionFilter.value}` : '';
  // Using GeoNode API for real, live, high-quality proxies
  const API_URL = `https://proxylist.geonode.com/api/proxy-list?limit=300&page=1&sort_by=lastChecked&sort_type=desc${country}`;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('API Rate Limit or Network Error');
    
    const data = await response.json();
    renderProxies(data.data);
  } catch (error) {
    listContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

function renderProxies(proxies) {
  listContainer.innerHTML = '';
  
  proxies.forEach(proxy => {
    const card = document.createElement('div');
    card.className = 'proxy-card';
    
    // Note: Public free proxies rarely use Auth, but structure is provided for Premium users
    const authString = 'None (Public)';
    
    card.innerHTML = `
      <div class="proxy-info">
        <div><span class="label">IP:</span> ${proxy.ip}</div>
        <div><span class="label">Port:</span> ${proxy.port}</div>
        <div><span class="label">Region:</span> ${proxy.country}</div>
        <div><span class="label">Type:</span> ${proxy.protocols[0]}</div>
        <div><span class="label">Latency:</span> ${proxy.latency}ms</div>
        <div><span class="label">Auth:</span> ${authString}</div>
      </div>
      <div class="proxy-actions">
        <button class="connect-btn" data-ip="${proxy.ip}" data-port="${proxy.port}" data-proto="${proxy.protocols[0]}">Connect</button>
      </div>
    `;
    
    card.querySelector('.connect-btn').addEventListener('click', (e) => {
      const p = e.target.dataset;
      applyProxy(p.ip, p.port, p.proto);
    });
    
    listContainer.appendChild(card);
  });
}

function applyProxy(ip, port, protocol) {
  chrome.runtime.sendMessage({
    type: 'SET_PROXY',
    proxy: { ip, port, protocol }
  }, (response) => {
    statusBadge.innerText = `Active: ${ip}`;
    statusBadge.style.borderColor = '#4ade80';
    statusBadge.style.color = '#4ade80';
  });
}

refreshBtn.addEventListener('click', fetchProxies);

clearBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'CLEAR_PROXY' }, () => {
    statusBadge.innerText = 'System: Direct';
    statusBadge.style.borderColor = 'var(--accent)';
    statusBadge.style.color = 'var(--text)';
  });
});

// Initial load
fetchProxies();