const form = document.getElementById('asset-form');
const portfolioBody = document.getElementById('portfolio-body');
const portfolioTable = document.getElementById('portfolio-table');
const emptyState = document.getElementById('empty-state');
const totalValueEl = document.getElementById('total-value');
const totalPlEl = document.getElementById('total-pl');
const totalPlPctEl = document.getElementById('total-pl-pct');
const cancelEditBtn = document.getElementById('cancel-edit');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('theme-toggle');

const symbolToId = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  XRP: 'ripple',
  DOGE: 'dogecoin',
  LTC: 'litecoin',
  DOT: 'polkadot',
  BNB: 'binancecoin'
};

let portfolio = loadPortfolio();
let prices = {};
renderPortfolio();
refreshPrices();

function loadPortfolio() {
  try {
    const data = JSON.parse(localStorage.getItem('portfolio'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function savePortfolio() {
  localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

async function refreshPrices() {
  const ids = [...new Set(portfolio.map(p => symbolToId[p.asset.toUpperCase()]))].filter(Boolean);
  if (!ids.length) return;
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;
  try {
    const res = await fetch(url);
    prices = await res.json();
    renderPortfolio();
  } catch (e) {
    console.error('Price fetch failed', e);
  }
}

function renderPortfolio() {
  portfolioBody.innerHTML = '';
  if (!portfolio.length) {
    portfolioTable.classList.add('hidden');
    emptyState.classList.remove('hidden');
    totalValueEl.textContent = '0';
    totalPlEl.textContent = '0';
    totalPlPctEl.textContent = '0%';
    return;
  }
  portfolioTable.classList.remove('hidden');
  emptyState.classList.add('hidden');
  let totalValue = 0;
  let totalCost = 0;
  let totalPl = 0;
  portfolio.forEach((item) => {
    const id = symbolToId[item.asset.toUpperCase()];
    const price = prices[id]?.usd || 0;
    const value = item.quantity * price;
    const pl = (price - item.buy_price_usd) * item.quantity;
    totalValue += value;
    totalCost += item.quantity * item.buy_price_usd;
    totalPl += pl;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.asset}</td>
      <td>${item.quantity}</td>
      <td>${item.buy_price_usd.toFixed(2)}</td>
      <td>${price.toFixed(2)}</td>
      <td>${value.toFixed(2)}</td>
      <td class="${pl>=0?'':'neg'}">${pl.toFixed(2)}</td>
      <td>
        <button data-id="${item.id}" class="edit">Edit</button>
        <button data-id="${item.id}" class="delete">Delete</button>
      </td>`;
    portfolioBody.appendChild(tr);
  });
  totalValueEl.textContent = totalValue.toFixed(2);
  totalPlEl.textContent = totalPl.toFixed(2);
  const pct = totalCost ? (totalPl / totalCost * 100) : 0;
  totalPlPctEl.textContent = pct.toFixed(2) + '%';
}

portfolioBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit')) {
    const id = e.target.dataset.id;
    const item = portfolio.find(p => p.id === id);
    if (!item) return;
    document.getElementById('asset-id').value = item.id;
    document.getElementById('asset').value = item.asset;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('buy-price').value = item.buy_price_usd;
    document.getElementById('buy-date').value = item.buy_date || '';
    document.getElementById('notes').value = item.notes || '';
    cancelEditBtn.classList.remove('hidden');
    form.scrollIntoView({behavior:'smooth'});
  }
  if (e.target.classList.contains('delete')) {
    const id = e.target.dataset.id;
    portfolio = portfolio.filter(p => p.id !== id);
    savePortfolio();
    showToast('Entry deleted');
    renderPortfolio();
  }
});

cancelEditBtn.addEventListener('click', () => {
  form.reset();
  document.getElementById('asset-id').value = '';
  cancelEditBtn.classList.add('hidden');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const asset = document.getElementById('asset').value.trim().toUpperCase();
  const quantity = parseFloat(document.getElementById('quantity').value);
  const buyPrice = parseFloat(document.getElementById('buy-price').value);
  const buyDate = document.getElementById('buy-date').value;
  const notes = document.getElementById('notes').value.trim();

  let valid = true;
  if (!asset) {
    document.getElementById('asset-error').textContent = 'Required';
    valid = false;
  } else {
    document.getElementById('asset-error').textContent = '';
  }
  if (isNaN(quantity)) {
    document.getElementById('quantity-error').textContent = 'Required';
    valid = false;
  } else {
    document.getElementById('quantity-error').textContent = '';
  }
  if (isNaN(buyPrice)) {
    document.getElementById('buyprice-error').textContent = 'Required';
    valid = false;
  } else {
    document.getElementById('buyprice-error').textContent = '';
  }
  if (!valid) return;

  const idField = document.getElementById('asset-id');
  if (idField.value) {
    const idx = portfolio.findIndex(p => p.id === idField.value);
    if (idx > -1) {
      portfolio[idx] = { ...portfolio[idx], asset, quantity, buy_price_usd: buyPrice, buy_date: buyDate, notes };
      showToast('Entry updated');
    }
  } else {
    const id = crypto.randomUUID();
    portfolio.push({ id, asset, quantity, buy_price_usd: buyPrice, buy_date: buyDate, notes });
    showToast('Entry added');
  }
  savePortfolio();
  form.reset();
  idField.value = '';
  cancelEditBtn.classList.add('hidden');
  refreshPrices();
  renderPortfolio();
});

// theme toggle
(function initTheme(){
  const saved = localStorage.getItem('theme');
  if(saved==='dark') document.body.classList.add('dark');
})();

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', mode);
});
