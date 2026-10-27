'use strict';

/* =========================================================
   CONFIGURATION — edit these values to customise the site
   ========================================================= */
const CONFIG = {
  restaurantName: 'Spice Route Kitchen',
  tagline: 'Freshly cooked. Delivered hot. Order in minutes on WhatsApp.',
  whatsappNumber: '919747947772',   // country code + number, digits only (no + or spaces)
  deliveryCharge: 0,                // in rupees; 0 = no delivery charge
  currency: '₹',
  categories: ['Starters', 'Mains', 'Biryani', 'Breads', 'Desserts', 'Drinks'],
  heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=70',
  placeholderImage: 'assets/placeholder.svg',
  maxQtyPerItem: 20,
  menuKey: 'rm_menu_v1',
  cartKey: 'rm_cart_v1'
};

/* Sample menu — shown on first visit and by "Reset Sample Menu" */
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;
const SAMPLE_MENU = [
  { id: 's1', name: 'Paneer Tikka', description: 'Char-grilled cottage cheese with peppers and mint chutney.', price: 240, category: 'Starters', image: img('1567188040759-fb8a883dc6d8'), available: true },
  { id: 's2', name: 'Chicken 65', description: 'Crispy, spicy South Indian fried chicken with curry leaves.', price: 260, category: 'Starters', image: img('1610057099443-fde8c4d50f91'), available: true },
  { id: 's3', name: 'Veg Spring Rolls', description: 'Crunchy rolls stuffed with seasoned vegetables.', price: 180, category: 'Starters', image: img('1606755962773-d324e0a13086'), available: true },
  { id: 'm1', name: 'Butter Chicken', description: 'Tender chicken in a creamy tomato-butter gravy.', price: 320, category: 'Mains', image: img('1603894584373-5ac82b2ae398'), available: true },
  { id: 'm2', name: 'Paneer Butter Masala', description: 'Soft paneer cubes in a rich, mildly sweet gravy.', price: 280, category: 'Mains', image: img('1631452180519-c014fe946bc7'), available: true },
  { id: 'm3', name: 'Dal Tadka', description: 'Yellow lentils tempered with garlic, cumin and ghee.', price: 180, category: 'Mains', image: img('1546833999-b9f581a1996d'), available: true },
  { id: 'm4', name: 'Kerala Fish Curry', description: 'Tangy coconut-based curry with kokum and spices.', price: 340, category: 'Mains', image: img('1626777552726-4a6b54c97e46'), available: false },
  { id: 'b1', name: 'Chicken Dum Biryani', description: 'Slow-cooked basmati rice layered with marinated chicken.', price: 280, category: 'Biryani', image: img('1563379091339-03b21ab4a4f8'), available: true },
  { id: 'b2', name: 'Veg Biryani', description: 'Fragrant rice with seasonal vegetables and saffron.', price: 220, category: 'Biryani', image: img('1589302168068-964664d93dc0'), available: true },
  { id: 'b3', name: 'Mutton Biryani', description: 'Aromatic rice with tender mutton, served with raita.', price: 380, category: 'Biryani', image: img('1633945274405-b6c8069047b0'), available: false },
  { id: 'r1', name: 'Butter Naan', description: 'Soft tandoor-baked bread brushed with butter.', price: 45, category: 'Breads', image: img('1601050690597-df0568f70950'), available: true },
  { id: 'r2', name: 'Malabar Parotta', description: 'Flaky, layered Kerala-style flatbread.', price: 30, category: 'Breads', image: img('1626074353765-517a681e40be'), available: true },
  { id: 'd1', name: 'Gulab Jamun', description: 'Warm milk dumplings soaked in rose-cardamom syrup.', price: 90, category: 'Desserts', image: img('1666190094762-2f7a1e0f7a8d'), available: true },
  { id: 'd2', name: 'Palada Payasam', description: 'Creamy rice-flake pudding with cardamom and cashews.', price: 110, category: 'Desserts', image: img('1589119908995-c6837fa14848'), available: true },
  { id: 'k1', name: 'Fresh Lime Soda', description: 'Sweet or salted, chilled and fizzy.', price: 60, category: 'Drinks', image: img('1513558161293-cdaf765ed2fd'), available: true },
  { id: 'k2', name: 'Masala Chai', description: 'Hot spiced tea brewed with milk and ginger.', price: 30, category: 'Drinks', image: img('1571934811356-5cc061b6821f'), available: true },
  { id: 'k3', name: 'Sweet Lassi', description: 'Thick, chilled yogurt drink.', price: 80, category: 'Drinks', image: img('1626200419199-391ae4be7a41'), available: true }
];

/* =========================================================
   State & helpers
   ========================================================= */
const state = { menu: [], cart: {}, category: 'All', query: '', editId: null };
const $ = (sel) => document.querySelector(sel);

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const toPaise = (rupees) => Math.round(Number(rupees) * 100);
const fmt = (paise) => CONFIG.currency + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 });
const safeImage = (url) => (/^(https?:\/\/|assets\/)/i.test(String(url || '').trim()) ? String(url).trim() : CONFIG.placeholderImage);
const cloneSample = () => JSON.parse(JSON.stringify(SAMPLE_MENU));

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { toast('Could not save — browser storage is unavailable.'); }
}

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}

/* =========================================================
   Data: menu & cart
   ========================================================= */
function sanitizeMenu(list) {
  return list
    .filter((m) => m && typeof m.id === 'string' && typeof m.name === 'string' && Number(m.price) > 0)
    .map((m) => ({
      id: m.id,
      name: clean(m.name).slice(0, 60),
      description: clean(m.description).slice(0, 140),
      price: Math.round(Number(m.price) * 100) / 100,
      category: CONFIG.categories.includes(m.category) ? m.category : CONFIG.categories[0],
      image: String(m.image || ''),
      available: m.available !== false
    }));
}

function loadMenu() {
  const stored = readStore(CONFIG.menuKey, null);
  if (Array.isArray(stored)) return sanitizeMenu(stored);
  const sample = cloneSample();
  writeStore(CONFIG.menuKey, sample);
  return sample;
}

function loadCart() {
  const stored = readStore(CONFIG.cartKey, {});
  const cart = {};
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    Object.keys(stored).forEach((id) => {
      const qty = parseInt(stored[id], 10);
      if (qty > 0) cart[id] = Math.min(qty, CONFIG.maxQtyPerItem);
    });
  }
  return cart;
}

/* Drop cart entries whose item was deleted or is unavailable. Returns number removed. */
function reconcileCart() {
  let removed = 0;
  Object.keys(state.cart).forEach((id) => {
    const item = state.menu.find((m) => m.id === id);
    if (!item || !item.available) { delete state.cart[id]; removed++; }
  });
  if (removed) writeStore(CONFIG.cartKey, state.cart);
  return removed;
}

function setQty(id, qty) {
  const item = state.menu.find((m) => m.id === id);
  if (qty > 0 && (!item || !item.available)) { toast('Sorry, this item is currently unavailable.'); return; }
  if (qty > CONFIG.maxQtyPerItem) { qty = CONFIG.maxQtyPerItem; toast(`Maximum ${CONFIG.maxQtyPerItem} per item.`); }
  if (qty <= 0) delete state.cart[id]; else state.cart[id] = qty;
  writeStore(CONFIG.cartKey, state.cart);
  renderAll();
}

function getTotals() {
  const lines = Object.keys(state.cart).map((id) => {
    const item = state.menu.find((m) => m.id === id);
    if (!item || !item.available) return null;
    return { item, qty: state.cart[id], total: toPaise(item.price) * state.cart[id] };
  }).filter(Boolean);
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const delivery = lines.length ? toPaise(CONFIG.deliveryCharge) : 0;
  return { lines, subtotal, delivery, total: subtotal + delivery, count: lines.reduce((n, l) => n + l.qty, 0) };
}

/* =========================================================
   Checkout: validation + WhatsApp message
   ========================================================= */
function normalizePhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

function validateCheckout(data) {
  const errors = {};
  if (data.name.length < 2) errors.name = 'Please enter your name.';
  if (!/^[6-9]\d{9}$/.test(data.phone)) errors.phone = 'Enter a valid 10-digit mobile number.';
  if (data.address.length < 8) errors.address = 'Please enter your full delivery address.';
  return errors;
}

function buildOrderMessage(c, t) {
  const rows = t.lines.map((l) => `${l.item.name} x ${l.qty} = ${fmt(l.total)}`);
  return [
    'NEW ORDER', '',
    `Customer Name: ${c.name}`,
    `Customer Phone: +91 ${c.phone}`,
    `Delivery Address: ${c.address}`,
    `Landmark: ${c.landmark || '-'}`, '',
    'ORDER ITEMS:', ...rows, '',
    `Subtotal: ${fmt(t.subtotal)}`,
    `Delivery Charge: ${fmt(t.delivery)}`,
    `Grand Total: ${fmt(t.total)}`, '',
    `Order Notes: ${c.notes || '-'}`
  ].join('\n');
}

const buildWhatsAppUrl = (message) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

function readCheckoutForm() {
  const f = $('#checkoutForm').elements;
  return {
    name: clean(f.name.value),
    phone: normalizePhone(f.phone.value),
    address: clean(f.address.value),
    landmark: clean(f.landmark.value),
    notes: clean(f.notes.value)
  };
}

function showFieldErrors(errors) {
  ['name', 'phone', 'address'].forEach((field) => {
    const input = $('#checkoutForm').elements[field];
    $('#err-' + field).textContent = errors[field] || '';
    input.setAttribute('aria-invalid', errors[field] ? 'true' : 'false');
  });
  const first = Object.keys(errors)[0];
  if (first) $('#checkoutForm').elements[first].focus();
}

function submitOrder() {
  if (reconcileCart()) { renderAll(); toast('Unavailable items were removed from your cart.'); }
  const t = getTotals();
  if (!t.lines.length) { toast('Your cart is empty.'); showView('cart'); return; }

  const data = readCheckoutForm();
  const errors = validateCheckout(data);
  showFieldErrors(errors);
  if (Object.keys(errors).length) return;

  const link = $('#waLink');
  link.href = buildWhatsAppUrl(buildOrderMessage(data, t));
  $('#waNotice').hidden = false;
  link.click();            // opens WhatsApp; the cart is kept until the customer clears it
}

/* =========================================================
   Rendering
   ========================================================= */
function renderChips() {
  const used = CONFIG.categories.filter((c) => state.menu.some((m) => m.category === c));
  if (state.category !== 'All' && !used.includes(state.category)) state.category = 'All';
  $('#chips').innerHTML = ['All', ...used].map((c) =>
    `<button class="chip${c === state.category ? ' active' : ''}" data-act="cat" data-id="${esc(c)}">${esc(c)}</button>`).join('');
}

function cardAction(item) {
  const id = esc(item.id);
  const qty = state.cart[item.id] || 0;
  if (!item.available) return '<button class="btn btn-add" disabled>Unavailable</button>';
  if (!qty) return `<button class="btn btn-add" data-act="add" data-id="${id}">Add to Cart</button>`;
  return `<div class="stepper">
    <button data-act="dec" data-id="${id}" aria-label="Decrease ${esc(item.name)}">−</button>
    <span aria-live="polite">${qty}</span>
    <button data-act="inc" data-id="${id}" aria-label="Increase ${esc(item.name)}">+</button></div>`;
}

function renderMenu() {
  const q = state.query.toLowerCase();
  const items = state.menu.filter((m) =>
    (state.category === 'All' || m.category === state.category) &&
    (!q || (m.name + ' ' + m.description).toLowerCase().includes(q)));

  $('#menuGrid').innerHTML = items.map((m) => `
    <article class="card${m.available ? '' : ' unavailable'}">
      <img src="${esc(safeImage(m.image))}" alt="${esc(m.name)}" loading="lazy" width="600" height="400">
      <div class="card-body">
        <h3>${esc(m.name)}</h3>
        <p class="desc">${esc(m.description)}</p>
        <div class="card-meta">
          <span class="price">${fmt(toPaise(m.price))}</span>
          <span class="pill ${m.available ? 'ok' : 'off'}">${m.available ? 'Available' : 'Unavailable'}</span>
        </div>
        <div class="card-action">${cardAction(m)}</div>
      </div>
    </article>`).join('');

  const none = !items.length;
  $('#noResults').hidden = !none;
  $('#noResults').textContent = state.menu.length ? 'No dishes match your search.' : 'The menu is empty. Use "Manage menu" to add dishes.';
}

const totalsHtml = (t) => `
  <div><dt>Subtotal</dt><dd>${fmt(t.subtotal)}</dd></div>
  <div><dt>Delivery charge</dt><dd>${fmt(t.delivery)}${t.delivery ? '' : ' <small>(none set)</small>'}</dd></div>
  <div class="grand"><dt>Total</dt><dd>${fmt(t.total)}</dd></div>`;

function renderCart() {
  const t = getTotals();
  $('#cartEmpty').hidden = t.lines.length > 0;
  $('#cartTotals').hidden = !t.lines.length;
  $('#cartList').innerHTML = t.lines.map((l) => {
    const id = esc(l.item.id);
    return `<li class="cart-line">
      <img src="${esc(safeImage(l.item.image))}" alt="" width="56" height="56">
      <div>
        <div class="name">${esc(l.item.name)}</div>
        <div class="unit">${fmt(toPaise(l.item.price))} each</div>
        <div class="stepper">
          <button data-act="dec" data-id="${id}" aria-label="Decrease ${esc(l.item.name)}">−</button>
          <span>${l.qty}</span>
          <button data-act="inc" data-id="${id}" aria-label="Increase ${esc(l.item.name)}">+</button>
        </div>
      </div>
      <div class="line-end"><strong>${fmt(l.total)}</strong>
        <button class="link" data-act="remove" data-id="${id}">Remove</button></div>
    </li>`;
  }).join('');
  $('#cartTotals').innerHTML = totalsHtml(t);
  $('#checkoutBtn').disabled = !t.lines.length;
  $('#clearCartBtn').hidden = !t.lines.length;

  $('#orderSummary').innerHTML = t.lines.map((l) =>
    `<li><span>${esc(l.item.name)} × ${l.qty}</span><strong>${fmt(l.total)}</strong></li>`).join('');
  $('#summaryTotals').innerHTML = totalsHtml(t);

  $('#cartCountTop').textContent = t.count;
  $('#fabCount').textContent = t.count;
  $('#fabTotal').textContent = fmt(t.subtotal);
  $('#cartFab').hidden = !t.count;
}

function renderAdminList() {
  $('#adminList').innerHTML = state.menu.map((m) => `
    <li>
      <div><strong>${esc(m.name)}</strong>
        <div class="meta">${esc(m.category)} · ${fmt(toPaise(m.price))} · ${m.available ? 'Available' : 'Unavailable'}</div></div>
      <div class="btns">
        <button class="link" data-act="edit" data-id="${esc(m.id)}">Edit</button>
        <button class="link" data-act="toggle" data-id="${esc(m.id)}">Mark ${m.available ? 'unavailable' : 'available'}</button>
        <button class="link danger" data-act="del" data-id="${esc(m.id)}">Delete</button>
      </div>
    </li>`).join('') || '<li class="meta">No items yet.</li>';
}

function renderAll() {
  renderChips();
  renderMenu();
  renderCart();
  renderAdminList();
}

/* =========================================================
   Panels
   ========================================================= */
let openPanelEl = null;
function openPanel(id) {
  closePanel();
  openPanelEl = $(id);
  openPanelEl.hidden = false;
  $('#overlay').hidden = false;
  document.body.classList.add('locked');
  const btn = openPanelEl.querySelector('.icon-btn');
  if (btn) btn.focus();
}
function closePanel() {
  if (!openPanelEl) return;
  openPanelEl.hidden = true;
  $('#overlay').hidden = true;
  document.body.classList.remove('locked');
  openPanelEl = null;
}
function showView(view) {
  $('#cartView').hidden = view !== 'cart';
  $('#checkoutView').hidden = view !== 'checkout';
  $('#cartTitle').textContent = view === 'cart' ? 'Your Cart' : 'Checkout';
}

/* =========================================================
   Menu management (admin panel)
   ========================================================= */
function resetItemForm() {
  const form = $('#itemForm');
  form.reset();
  form.elements.id.value = '';
  form.elements.available.checked = true;
  state.editId = null;
  $('#itemFormTitle').textContent = 'Add item';
  $('#itemSubmit').textContent = 'Add item';
  $('#itemCancel').hidden = true;
  $('#itemError').textContent = '';
}

function startEdit(id) {
  const m = state.menu.find((x) => x.id === id);
  if (!m) return;
  const f = $('#itemForm').elements;
  f.id.value = m.id; f.name.value = m.name; f.description.value = m.description;
  f.price.value = m.price; f.category.value = m.category; f.image.value = m.image; f.available.checked = m.available;
  state.editId = id;
  $('#itemFormTitle').textContent = 'Edit item';
  $('#itemSubmit').textContent = 'Save changes';
  $('#itemCancel').hidden = false;
  $('#itemForm').scrollIntoView({ block: 'start' });
  f.name.focus();
}

function saveItem() {
  const f = $('#itemForm').elements;
  const item = {
    id: state.editId || 'i' + Date.now().toString(36),
    name: clean(f.name.value),
    description: clean(f.description.value),
    price: Math.round(Number(f.price.value) * 100) / 100,
    category: f.category.value,
    image: clean(f.image.value),
    available: f.available.checked
  };
  let error = '';
  if (!item.name) error = 'Please enter a name.';
  else if (!(item.price > 0) || item.price > 100000) error = 'Enter a price greater than 0.';
  else if (item.image && !/^(https?:\/\/|assets\/)/i.test(item.image)) error = 'Image URL must start with https:// or assets/.';
  $('#itemError').textContent = error;
  if (error) return;

  const index = state.menu.findIndex((m) => m.id === item.id);
  if (index >= 0) state.menu[index] = item; else state.menu.push(item);
  writeStore(CONFIG.menuKey, state.menu);
  reconcileCart();
  resetItemForm();
  renderAll();
  toast(index >= 0 ? 'Item updated.' : 'Item added.');
}

function toggleAvailable(id) {
  const m = state.menu.find((x) => x.id === id);
  if (!m) return;
  m.available = !m.available;
  writeStore(CONFIG.menuKey, state.menu);
  reconcileCart();
  renderAll();
}

function deleteItem(id) {
  const m = state.menu.find((x) => x.id === id);
  if (!m || !window.confirm(`Delete "${m.name}"?`)) return;
  state.menu = state.menu.filter((x) => x.id !== id);
  writeStore(CONFIG.menuKey, state.menu);
  reconcileCart();
  if (state.editId === id) resetItemForm();
  renderAll();
}

function resetSampleMenu() {
  if (!window.confirm('Replace the current menu with the sample menu?')) return;
  state.menu = cloneSample();
  writeStore(CONFIG.menuKey, state.menu);
  reconcileCart();
  resetItemForm();
  renderAll();
  toast('Sample menu restored.');
}

/* =========================================================
   Events
   ========================================================= */
const actions = {
  add: (id) => setQty(id, (state.cart[id] || 0) + 1),
  inc: (id) => setQty(id, (state.cart[id] || 0) + 1),
  dec: (id) => setQty(id, (state.cart[id] || 0) - 1),
  remove: (id) => setQty(id, 0),
  cat: (id) => { state.category = id; renderChips(); renderMenu(); },
  'open-cart': () => { showView('cart'); openPanel('#cartPanel'); },
  'open-admin': () => openPanel('#adminPanel'),
  checkout: () => { $('#waNotice').hidden = true; showView('checkout'); },
  back: () => showView('cart'),
  clear: () => { state.cart = {}; writeStore(CONFIG.cartKey, state.cart); renderAll(); },
  close: closePanel,
  edit: startEdit,
  toggle: toggleAvailable,
  del: deleteItem,
  'cancel-edit': resetItemForm,
  'reset-menu': resetSampleMenu
};

function bindEvents() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (el && actions[el.dataset.act]) actions[el.dataset.act](el.dataset.id);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  // Fall back to the placeholder if any image fails to load (error events don't bubble, so capture)
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (t.tagName !== 'IMG') return;
    if (t.id === 'heroImg') t.hidden = true;                 // show the hero's colour gradient instead
    else if (!t.src.endsWith(CONFIG.placeholderImage)) t.src = CONFIG.placeholderImage;
  }, true);

  $('#searchInput').addEventListener('input', (e) => { state.query = e.target.value.trim(); renderMenu(); });
  $('#checkoutForm').addEventListener('submit', (e) => { e.preventDefault(); submitOrder(); });
  $('#checkoutForm').addEventListener('input', (e) => {
    const field = e.target.name;
    if ($('#err-' + field)) { $('#err-' + field).textContent = ''; e.target.setAttribute('aria-invalid', 'false'); }
  });
  $('#itemForm').addEventListener('submit', (e) => { e.preventDefault(); saveItem(); });
}

/* =========================================================
   Init
   ========================================================= */
function init() {
  document.title = `${CONFIG.restaurantName} – Menu`;
  $('#brandName').textContent = CONFIG.restaurantName;
  $('#heroTitle').textContent = CONFIG.restaurantName;
  $('#heroTagline').textContent = CONFIG.tagline;
  $('#heroImg').src = CONFIG.heroImage;
  $('#itemForm').elements.category.innerHTML = CONFIG.categories.map((c) => `<option>${esc(c)}</option>`).join('');

  state.menu = loadMenu();
  state.cart = loadCart();
  const removed = reconcileCart();
  bindEvents();
  renderAll();
  if (removed) toast('Some unavailable items were removed from your cart.');
}

init();
