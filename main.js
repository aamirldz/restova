/* ═══════════════════════════════════════════════════════════
   RESTOVA — Main Application Engine (Complete)
   Admin Control Panel for Bilzora POS
   ═══════════════════════════════════════════════════════════ */
import { renderScreen } from './screens.js';
import { RESTAURANTS, TICKETS, DEVICES, PLANS, ADMIN_USERS, VERSIONS, AUDIT_LOG, LIFECYCLE_STATES, INTEGRATIONS, INVOICES, addAuditEntry, formatCurrency } from './data.js';

// ── BILZORA API ──
const BILZORA_API = 'https://bilzora.faizanldz07.workers.dev';

// ── APPLICATION STATE ──
const state = {
    screen: 'dashboard',
    user: null,
    _restSearch: '',
    _restFilter: 'all',
    _selectedRestaurant: null,
    _detailTab: 'overview',
    _liveData: null,
    _apiStatus: 'checking',
    _notifOpen: false,
};

// ── BILZORA API CONNECTOR ──
const bilzoraAPI = {
    async getOrders(limit = 50) {
        try {
            const res = await fetch(`${BILZORA_API}/api/orders?limit=${limit}`);
            return res.json();
        } catch (e) {
            console.warn('API getOrders failed:', e.message);
            return [];
        }
    },
    async getSettings() {
        try {
            const res = await fetch(`${BILZORA_API}/api/settings`);
            return res.json();
        } catch (e) {
            console.warn('API getSettings failed:', e.message);
            return {};
        }
    },
    async getCounter() {
        const res = await fetch(`${BILZORA_API}/api/counter`);
        return res.json();
    },
    async getRunningOrders() {
        try {
            const res = await fetch(`${BILZORA_API}/api/running`);
            return res.json();
        } catch (e) {
            console.warn('API getRunningOrders failed:', e.message);
            return [];
        }
    },
    async updateSettings(data) {
        try {
            const res = await fetch(`${BILZORA_API}/api/settings`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.json();
        } catch (e) {
            console.warn('API updateSettings failed:', e.message);
            return { error: e.message };
        }
    },
    async testConnection() {
        try {
            const res = await fetch(`${BILZORA_API}/api/counter`);
            const data = await res.json();
            return { ok: true, counter: data.counter };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }
};

// ── TOAST NOTIFICATIONS ──
function toast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span><span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)'; setTimeout(() => el.remove(), 300); }, 4000);
}

// ── MODAL SYSTEM ──
function showModal(title, bodyHTML, actions = []) {
    // Remove existing modal
    document.querySelector('.modal-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
    <div class="modal-box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div class="modal-title" style="margin-bottom:0">${title}</div>
        <button class="btn btn-ghost btn-sm modal-close-btn" style="font-size:18px;padding:4px 8px">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${actions.length > 0 ? `<div class="modal-footer">${actions.map(a => `<button class="btn ${a.class || 'btn-primary'}" id="${a.id}">${a.label}</button>`).join('')}</div>` : ''}
    </div>
  `;
    document.body.appendChild(overlay);
    // Animate in
    requestAnimationFrame(() => overlay.classList.add('visible'));
    // Close handlers
    overlay.querySelector('.modal-close-btn').onclick = () => closeModal();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    return overlay;
}

function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
    }
}

// ── NOTIFICATIONS PANEL ──
const NOTIFICATIONS = [
    { id: 1, icon: '🚨', title: 'Critical: GST rate issue', desc: 'Bombay Biryani House — GST showing 18% instead of 5%', time: '30m ago', read: false },
    { id: 2, icon: '⚠️', title: 'Subscription expired', desc: 'Tandoori Nights — Growth plan expired 2 days ago', time: '2h ago', read: false },
    { id: 3, icon: '📦', title: 'New version ready', desc: 'v2.5.0-beta ready for staged rollout (5% target)', time: '5h ago', read: false },
    { id: 4, icon: '🏪', title: 'New restaurant joined', desc: 'Cafe Mocha — Trial started, needs onboarding', time: '1d ago', read: true },
    { id: 5, icon: '🛡️', title: 'Fraud alert', desc: 'Pizza Paradise — Unusual discount pattern detected', time: '2h ago', read: false },
];

function toggleNotifPanel() {
    state._notifOpen = !state._notifOpen;
    let panel = document.getElementById('notifPanel');
    if (panel) { panel.remove(); state._notifOpen = false; return; }

    panel = document.createElement('div');
    panel.id = 'notifPanel';
    panel.className = 'notif-panel';
    panel.innerHTML = `
    <div class="notif-header">
      <span style="font-weight:700;font-size:14px">Notifications</span>
      <button class="btn btn-ghost btn-xs" id="markAllRead">Mark all read</button>
    </div>
    <div class="notif-list">
      ${NOTIFICATIONS.map(n => `
        <div class="notif-item ${n.read ? 'read' : ''}" data-id="${n.id}">
          <span class="notif-icon">${n.icon}</span>
          <div class="notif-content">
            <div class="notif-title">${n.title}</div>
            <div class="notif-desc">${n.desc}</div>
            <div class="notif-time">${n.time}</div>
          </div>
          ${!n.read ? '<div class="notif-unread-dot"></div>' : ''}
        </div>
      `).join('')}
    </div>
  `;
    document.querySelector('.topbar-actions').appendChild(panel);

    // Mark all read
    panel.querySelector('#markAllRead').onclick = () => {
        NOTIFICATIONS.forEach(n => n.read = true);
        panel.querySelectorAll('.notif-item').forEach(i => { i.classList.add('read'); i.querySelector('.notif-unread-dot')?.remove(); });
        const badge = document.querySelector('.notif-badge');
        if (badge) badge.style.display = 'none';
        toast('All notifications marked as read', 'success');
    };

    // Close on outside click
    setTimeout(() => {
        const outsideClick = (e) => {
            if (!panel.contains(e.target) && e.target.id !== 'notifBtn' && !e.target.closest('#notifBtn')) {
                panel.remove();
                state._notifOpen = false;
                document.removeEventListener('click', outsideClick);
            }
        };
        document.addEventListener('click', outsideClick);
    }, 10);
}

// ── NAVIGATION ──
function navigate(screen, pushState = true) {
    state.screen = screen;
    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('visible');
    // Close notif panel
    document.getElementById('notifPanel')?.remove();
    state._notifOpen = false;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.screen === screen);
    });
    // Update page title
    const titles = {
        dashboard: 'Dashboard', restaurants: 'Restaurants', 'restaurant-detail': 'Restaurant Detail',
        subscriptions: 'Subscriptions', invoices: 'Invoices', devices: 'Devices', sync: 'Command Center',
        remote: 'Remote Config', integrations: 'Integrations', updates: 'Update Deploy',
        crm: 'CRM & Loyalty', inventory: 'Inventory',
        tickets: 'Support Tickets', audit: 'Audit Log', analytics: 'AI Analytics',
        users: 'Team & Roles', settings: 'Settings'
    };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[screen] || 'Dashboard';
    // Render
    render();
    // Scroll to top
    document.getElementById('screenContainer')?.scrollTo({ top: 0, behavior: 'smooth' });
    // Hash
    if (pushState) window.location.hash = screen;
}

function render() {
    const container = document.getElementById('screenContainer');
    if (!container) return;
    container.innerHTML = renderScreen(state.screen, state);
    bindEvents();
}

// ══════════════════════════════════════════
// EVENT BINDINGS — All screens
// ══════════════════════════════════════════
function bindEvents() {
    const s = state.screen;

    // Universal: panel goto buttons
    document.querySelectorAll('[data-goto]').forEach(b => {
        b.onclick = () => navigate(b.dataset.goto);
    });

    // ── DASHBOARD ──
    if (s === 'dashboard') {
        document.querySelectorAll('.rest-row-click').forEach(r => {
            r.onclick = () => { state._selectedRestaurant = r.dataset.id; navigate('restaurant-detail'); };
        });
    }

    // ── RESTAURANTS ──
    if (s === 'restaurants') {
        document.getElementById('restSearch')?.addEventListener('input', function () {
            state._restSearch = this.value;
            render();
            const el = document.getElementById('restSearch');
            if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; }
        });
        document.querySelectorAll('.filter-chip:not(.ticket-filter)').forEach(c => {
            c.onclick = () => { state._restFilter = c.dataset.filter; render(); };
        });
        document.querySelectorAll('.rest-card').forEach(c => {
            c.onclick = () => { state._selectedRestaurant = c.dataset.id; navigate('restaurant-detail'); };
        });

        // Clear search button
        document.getElementById('clearRestSearch')?.addEventListener('click', () => {
            state._restSearch = '';
            render();
        });

        // + Add Restaurant modal
        document.getElementById('addRestBtn')?.addEventListener('click', () => {
            const modal = showModal('Add New Restaurant', `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div><label class="modal-label">Restaurant Name *</label><input class="input-field" id="arName" placeholder="e.g. King Chinese Bowl"></div>
          <div><label class="modal-label">Owner Name *</label><input class="input-field" id="arOwner" placeholder="e.g. Aamir Akwarali"></div>
          <div><label class="modal-label">City *</label><input class="input-field" id="arCity" placeholder="e.g. Indore"></div>
          <div><label class="modal-label">State *</label><input class="input-field" id="arState" placeholder="e.g. MP"></div>
          <div><label class="modal-label">Phone</label><input class="input-field" id="arPhone" placeholder="+91 98765 43210"></div>
          <div><label class="modal-label">Email</label><input class="input-field" id="arEmail" placeholder="restaurant@email.com"></div>
          <div><label class="modal-label">Plan</label><select class="input-field" id="arPlan"><option value="starter">Starter (₹8,000/yr)</option><option value="growth" selected>Growth (₹18,000/yr)</option><option value="enterprise">Enterprise (₹36,000/yr)</option></select></div>
          <div><label class="modal-label">Outlets</label><input class="input-field" type="number" id="arOutlets" value="1" min="1"></div>
        </div>
      `, [{ id: 'modalCancelBtn', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'modalSaveBtn', label: '+ Add Restaurant', class: 'btn btn-primary' }]);

            document.getElementById('modalCancelBtn').onclick = closeModal;
            document.getElementById('modalSaveBtn').onclick = () => {
                const name = document.getElementById('arName')?.value?.trim();
                const owner = document.getElementById('arOwner')?.value?.trim();
                const city = document.getElementById('arCity')?.value?.trim();
                const st = document.getElementById('arState')?.value?.trim();
                if (!name || !owner || !city || !st) { toast('Please fill all required fields', 'warning'); return; }
                const newId = 'BLZ-' + String(RESTAURANTS.length + 1).padStart(3, '0');
                RESTAURANTS.push({
                    id: newId, name, city, state: st, owner,
                    phone: document.getElementById('arPhone')?.value || '', email: document.getElementById('arEmail')?.value || '',
                    plan: document.getElementById('arPlan')?.value || 'growth',
                    status: 'trial', outlets: parseInt(document.getElementById('arOutlets')?.value) || 1,
                    devices: 0, posVersion: '2.4.1', lastSync: Date.now(),
                    revenue: 0, orders: 0, avgOrder: 0, since: new Date().toISOString().slice(0, 10),
                    expiry: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
                    logo: '🏪'
                });
                closeModal();
                render();
                toast(`Restaurant "${name}" added successfully as ${newId}`, 'success');
            };
        });
    }

    // ── RESTAURANT DETAIL ──
    if (s === 'restaurant-detail') {
        const r = RESTAURANTS.find(x => x.id === state._selectedRestaurant);
        document.getElementById('backToRestaurants')?.addEventListener('click', () => { state._restSearch = ''; state._restFilter = 'all'; navigate('restaurants'); });
        document.querySelectorAll('.detail-tab').forEach(t => {
            t.onclick = () => { state._detailTab = t.dataset.tab; render(); };
        });

        // Edit Restaurant
        document.getElementById('editRestBtn')?.addEventListener('click', () => {
            if (!r) return;
            showModal(`Edit — ${r.name}`, `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div><label class="modal-label">Restaurant Name</label><input class="input-field" id="erName" value="${r.name}"></div>
          <div><label class="modal-label">Owner</label><input class="input-field" id="erOwner" value="${r.owner}"></div>
          <div><label class="modal-label">City</label><input class="input-field" id="erCity" value="${r.city}"></div>
          <div><label class="modal-label">State</label><input class="input-field" id="erState" value="${r.state}"></div>
          <div><label class="modal-label">Phone</label><input class="input-field" id="erPhone" value="${r.phone}"></div>
          <div><label class="modal-label">Email</label><input class="input-field" id="erEmail" value="${r.email}"></div>
        </div>
      `, [{ id: 'erCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'erSave', label: '💾 Save Changes', class: 'btn btn-primary' }]);
            document.getElementById('erCancel').onclick = closeModal;
            document.getElementById('erSave').onclick = () => {
                r.name = document.getElementById('erName')?.value || r.name;
                r.owner = document.getElementById('erOwner')?.value || r.owner;
                r.city = document.getElementById('erCity')?.value || r.city;
                r.state = document.getElementById('erState')?.value || r.state;
                r.phone = document.getElementById('erPhone')?.value || r.phone;
                r.email = document.getElementById('erEmail')?.value || r.email;
                closeModal(); render();
                toast(`"${r.name}" updated successfully`, 'success');
            };
        });

        // Suspend / Activate
        document.getElementById('suspendRestBtn')?.addEventListener('click', () => {
            if (!r) return;
            const action = r.status === 'suspended' ? 'activate' : 'suspend';
            showModal(`${action === 'suspend' ? '⏸️ Suspend' : '✅ Activate'} Restaurant`, `
        <p style="font-size:14px;color:var(--text-secondary)">Are you sure you want to <strong>${action}</strong> <strong>${r.name}</strong>?</p>
        ${action === 'suspend' ? '<p style="font-size:12px;color:var(--rose);margin-top:8px">⚠️ This will immediately disable their POS from syncing. The restaurant will run in offline mode only.</p>' : '<p style="font-size:12px;color:var(--emerald);margin-top:8px">✅ This will re-enable full POS connectivity and sync.</p>'}
      `, [{ id: 'confirmCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'confirmAction', label: action === 'suspend' ? '⏸️ Suspend' : '✅ Activate', class: action === 'suspend' ? 'btn btn-danger' : 'btn btn-primary' }]);
            document.getElementById('confirmCancel').onclick = closeModal;
            document.getElementById('confirmAction').onclick = () => {
                r.status = action === 'suspend' ? 'suspended' : 'active';
                if (action === 'activate') r.lifecycleStatus = 'active';
                if (action === 'suspend') r.lifecycleStatus = 'grace_period';
                AUDIT_LOG.unshift({ id: 'AUD-' + (AUDIT_LOG.length + 1), action: `Restaurant ${action}d`, target: `${r.name} (${r.id})`, user: 'Super Admin', type: 'subscription', time: Date.now(), ip: '103.42.156.78' });
                closeModal(); render();
                toast(`${r.name} has been ${action}d`, action === 'suspend' ? 'warning' : 'success');
            };
        });

        // Change Lifecycle Status
        document.getElementById('changeLifecycleBtn')?.addEventListener('click', () => {
            if (!r) return;
            const current = LIFECYCLE_STATES.find(s => s.id === (r.lifecycleStatus || 'active'));
            const nextStates = current ? current.next : [];
            showModal('🔄 Change Lifecycle Status', `
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Current: <strong style="color:${current?.color}">${current?.label || r.lifecycleStatus}</strong></p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${nextStates.map(ns => {
                const st = LIFECYCLE_STATES.find(s => s.id === ns);
                return `<label style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer">
              <input type="radio" name="lcSelect" value="${ns}" style="accent-color:${st?.color || 'var(--brand)'}">
              <span style="font-weight:600;color:${st?.color}">${st?.label || ns}</span>
            </label>`;
            }).join('')}
        </div>
      `, [{ id: 'lcCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'lcSave', label: 'Update Status', class: 'btn btn-primary' }]);
            document.getElementById('lcCancel').onclick = closeModal;
            document.getElementById('lcSave').onclick = () => {
                const sel = document.querySelector('input[name="lcSelect"]:checked')?.value;
                if (sel) {
                    r.lifecycleStatus = sel;
                    if (sel === 'churned' || sel === 'expired') r.status = 'suspended';
                    if (sel === 'active' || sel === 'renewed' || sel === 'won_back') r.status = 'active';
                    AUDIT_LOG.unshift({ id: 'AUD-' + (AUDIT_LOG.length + 1), action: `Lifecycle changed to ${sel}`, target: `${r.name} (${r.id})`, user: 'Super Admin', type: 'subscription', time: Date.now(), ip: '103.42.156.78' });
                    closeModal(); render();
                    toast(`${r.name} lifecycle → ${sel}`, 'success');
                } else closeModal();
            };
        });

        // Transfer Ownership
        document.getElementById('transferOwnerBtn')?.addEventListener('click', () => {
            if (!r) return;
            showModal('👤 Transfer Ownership', `
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Transfer <strong>${r.name}</strong> from <strong>${r.owner}</strong> to:</p>
        <div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">New Owner Name</label><input class="input-field" id="newOwnerName" placeholder="Full name"></div>
        <div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">New Owner Email</label><input class="input-field" id="newOwnerEmail" placeholder="email@example.com"></div>
        <div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">New Owner Phone</label><input class="input-field" id="newOwnerPhone" placeholder="+91 98765 43210"></div>
      `, [{ id: 'trCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'trSave', label: '👤 Transfer', class: 'btn btn-primary' }]);
            document.getElementById('trCancel').onclick = closeModal;
            document.getElementById('trSave').onclick = () => {
                const name = document.getElementById('newOwnerName')?.value;
                const email = document.getElementById('newOwnerEmail')?.value;
                const phone = document.getElementById('newOwnerPhone')?.value;
                if (name) {
                    const old = r.owner;
                    r.owner = name; if (email) r.email = email; if (phone) r.phone = phone;
                    AUDIT_LOG.unshift({ id: 'AUD-' + (AUDIT_LOG.length + 1), action: `Ownership transferred`, target: `${r.name} (${r.id}) — ${old} → ${name}`, user: 'Super Admin', type: 'config', time: Date.now(), ip: '103.42.156.78' });
                    closeModal(); render();
                    toast(`Ownership transferred to ${name}`, 'success');
                }
            };
        });

        // Export Data
        document.getElementById('exportDataBtn')?.addEventListener('click', () => {
            if (!r) return;
            const data = JSON.stringify(r, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${r.id}_export.json`; a.click();
            URL.revokeObjectURL(url);
            toast(`${r.name} data exported`, 'success');
        });

        // Soft Delete
        document.getElementById('softDeleteBtn')?.addEventListener('click', () => {
            if (!r) return;
            showModal('🗑️ Soft Delete Restaurant', `
        <p style="font-size:14px;color:var(--text-secondary)">Are you sure you want to soft-delete <strong>${r.name}</strong>?</p>
        <p style="font-size:12px;color:var(--rose);margin-top:8px">⚠️ This will mark the restaurant as inactive. Data will be preserved but the restaurant will no longer appear in active lists.</p>
      `, [{ id: 'delCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'delConfirm', label: '🗑️ Delete', class: 'btn btn-danger' }]);
            document.getElementById('delCancel').onclick = closeModal;
            document.getElementById('delConfirm').onclick = () => {
                r.status = 'inactive'; r.lifecycleStatus = 'churned';
                AUDIT_LOG.unshift({ id: 'AUD-' + (AUDIT_LOG.length + 1), action: `Restaurant soft-deleted`, target: `${r.name} (${r.id})`, user: 'Super Admin', type: 'subscription', time: Date.now(), ip: '103.42.156.78' });
                closeModal(); navigate('restaurants');
                toast(`${r.name} has been soft-deleted`, 'warning');
            };
        });


        document.getElementById('upgradePlanBtn')?.addEventListener('click', () => {
            if (!r) return;
            showModal('Upgrade Plan', `
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Current plan: <strong>${r.plan}</strong>. Select a new plan for <strong>${r.name}</strong>:</p>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${PLANS.map(p => `
            <label class="plan-option ${r.plan === p.id ? 'current' : ''}" style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--bg-3);border:1px solid ${r.plan === p.id ? 'var(--brand)' : 'var(--border)'};border-radius:var(--radius-sm);cursor:pointer">
              <input type="radio" name="planSelect" value="${p.id}" ${r.plan === p.id ? 'checked' : ''} style="accent-color:var(--brand)">
              <div style="flex:1"><div style="font-weight:700">${p.name} <span style="color:${p.color}">${formatCurrency(p.price)}/yr</span></div><div style="font-size:11px;color:var(--text-dim)">${p.features.join(' · ')}</div></div>
              ${r.plan === p.id ? '<span class="badge emerald">Current</span>' : ''}
            </label>
          `).join('')}
        </div>
      `, [{ id: 'upCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'upSave', label: '🔄 Change Plan', class: 'btn btn-primary' }]);
            document.getElementById('upCancel').onclick = closeModal;
            document.getElementById('upSave').onclick = () => {
                const selected = document.querySelector('input[name="planSelect"]:checked')?.value;
                if (selected && selected !== r.plan) {
                    const oldPlan = r.plan;
                    r.plan = selected;
                    closeModal(); render();
                    toast(`Plan changed: ${oldPlan} → ${selected} for ${r.name}`, 'success');
                } else {
                    closeModal();
                }
            };
        });

        // Fetch live orders
        document.getElementById('fetchLiveOrders')?.addEventListener('click', async () => {
            const container = document.getElementById('liveOrdersContainer');
            if (container) container.innerHTML = '<div style="text-align:center;padding:20px"><div class="spinner"></div><div style="margin-top:8px;font-size:13px;color:var(--text-muted)">Fetching from Bilzora API...</div></div>';
            try {
                const orders = await bilzoraAPI.getOrders(20);
                if (orders && orders.length > 0) {
                    container.innerHTML = `
            <table class="dtable"><thead><tr><th>Order ID</th><th>Items</th><th>Type</th><th>Total</th><th>Payment</th><th>Time</th></tr></thead><tbody>
              ${orders.slice(0, 15).map(o => `<tr>
                <td style="font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--brand-light)">${o.id || '—'}</td>
                <td style="font-size:12px;white-space:normal;max-width:200px">${(o.items || []).map(i => i.name + ' ×' + i.qty).join(', ') || '—'}</td>
                <td><span class="badge ghost">${o.type || '—'}</span></td>
                <td style="font-weight:700">₹${(o.total || 0).toLocaleString('en-IN')}</td>
                <td><span class="badge ${o.payment === 'cash' ? 'emerald' : o.payment === 'card' ? 'blue' : o.payment === 'upi' ? 'purple' : 'ghost'}">${o.payment || '—'}</span></td>
                <td style="font-size:11px;color:var(--text-muted)">${o.time ? new Date(o.time).toLocaleString('en-IN') : '—'}</td>
              </tr>`).join('')}
            </tbody></table>
            <div style="margin-top:10px;font-size:11px;color:var(--text-dim)">Showing ${Math.min(orders.length, 15)} of ${orders.length} orders from Bilzora API</div>
          `;
                    toast(`Fetched ${orders.length} orders from Bilzora`, 'success');
                } else {
                    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-text">No orders found in Bilzora database</div></div>';
                }
            } catch (e) {
                container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--rose)">❌ Failed to connect: ${e.message}</div>`;
                toast('Failed to fetch orders from Bilzora API', 'error');
            }
        });

        // Save remote config (inside detail > config tab)
        document.getElementById('saveRemoteConfig')?.addEventListener('click', async () => {
            const btn = document.getElementById('saveRemoteConfig');
            btn.disabled = true; btn.textContent = '⏳ Pushing...';
            try {
                const data = {
                    restaurantName: document.getElementById('rcfgName')?.value || '',
                    gstRate: document.getElementById('rcfgGst')?.value || '5',
                    invoicePrefix: document.getElementById('rcfgPrefix')?.value || '',
                    dailyGoal: document.getElementById('rcfgGoal')?.value || '50000',
                };
                await bilzoraAPI.updateSettings(data);
                toast('Configuration pushed to Bilzora POS!', 'success');
            } catch (e) {
                toast('Failed to push config: ' + e.message, 'error');
            }
            btn.disabled = false; btn.textContent = '💾 Save & Push to POS';
        });

        // Push Update button for devices
        document.querySelectorAll('.push-update-btn').forEach(btn => {
            btn.onclick = () => {
                const devId = btn.dataset.devId;
                const dev = DEVICES.find(d => d.id === devId);
                if (dev) {
                    showModal('Push Software Update', `
            <p style="font-size:13px;color:var(--text-secondary)">Push latest POS version to <strong>${dev.name}</strong> at <strong>${dev.restaurant}</strong>?</p>
            <div style="margin-top:12px;padding:12px;background:var(--bg-3);border-radius:var(--radius-sm)">
              <div style="font-size:12px;color:var(--text-muted)">Current: <strong>v${dev.version}</strong> → Target: <strong>v${VERSIONS[0].version}</strong></div>
            </div>
          `, [{ id: 'pushCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'pushConfirm', label: '🚀 Push Update', class: 'btn btn-primary' }]);
                    document.getElementById('pushCancel').onclick = closeModal;
                    document.getElementById('pushConfirm').onclick = () => {
                        dev.version = VERSIONS[0].version;
                        closeModal(); render();
                        toast(`v${VERSIONS[0].version} pushed to ${dev.name}`, 'success');
                    };
                }
            };
        });

        // Add Device modal (restaurant detail)
        document.getElementById('addDeviceBtn')?.addEventListener('click', () => {
            if (!r) return;
            showModal('Add New Device', `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div><label class="modal-label">Device Name *</label><input class="input-field" id="adName" placeholder="e.g. Counter 1"></div>
            <div><label class="modal-label">Device Type</label><select class="input-field" id="adType"><option value="POS">POS Terminal</option><option value="KDS">Kitchen Display</option><option value="Captain">Captain App</option></select></div>
            <div><label class="modal-label">OS</label><select class="input-field" id="adOS"><option>Windows 11</option><option>Windows 10</option><option>Android 14</option><option>Android 13</option><option>macOS 14</option></select></div>
            <div><label class="modal-label">IP Address</label><input class="input-field" id="adIP" placeholder="192.168.1.100"></div>
          </div>
        `, [{ id: 'adCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'adSave', label: '+ Add Device', class: 'btn btn-primary' }]);
            document.getElementById('adCancel').onclick = closeModal;
            document.getElementById('adSave').onclick = () => {
                const name = document.getElementById('adName')?.value?.trim();
                if (!name) { toast('Device name is required', 'warning'); return; }
                const newId = 'DEV-' + String(DEVICES.length + 1).padStart(3, '0');
                DEVICES.push({
                    id: newId, restaurantId: r.id, restaurant: r.name,
                    type: document.getElementById('adType')?.value || 'POS',
                    name, version: VERSIONS[0].version,
                    lastSync: Date.now(), status: 'online',
                    os: document.getElementById('adOS')?.value || 'Windows 11',
                    ip: document.getElementById('adIP')?.value || '0.0.0.0'
                });
                r.devices = (r.devices || 0) + 1;
                closeModal(); render();
                toast(`Device "${name}" added to ${r.name}`, 'success');
            };
        });
    }

    // ── SUBSCRIPTIONS ──
    if (s === 'subscriptions') {
        document.querySelectorAll('.sub-upgrade-btn').forEach(btn => {
            btn.onclick = () => {
                const r = RESTAURANTS.find(x => x.id === btn.dataset.id);
                if (!r) return;
                state._selectedRestaurant = r.id;
                state._detailTab = 'overview';
                navigate('restaurant-detail');
                // Will trigger Upgrade Plan via the detail page
            };
        });
        document.querySelectorAll('.sub-extend-btn').forEach(btn => {
            btn.onclick = () => {
                const r = RESTAURANTS.find(x => x.id === btn.dataset.id);
                if (!r) return;
                showModal('Extend Subscription', `
          <p style="font-size:13px;color:var(--text-secondary)">Extend <strong>${r.name}</strong>'s subscription.</p>
          <div style="margin-top:14px"><label class="modal-label">Extension Period</label>
            <select class="input-field" id="extPeriod">
              <option value="30">1 Month</option><option value="90">3 Months</option>
              <option value="180">6 Months</option><option value="365" selected>1 Year</option>
            </select>
          </div>
        `, [{ id: 'extCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'extSave', label: '📅 Extend', class: 'btn btn-primary' }]);
                document.getElementById('extCancel').onclick = closeModal;
                document.getElementById('extSave').onclick = () => {
                    const days = parseInt(document.getElementById('extPeriod')?.value || 365);
                    const newExpiry = new Date(new Date(r.expiry).getTime() + days * 86400000);
                    r.expiry = newExpiry.toISOString().slice(0, 10);
                    closeModal(); render();
                    toast(`${r.name} extended by ${days} days (until ${r.expiry})`, 'success');
                };
            };
        });
    }

    // ── DEVICES (global page) ──
    if (s === 'devices') {
        // Add Device button (global)
        document.getElementById('addDeviceBtnGlobal')?.addEventListener('click', () => {
            showModal('Add New Device', `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div><label class="modal-label">Restaurant *</label><select class="input-field" id="adgRest">
              <option value="">— Select —</option>
              ${RESTAURANTS.map(r => `<option value="${r.id}">${r.logo} ${r.name}</option>`).join('')}
            </select></div>
            <div><label class="modal-label">Device Name *</label><input class="input-field" id="adgName" placeholder="e.g. Main Counter"></div>
            <div><label class="modal-label">Device Type</label><select class="input-field" id="adgType"><option value="POS">POS Terminal</option><option value="KDS">Kitchen Display</option><option value="Captain">Captain App</option></select></div>
            <div><label class="modal-label">OS</label><select class="input-field" id="adgOS"><option>Windows 11</option><option>Windows 10</option><option>Android 14</option><option>Android 13</option><option>macOS 14</option></select></div>
            <div><label class="modal-label">IP Address</label><input class="input-field" id="adgIP" placeholder="192.168.1.100"></div>
          </div>
        `, [{ id: 'adgCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'adgSave', label: '+ Add Device', class: 'btn btn-primary' }]);
            document.getElementById('adgCancel').onclick = closeModal;
            document.getElementById('adgSave').onclick = () => {
                const restId = document.getElementById('adgRest')?.value;
                const name = document.getElementById('adgName')?.value?.trim();
                if (!restId || !name) { toast('Restaurant and Device name are required', 'warning'); return; }
                const rest = RESTAURANTS.find(r => r.id === restId);
                const newId = 'DEV-' + String(DEVICES.length + 1).padStart(3, '0');
                DEVICES.push({
                    id: newId, restaurantId: restId, restaurant: rest?.name || restId,
                    type: document.getElementById('adgType')?.value || 'POS',
                    name, version: VERSIONS[0].version,
                    lastSync: Date.now(), status: 'online',
                    os: document.getElementById('adgOS')?.value || 'Windows 11',
                    ip: document.getElementById('adgIP')?.value || '0.0.0.0'
                });
                if (rest) rest.devices = (rest.devices || 0) + 1;
                closeModal(); render();
                toast(`Device "${name}" added to ${rest?.name || restId}`, 'success');
            };
        });

        // Push Update buttons (global devices page)
        document.querySelectorAll('.push-update-btn-global').forEach(btn => {
            btn.onclick = () => {
                const dev = DEVICES.find(d => d.id === btn.dataset.devId);
                if (!dev) return;
                showModal('Push Software Update', `
              <p style="font-size:13px;color:var(--text-secondary)">Push latest POS version to <strong>${dev.name}</strong> at <strong>${dev.restaurant}</strong>?</p>
              <div style="margin-top:12px;padding:12px;background:var(--bg-3);border-radius:var(--radius-sm)">
                <div style="font-size:12px;color:var(--text-muted)">Current: <strong>v${dev.version}</strong> → Target: <strong>v${VERSIONS[0].version}</strong></div>
              </div>
            `, [{ id: 'gpCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'gpConfirm', label: '🚀 Push Update', class: 'btn btn-primary' }]);
                document.getElementById('gpCancel').onclick = closeModal;
                document.getElementById('gpConfirm').onclick = () => {
                    dev.version = VERSIONS[0].version;
                    closeModal(); render();
                    toast(`v${VERSIONS[0].version} pushed to ${dev.name}`, 'success');
                };
            };
        });
    }

    // ── REMOTE CONFIG ──
    if (s === 'remote') {
        document.getElementById('remoteRestSelect')?.addEventListener('change', function () {
            const panel = document.getElementById('remoteConfigPanel');
            const id = this.value;
            if (!id) {
                panel.innerHTML = '<div class="empty-state"><div class="empty-icon">🛠️</div><div class="empty-text">Select a restaurant above to edit its configuration</div></div>';
                return;
            }
            const r = RESTAURANTS.find(x => x.id === id);
            if (!r) return;
            panel.innerHTML = `
        <div class="panel" style="animation:fadeUp 0.3s var(--ease)">
          <div class="panel-header"><div class="panel-title">🛠️ Config: ${r.name}</div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div><label class="modal-label">Restaurant Name</label><input class="input-field" id="rrcName" value="${r.name}"></div>
            <div><label class="modal-label">GST Rate (%)</label><select class="input-field" id="rrcGst"><option ${5 ? 'selected' : ''}>5</option><option>12</option><option>18</option></select></div>
            <div><label class="modal-label">Invoice Prefix</label><input class="input-field" id="rrcPrefix" value="${r.id.replace('BLZ', 'INV')}-"></div>
            <div><label class="modal-label">Daily Goal (₹)</label><input class="input-field" type="number" id="rrcGoal" value="50000"></div>
            <div><label class="modal-label">Max Discount (%)</label><input class="input-field" type="number" id="rrcDiscount" value="15" min="0" max="100"></div>
            <div><label class="modal-label">Currency</label><select class="input-field"><option selected>₹ INR</option><option>$ USD</option><option>€ EUR</option></select></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:16px">
            <button class="btn btn-primary" id="rrcSave">💾 Save & Push to POS</button>
            <button class="btn btn-secondary" id="rrcFetch">📥 Fetch Current Config</button>
          </div>
        </div>
      `;
            // Push to POS
            document.getElementById('rrcSave')?.addEventListener('click', async () => {
                const btn = document.getElementById('rrcSave');
                btn.disabled = true; btn.textContent = '⏳ Pushing...';
                try {
                    await bilzoraAPI.updateSettings({
                        restaurantName: document.getElementById('rrcName')?.value,
                        gstRate: document.getElementById('rrcGst')?.value,
                        invoicePrefix: document.getElementById('rrcPrefix')?.value,
                        dailyGoal: document.getElementById('rrcGoal')?.value,
                    });
                    toast(`Config pushed to ${r.name}'s POS`, 'success');
                } catch (e) {
                    toast('Push failed: ' + e.message, 'error');
                }
                btn.disabled = false; btn.textContent = '💾 Save & Push to POS';
            });
            // Fetch from API
            document.getElementById('rrcFetch')?.addEventListener('click', async () => {
                try {
                    const settings = await bilzoraAPI.getSettings();
                    toast('Current config fetched from Bilzora API', 'success');
                    if (settings) {
                        if (settings.restaurantName) document.getElementById('rrcName').value = settings.restaurantName;
                        if (settings.gstRate) document.getElementById('rrcGst').value = settings.gstRate;
                    }
                } catch (e) {
                    toast('Failed to fetch config: ' + e.message, 'error');
                }
            });
        });
    }

    // ── UPDATES ──
    if (s === 'updates') {
        document.querySelectorAll('.promote-btn').forEach(btn => {
            btn.onclick = () => {
                const ver = VERSIONS.find(v => v.version === btn.dataset.version);
                if (!ver) return;
                showModal('Promote to Stable', `
          <p style="font-size:13px;color:var(--text-secondary)">Promote <strong>v${ver.version}</strong> from beta to stable? This will begin rolling it out to all restaurants.</p>
          <div style="margin-top:12px"><label class="modal-label">Initial Rollout %</label><input class="input-field" type="number" id="rolloutPct" value="25" min="1" max="100"></div>
        `, [{ id: 'promCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'promConfirm', label: '🚀 Promote', class: 'btn btn-primary' }]);
                document.getElementById('promCancel').onclick = closeModal;
                document.getElementById('promConfirm').onclick = () => {
                    const pct = parseInt(document.getElementById('rolloutPct')?.value || 25);
                    ver.status = 'stable';
                    ver.rollout = pct;
                    closeModal(); render();
                    toast(`v${ver.version} promoted to stable at ${pct}% rollout`, 'success');
                };
            };
        });
        // Rollback handler
        document.querySelectorAll('.rollback-btn').forEach(btn => {
            btn.onclick = () => {
                const ver = btn.dataset.version;
                showModal('↩ Rollback', `<p style="font-size:13px;color:var(--text-secondary)">Rollback to <strong>v${ver}</strong>? This will revert all restaurants to this version.</p>`,
                    [{ id: 'rbCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'rbConfirm', label: '↩ Rollback', class: 'btn btn-danger' }]);
                document.getElementById('rbCancel').onclick = closeModal;
                document.getElementById('rbConfirm').onclick = () => {
                    addAuditEntry(`Rollback initiated to v${ver}`, 'All restaurants', 'Super Admin', 'deployment');
                    closeModal(); render();
                    toast(`Rollback to v${ver} initiated`, 'warning');
                };
            };
        });
        // Advance pipeline
        document.querySelector('.promote-pipeline-btn')?.addEventListener('click', () => {
            addAuditEntry('Pipeline advanced', 'v2.5.0-beta — next stage', 'Super Admin', 'deployment');
            toast('Pipeline advanced to next stage', 'success');
            render();
        });
    }

    // ── INTEGRATIONS ──
    if (s === 'integrations') {
        document.querySelectorAll('.integration-enable-btn').forEach(btn => {
            btn.onclick = () => {
                const ig = INTEGRATIONS.find(i => i.id === btn.dataset.id);
                if (ig) { ig.status = 'active'; ig.health = 95; ig.connectedRestaurants = 3; addAuditEntry(`Integration enabled: ${ig.name}`, ig.name, 'Super Admin', 'config'); render(); toast(`${ig.name} enabled`, 'success'); }
            };
        });
        document.querySelectorAll('.integration-disable-btn').forEach(btn => {
            btn.onclick = () => {
                const ig = INTEGRATIONS.find(i => i.id === btn.dataset.id);
                if (ig) { ig.status = 'inactive'; ig.health = 0; addAuditEntry(`Integration disabled: ${ig.name}`, ig.name, 'Super Admin', 'config'); render(); toast(`${ig.name} disabled`, 'warning'); }
            };
        });
        document.querySelectorAll('.integration-config-btn').forEach(btn => {
            btn.onclick = () => toast('Integration settings panel coming soon', 'info');
        });
    }

    // ── INVOICES ──
    if (s === 'invoices') {
        document.getElementById('generateInvoiceBtn')?.addEventListener('click', () => {
            toast('Invoice generation initiated', 'success');
        });
    }

    // ── INVENTORY ──
    if (s === 'inventory') {
        document.querySelectorAll('.reorder-btn').forEach(btn => {
            btn.onclick = () => {
                addAuditEntry(`Reorder initiated for ${btn.dataset.item}`, btn.dataset.item, 'Super Admin', 'config');
                toast(`Purchase order created for ${btn.dataset.item}`, 'success');
            };
        });
    }

    // ── TICKETS ──
    if (s === 'tickets') {
        document.querySelectorAll('.ticket-filter').forEach(c => {
            c.onclick = () => {
                document.querySelectorAll('.ticket-filter').forEach(x => x.classList.toggle('active', x === c));
                const filter = c.dataset.filter;
                document.querySelectorAll('.ticket-card').forEach(card => {
                    card.style.display = filter === 'all' || card.dataset.status === filter ? '' : 'none';
                });
            };
        });
        // + New Ticket
        document.getElementById('newTicketBtn')?.addEventListener('click', () => {
            showModal('Create Support Ticket', `
        <div style="display:flex;flex-direction:column;gap:14px">
          <div><label class="modal-label">Restaurant *</label><select class="input-field" id="ntRest">
            <option value="">— Select —</option>
            ${RESTAURANTS.map(r => `<option value="${r.id}">${r.logo} ${r.name}</option>`).join('')}
          </select></div>
          <div><label class="modal-label">Title *</label><input class="input-field" id="ntTitle" placeholder="Brief issue description"></div>
          <div><label class="modal-label">Description</label><textarea class="input-field" id="ntDesc" rows="3" placeholder="Detailed explanation..." style="resize:vertical"></textarea></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div><label class="modal-label">Priority</label><select class="input-field" id="ntPriority"><option>low</option><option selected>medium</option><option>high</option><option>critical</option></select></div>
            <div><label class="modal-label">Type</label><select class="input-field" id="ntType"><option>Hardware</option><option>Configuration</option><option>Billing</option><option>Sync</option><option>Feature Request</option><option>Onboarding</option></select></div>
          </div>
          <div><label class="modal-label">Assign to</label><select class="input-field" id="ntAgent">
            <option value="">— Unassigned —</option>
            ${ADMIN_USERS.filter(u => u.role === 'support_agent').map(u => `<option value="${u.name}">${u.name}</option>`).join('')}
          </select></div>
        </div>
      `, [{ id: 'ntCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'ntSave', label: '🎫 Create Ticket', class: 'btn btn-primary' }]);
            document.getElementById('ntCancel').onclick = closeModal;
            document.getElementById('ntSave').onclick = () => {
                const restId = document.getElementById('ntRest')?.value;
                const title = document.getElementById('ntTitle')?.value?.trim();
                if (!restId || !title) { toast('Restaurant and Title are required', 'warning'); return; }
                const rest = RESTAURANTS.find(r => r.id === restId);
                const newId = 'TKT-' + String(2848 + TICKETS.length);
                TICKETS.unshift({
                    id: newId, restaurantId: restId, restaurant: rest?.name || restId,
                    title, description: document.getElementById('ntDesc')?.value || '',
                    priority: document.getElementById('ntPriority')?.value || 'medium',
                    status: 'open', type: document.getElementById('ntType')?.value || 'Hardware',
                    agent: document.getElementById('ntAgent')?.value || null,
                    created: Date.now(), updated: Date.now()
                });
                closeModal(); render();
                toast(`Ticket ${newId} created`, 'success');
            };
        });

        // Ticket status change buttons
        document.querySelectorAll('.ticket-status-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const t = TICKETS.find(x => x.id === btn.dataset.ticketId);
                if (!t) return;
                const newStatus = btn.dataset.newStatus;
                const oldStatus = t.status;
                t.status = newStatus;
                t.updated = Date.now();
                render();
                toast(`Ticket ${t.id}: ${oldStatus} → ${newStatus}`, 'success');
            };
        });

        // Ticket assign buttons
        document.querySelectorAll('.ticket-assign-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const t = TICKETS.find(x => x.id === btn.dataset.ticketId);
                if (!t) return;
                showModal('Assign Ticket', `
              <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">Assign <strong>${t.id}</strong> — ${t.title}</p>
              <label class="modal-label">Agent</label>
              <select class="input-field" id="assignAgent">
                <option value="">— Select Agent —</option>
                ${ADMIN_USERS.filter(u => u.role === 'support_agent').map(u => `<option value="${u.name}">${u.name} (${u.region || 'All'})</option>`).join('')}
              </select>
            `, [{ id: 'assignCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'assignSave', label: '👤 Assign', class: 'btn btn-primary' }]);
                document.getElementById('assignCancel').onclick = closeModal;
                document.getElementById('assignSave').onclick = () => {
                    const agent = document.getElementById('assignAgent')?.value;
                    if (!agent) { toast('Select an agent', 'warning'); return; }
                    t.agent = agent;
                    t.updated = Date.now();
                    closeModal(); render();
                    toast(`${t.id} assigned to ${agent}`, 'success');
                };
            };
        });
    }

    // ── USERS ──
    if (s === 'users') {
        document.getElementById('addTeamBtn')?.addEventListener('click', () => {
            showModal('Add Team Member', `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div><label class="modal-label">Full Name *</label><input class="input-field" id="atName" placeholder="John Doe"></div>
          <div><label class="modal-label">Email *</label><input class="input-field" id="atEmail" placeholder="john@restova.com"></div>
          <div><label class="modal-label">Role</label><select class="input-field" id="atRole"><option value="support_agent">Support Agent</option><option value="sales_rep">Sales Rep</option><option value="engineer">Engineer</option></select></div>
          <div><label class="modal-label">Region</label><input class="input-field" id="atRegion" placeholder="e.g. North India"></div>
        </div>
      `, [{ id: 'atCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'atSave', label: '+ Add Member', class: 'btn btn-primary' }]);
            document.getElementById('atCancel').onclick = closeModal;
            document.getElementById('atSave').onclick = () => {
                const name = document.getElementById('atName')?.value?.trim();
                const email = document.getElementById('atEmail')?.value?.trim();
                if (!name || !email) { toast('Name and Email are required', 'warning'); return; }
                const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                ADMIN_USERS.push({
                    id: 'USR-' + String(ADMIN_USERS.length + 1).padStart(3, '0'),
                    name, email, role: document.getElementById('atRole')?.value || 'support_agent',
                    status: 'active', lastLogin: Date.now(), region: document.getElementById('atRegion')?.value || '',
                    avatar: initials
                });
                closeModal(); render();
                toast(`${name} added to team`, 'success');
            };
        });

        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.onclick = () => {
                const u = ADMIN_USERS.find(x => x.id === btn.dataset.userId);
                if (!u) return;
                showModal(`Edit — ${u.name}`, `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div><label class="modal-label">Full Name</label><input class="input-field" id="euName" value="${u.name}"></div>
            <div><label class="modal-label">Email</label><input class="input-field" id="euEmail" value="${u.email}"></div>
            <div><label class="modal-label">Role</label><select class="input-field" id="euRole">
              <option value="super_admin" ${u.role === 'super_admin' ? 'selected' : ''}>Super Admin</option>
              <option value="support_agent" ${u.role === 'support_agent' ? 'selected' : ''}>Support Agent</option>
              <option value="sales_rep" ${u.role === 'sales_rep' ? 'selected' : ''}>Sales Rep</option>
              <option value="engineer" ${u.role === 'engineer' ? 'selected' : ''}>Engineer</option>
            </select></div>
            <div><label class="modal-label">Region</label><input class="input-field" id="euRegion" value="${u.region || ''}"></div>
          </div>
        `, [{ id: 'euCancel', label: 'Cancel', class: 'btn btn-secondary' }, { id: 'euSave', label: '💾 Save', class: 'btn btn-primary' }]);
                document.getElementById('euCancel').onclick = closeModal;
                document.getElementById('euSave').onclick = () => {
                    u.name = document.getElementById('euName')?.value || u.name;
                    u.email = document.getElementById('euEmail')?.value || u.email;
                    u.role = document.getElementById('euRole')?.value || u.role;
                    u.region = document.getElementById('euRegion')?.value || u.region;
                    u.avatar = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    closeModal(); render();
                    toast(`${u.name} updated`, 'success');
                };
            };
        });
    }

    // ── AUDIT LOG ──
    if (s === 'audit') {
        document.querySelectorAll('.audit-filter').forEach(c => {
            c.onclick = () => {
                document.querySelectorAll('.audit-filter').forEach(x => x.classList.toggle('active', x === c));
                const filter = c.dataset.filter;
                document.querySelectorAll('.audit-item').forEach(item => {
                    const typeEl = item.querySelector('.badge.ghost');
                    const type = typeEl?.textContent?.trim() || '';
                    item.style.display = filter === 'all' || type === filter ? '' : 'none';
                });
            };
        });
    }

    // ── SETTINGS ──
    if (s === 'settings') {
        document.getElementById('testApiBtn')?.addEventListener('click', async () => {
            const btn = document.getElementById('testApiBtn');
            btn.disabled = true; btn.textContent = '⏳ Testing...';
            const result = await bilzoraAPI.testConnection();
            if (result.ok) {
                toast(`Bilzora API connected! Order counter: ${result.counter}`, 'success');
                const dot = document.querySelector('.live-dot');
                if (dot) { dot.style.background = 'var(--emerald)'; dot.style.boxShadow = '0 0 6px var(--emerald)'; }
                state._apiStatus = 'online';
            } else {
                toast('API connection failed: ' + result.error, 'error');
                state._apiStatus = 'offline';
            }
            btn.disabled = false; btn.textContent = '🔄 Test Connection';
        });

        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            toast('Settings saved successfully', 'success');
        });
    }
}

// ── LOGIN SYSTEM ──
function initLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const appEl = document.getElementById('app');
    const activeSession = sessionStorage.getItem('restova_loggedIn');

    if (activeSession) {
        loginScreen.style.display = 'none';
        appEl.style.display = 'flex';
        state.user = JSON.parse(activeSession);
        startApp();
        return;
    }

    document.getElementById('loginBtn').onclick = () => {
        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value;
        if ((user === 'admin' || user === 'admin@restova.com') && pass === 'admin123') {
            state.user = { name: 'Super Admin', role: 'super_admin', email: user };
            sessionStorage.setItem('restova_loggedIn', JSON.stringify(state.user));
            loginScreen.style.display = 'none';
            appEl.style.display = 'flex';
            startApp();
            toast('Welcome back, Super Admin!', 'success');
        } else {
            const err = document.getElementById('loginError');
            err.textContent = '❌ Invalid credentials. Try admin / admin123';
            err.style.animation = 'none';
            err.offsetHeight; // force reflow
            err.style.animation = 'shake 0.4s ease';
        }
    };
    document.getElementById('loginPass').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('loginBtn').click(); };
    document.getElementById('loginUser').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('loginPass').focus(); };
}

// ── APP START ──
function startApp() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => { e.preventDefault(); navigate(item.dataset.screen); };
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        showModal('Logout', '<p style="font-size:14px;color:var(--text-secondary)">Are you sure you want to log out of the Restova Admin Panel?</p>', [
            { id: 'logoutCancel', label: 'Cancel', class: 'btn btn-secondary' },
            { id: 'logoutConfirm', label: '🚪 Logout', class: 'btn btn-danger' }
        ]);
        document.getElementById('logoutCancel').onclick = closeModal;
        document.getElementById('logoutConfirm').onclick = () => {
            sessionStorage.removeItem('restova_loggedIn');
            location.reload();
        };
    });

    // Notification bell
    document.getElementById('notifBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotifPanel();
    });

    // Mobile sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.getElementById('app')?.appendChild(overlay);
    if (toggle) toggle.onclick = () => { sidebar.classList.toggle('open'); overlay.classList.toggle('visible'); };
    overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('visible'); };

    // Global search
    document.getElementById('globalSearch')?.addEventListener('input', function () {
        const q = this.value.trim();
        if (q.length >= 2) {
            state._restSearch = q;
            navigate('restaurants');
        }
    });
    // Clear global search on focus if on restaurants
    document.getElementById('globalSearch')?.addEventListener('focus', function () {
        if (state.screen !== 'restaurants') this.value = '';
    });

    // Hash routing
    const hash = window.location.hash.slice(1);
    if (hash && hash !== 'undefined') state.screen = hash;

    // Check API status
    bilzoraAPI.testConnection().then(r => {
        state._apiStatus = r.ok ? 'online' : 'offline';
        const dot = document.querySelector('.live-dot');
        if (dot) {
            dot.style.background = r.ok ? 'var(--emerald)' : 'var(--rose)';
            dot.style.boxShadow = r.ok ? '0 0 6px var(--emerald)' : '0 0 6px var(--rose)';
        }
    }).catch(() => { state._apiStatus = 'offline'; });

    // Initial render
    navigate(state.screen, false);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', initLogin);

// ── Hash change listener ──
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && hash !== state.screen) {
        navigate(hash, false);
    }
});
