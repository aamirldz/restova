/* ═══════════════════════════════════════════════════════════
   RESTOVA — Screen Renderers (Complete v2)
   All 17 admin dashboard screens
   ═══════════════════════════════════════════════════════════ */
import { RESTAURANTS, PLANS, DEVICES, TICKETS, AUDIT_LOG, VERSIONS, AI_PREDICTIONS, ADMIN_USERS, LIFECYCLE_STATES, INTEGRATIONS, INVOICES, CRM_DATA, INVENTORY_DATA, SUPPORT_METRICS, SYSTEM_HEALTH, DEPLOYMENT_PIPELINE, timeAgo, formatCurrency, formatDate, formatDateTime } from './data.js';

const fmt = formatCurrency;

// ── MAIN ROUTER ──
export function renderScreen(screen, state) {
    switch (screen) {
        case 'dashboard': return renderDashboard(state);
        case 'restaurants': return renderRestaurants(state);
        case 'restaurant-detail': return renderRestaurantDetail(state);
        case 'subscriptions': return renderSubscriptions(state);
        case 'invoices': return renderInvoices(state);
        case 'devices': return renderDevices(state);
        case 'sync': return renderCommandCenter(state);
        case 'remote': return renderRemoteConfig(state);
        case 'integrations': return renderIntegrations(state);
        case 'updates': return renderUpdateDeploy(state);
        case 'crm': return renderCRM(state);
        case 'inventory': return renderInventory(state);
        case 'tickets': return renderTickets(state);
        case 'audit': return renderAuditLog(state);
        case 'analytics': return renderAIAnalytics(state);
        case 'users': return renderUsers(state);
        case 'settings': return renderSettings(state);
        default: return renderDashboard(state);
    }
}

// ═══════════════════════════════════════
// 1. DASHBOARD
// ═══════════════════════════════════════
function renderDashboard(state) {
    const totalRev = RESTAURANTS.reduce((s, r) => s + r.revenue, 0);
    const totalOrders = RESTAURANTS.reduce((s, r) => s + r.orders, 0);
    const activeCount = RESTAURANTS.filter(r => r.status === 'active').length;
    const onlineDevices = DEVICES.filter(d => d.status === 'online').length;
    const openTickets = TICKETS.filter(t => t.status === 'open' || t.status === 'in-progress').length;
    const trialCount = RESTAURANTS.filter(r => r.status === 'trial').length;

    const sparkBars = [35, 42, 38, 55, 48, 62, 58, 71, 65, 78, 73, 85].map(v => `<div class="kpi-spark-bar" style="height:${v}%;background:rgba(124,58,237,${0.15 + v / 150})"></div>`).join('');
    const sparkBars2 = [28, 35, 42, 30, 50, 45, 55, 60, 52, 68, 62, 75].map(v => `<div class="kpi-spark-bar" style="height:${v}%;background:rgba(8,145,178,${0.15 + v / 150})"></div>`).join('');

    // Revenue chart (last 7 days mock)
    const revDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revValues = [142000, 168000, 155000, 189000, 210000, 245000, 198000];
    const maxRev = Math.max(...revValues);

    // Plan distribution
    const planCounts = { starter: 0, growth: 0, enterprise: 0 };
    RESTAURANTS.forEach(r => { if (planCounts[r.plan] !== undefined) planCounts[r.plan]++; });
    const total = RESTAURANTS.length;

    return `
  <!-- KPI CARDS -->
  <div class="kpi-grid">
    <div class="kpi-card purple">
      <div class="kpi-header"><span class="kpi-label">Total Revenue</span><span class="kpi-icon">💰</span></div>
      <div class="kpi-value">${fmt(totalRev)}</div>
      <div class="kpi-change up">↑ 18.5% <span style="color:var(--text-dim)">vs last month</span></div>
      <div class="kpi-sparkline">${sparkBars}</div>
    </div>
    <div class="kpi-card cyan">
      <div class="kpi-header"><span class="kpi-label">Total Orders</span><span class="kpi-icon">📦</span></div>
      <div class="kpi-value">${totalOrders.toLocaleString()}</div>
      <div class="kpi-change up">↑ 12.3% <span style="color:var(--text-dim)">vs last month</span></div>
      <div class="kpi-sparkline">${sparkBars2}</div>
    </div>
    <div class="kpi-card emerald">
      <div class="kpi-header"><span class="kpi-label">Active Restaurants</span><span class="kpi-icon">🏪</span></div>
      <div class="kpi-value">${activeCount} <span style="font-size:14px;color:var(--text-dim)">/ ${RESTAURANTS.length}</span></div>
      <div class="kpi-change up">↑ 3 <span style="color:var(--text-dim)">new this month</span></div>
    </div>
    <div class="kpi-card amber">
      <div class="kpi-header"><span class="kpi-label">Devices Online</span><span class="kpi-icon">📟</span></div>
      <div class="kpi-value">${onlineDevices} <span style="font-size:14px;color:var(--text-dim)">/ ${DEVICES.length}</span></div>
      <div class="kpi-change ${onlineDevices === DEVICES.length ? 'up' : 'down'}">${onlineDevices === DEVICES.length ? '✅ All online' : `⚠️ ${DEVICES.length - onlineDevices} offline`}</div>
    </div>
    <div class="kpi-card rose">
      <div class="kpi-header"><span class="kpi-label">Open Tickets</span><span class="kpi-icon">🎫</span></div>
      <div class="kpi-value">${openTickets}</div>
      <div class="kpi-change ${openTickets > 3 ? 'down' : 'up'}">${openTickets > 3 ? '↑ Needs attention' : '↓ Under control'}</div>
    </div>
    <div class="kpi-card blue">
      <div class="kpi-header"><span class="kpi-label">Trial Accounts</span><span class="kpi-icon">🧪</span></div>
      <div class="kpi-value">${trialCount}</div>
      <div class="kpi-change up">Convert to paid →</div>
    </div>
  </div>

  <div class="grid-60-40">
    <!-- REVENUE CHART -->
    <div class="panel" style="animation-delay:300ms">
      <div class="panel-header">
        <div class="panel-title">📈 Revenue Trend (This Week)</div>
        <span class="badge purple">Weekly</span>
      </div>
      <div class="bar-chart" style="height:140px;padding-bottom:24px">
        ${revDays.map((d, i) => `<div class="bar" style="height:${revValues[i] / maxRev * 100}%;background:linear-gradient(to top,var(--brand-dark),var(--brand-light))" data-value="${revValues[i]}"><span class="bar-value">${fmt(revValues[i])}</span><span class="bar-label">${d}</span></div>`).join('')}
      </div>
    </div>

    <!-- PLAN DISTRIBUTION -->
    <div class="panel" style="animation-delay:350ms">
      <div class="panel-header">
        <div class="panel-title">📊 Plan Distribution</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;margin-top:8px">
        ${PLANS.map(p => {
        const count = planCounts[p.id] || 0;
        const pct = Math.round(count / total * 100);
        return `<div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:13px;font-weight:600">${p.name}</span>
              <span style="font-size:13px;font-weight:700;color:${p.color}">${count} <span style="color:var(--text-dim);font-weight:400">(${pct}%)</span></span>
            </div>
            <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${p.color}"></div></div>
          </div>`;
    }).join('')}
      </div>
    </div>
  </div>

  <div class="grid-60-40">
    <!-- RECENT RESTAURANTS -->
    <div class="panel" style="animation-delay:400ms">
      <div class="panel-header">
        <div class="panel-title">🏪 Recent Restaurants</div>
        <button class="btn btn-sm btn-secondary" data-goto="restaurants">View All →</button>
      </div>
      <div class="data-table-wrap">
        <table class="dtable">
          <thead><tr><th>Restaurant</th><th>Plan</th><th>Revenue</th><th>Sync</th><th>Status</th></tr></thead>
          <tbody>
            ${RESTAURANTS.slice(0, 6).map(r => `<tr class="rest-row-click" data-id="${r.id}" style="cursor:pointer">
              <td><div style="display:flex;align-items:center;gap:10px"><span style="font-size:18px">${r.logo}</span><div><div style="font-weight:600">${r.name}</div><div style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">${r.id}</div></div></div></td>
              <td><span class="badge ${r.plan === 'enterprise' ? 'amber' : r.plan === 'growth' ? 'purple' : 'blue'}">${r.plan}</span></td>
              <td style="font-weight:700">${fmt(r.revenue)}</td>
              <td><span style="font-size:12px;color:var(--text-muted)">${timeAgo(Date.now() - r.lastSync)}</span></td>
              <td>${statusPill(r.status)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- OPEN TICKETS -->
    <div class="panel" style="animation-delay:450ms">
      <div class="panel-header">
        <div class="panel-title">🎫 Open Tickets</div>
        <button class="btn btn-sm btn-secondary" data-goto="tickets">View All →</button>
      </div>
      ${TICKETS.filter(t => t.status !== 'resolved').slice(0, 4).map(t => `
        <div class="ticket-card" style="padding:12px 14px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:11px;font-weight:700;font-family:var(--font-mono);color:var(--brand-light)">${t.id}</span>
            ${priorityBadge(t.priority)}
          </div>
          <div style="font-size:13px;font-weight:600;margin-bottom:4px">${t.title}</div>
          <div style="font-size:11px;color:var(--text-dim)">${t.restaurant} · ${timeAgo(Date.now() - t.created)}</div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ═══════════════════════════════════════
// 2. RESTAURANTS
// ═══════════════════════════════════════
function renderRestaurants(state) {
    const filter = state._restFilter || 'all';
    const q = (state._restSearch || '').toLowerCase();
    let list = RESTAURANTS;
    if (filter !== 'all') list = list.filter(r => r.plan === filter || r.status === filter);
    if (q) list = list.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q));

    return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div>
      <h2 style="font-size:20px;font-weight:800">Restaurant Management</h2>
      <p style="font-size:13px;color:var(--text-muted);margin-top:2px">${RESTAURANTS.length} restaurants · ${RESTAURANTS.filter(r => r.status === 'active').length} active</p>
    </div>
    <button class="btn btn-primary" id="addRestBtn">+ Add Restaurant</button>
  </div>

  <div class="search-bar">
    <span>🔍</span>
    <input type="text" id="restSearch" placeholder="Search by name, ID, city, owner..." value="${state._restSearch || ''}">
    ${state._restSearch ? '<button class="btn btn-ghost btn-xs" id="clearRestSearch" style="margin-left:auto;font-size:16px">✕</button>' : ''}
  </div>

  <div class="filter-row">
    <span style="font-size:12px;color:var(--text-dim);font-weight:600">Filter:</span>
    ${['all', 'starter', 'growth', 'enterprise', 'active', 'suspended', 'trial'].map(f => `<div class="filter-chip ${filter === f ? 'active' : ''}" data-filter="${f}">${f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</div>`).join('')}
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px">
    ${list.map((r, i) => `
      <div class="rest-card" data-id="${r.id}" style="animation-delay:${i * 40}ms">
        <div class="rest-header">
          <div class="rest-avatar">${r.logo}</div>
          <div style="flex:1">
            <div class="rest-name">${r.name}</div>
            <div class="rest-id">${r.id}</div>
          </div>
          ${statusPill(r.status)}
        </div>
        <div class="rest-meta">
          <span class="rest-meta-item">📍 ${r.city}, ${r.state}</span>
          <span class="rest-meta-item">👤 ${r.owner}</span>
          <span class="rest-meta-item">📱 ${r.outlets} outlet${r.outlets > 1 ? 's' : ''}</span>
          <span class="badge ${r.plan === 'enterprise' ? 'amber' : r.plan === 'growth' ? 'purple' : 'blue'}" style="font-size:10px">${r.plan}</span>
        </div>
        <div class="rest-stats">
          <div class="rest-stat"><div class="rest-stat-value" style="color:var(--emerald)">${fmt(r.revenue)}</div><div class="rest-stat-label">Revenue</div></div>
          <div class="rest-stat"><div class="rest-stat-value">${r.orders.toLocaleString()}</div><div class="rest-stat-label">Orders</div></div>
          <div class="rest-stat"><div class="rest-stat-value" style="font-size:12px">${timeAgo(Date.now() - r.lastSync)}</div><div class="rest-stat-label">Last Sync</div></div>
        </div>
      </div>
    `).join('')}
  </div>
  ${list.length === 0 ? '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No restaurants match your search</div></div>' : ''}`;
}

// ═══════════════════════════════════════
// 3. RESTAURANT DETAIL
// ═══════════════════════════════════════
function renderRestaurantDetail(state) {
    const r = RESTAURANTS.find(x => x.id === state._selectedRestaurant);
    if (!r) return '<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-text">Restaurant not found</div></div>';
    const devs = DEVICES.filter(d => d.restaurantId === r.id);
    const tickets = TICKETS.filter(t => t.restaurantId === r.id);
    const plan = PLANS.find(p => p.id === r.plan);
    const tab = state._detailTab || 'overview';

    return `
  <button class="btn btn-ghost" id="backToRestaurants" style="margin-bottom:16px">← Back to Restaurants</button>

  <div class="detail-top">
    <div class="detail-avatar">${r.logo}</div>
    <div class="detail-info">
      <div class="detail-name">${r.name}</div>
      <div class="detail-sub">${r.id} · ${r.city}, ${r.state} · Owner: ${r.owner}</div>
      <div class="detail-badges">
        ${statusPill(r.status)}
        ${lifecycleBadge(r.lifecycleStatus || r.status)}
        <span class="badge ${r.plan === 'enterprise' ? 'amber' : r.plan === 'growth' ? 'purple' : 'blue'}">${r.plan} plan</span>
        <span class="badge ghost">${r.outlets} outlet${r.outlets > 1 ? 's' : ''}</span>
        <span class="badge ghost">v${r.posVersion}</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" id="editRestBtn">✏️ Edit</button>
      <button class="btn btn-secondary btn-sm" id="changeLifecycleBtn">🔄 Change Status</button>
      <button class="btn btn-secondary btn-sm" id="transferOwnerBtn">👤 Transfer</button>
      <button class="btn btn-secondary btn-sm" id="exportDataBtn">📥 Export</button>
      <button class="btn btn-danger btn-sm" id="suspendRestBtn">${r.status === 'suspended' ? '✅ Activate' : '⏸️ Suspend'}</button>
      <button class="btn btn-ghost btn-sm" id="softDeleteBtn" style="color:var(--rose)">🗑️</button>
    </div>
  </div>

  <div class="detail-tabs">
    ${['overview', 'orders', 'devices', 'tickets', 'config'].map(t => `<div class="detail-tab ${tab === t ? 'active' : ''}" data-tab="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</div>`).join('')}
  </div>

  ${tab === 'overview' ? `
    <div id="liveKpiContainer" class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="kpi-card purple"><div class="kpi-header"><span class="kpi-label">Revenue</span></div><div class="kpi-value" id="kpiRevenue"><div class="spinner" style="width:20px;height:20px"></div></div></div>
      <div class="kpi-card cyan"><div class="kpi-header"><span class="kpi-label">Orders</span></div><div class="kpi-value" id="kpiOrders"><div class="spinner" style="width:20px;height:20px"></div></div></div>
      <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">Avg Order</span></div><div class="kpi-value" id="kpiAvgOrder"><div class="spinner" style="width:20px;height:20px"></div></div></div>
      <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">Last Sync</span></div><div class="kpi-value" style="font-size:18px" id="kpiLastSync"><div class="spinner" style="width:20px;height:20px"></div></div></div>
    </div>
    <div class="grid-2">
      <div class="panel">
        <div class="panel-title" style="margin-bottom:14px">📋 Restaurant Info</div>
        ${infoRow('Owner', r.owner)}${infoRow('Phone', r.phone)}${infoRow('Email', r.email)}
        ${infoRow('City', r.city + ', ' + r.state)}${infoRow('Since', formatDate(new Date(r.since).getTime()))}
        ${r.apiUrl ? `<div style="margin-top:10px;padding:10px;background:var(--bg-3);border-radius:8px;border:1px solid var(--border)">
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">🔗 POS API URL</div>
          <div style="font-family:var(--font-mono);font-size:11px;word-break:break-all;color:var(--brand-light)">${r.apiUrl}</div>
        </div>` : '<div style="margin-top:10px;padding:8px;background:#FEF3C7;border-radius:6px;font-size:11px;color:#92400E">⚠️ No POS API URL configured. Edit restaurant to add one.</div>'}
      </div>
      <div class="panel">
        <div class="panel-title" style="margin-bottom:14px">💳 Subscription</div>
        ${infoRow('Plan', plan?.name || r.plan)}${infoRow('Price', plan ? fmt(plan.price) + '/year' : '—')}
        ${infoRow('Expires', r.expiry)}${infoRow('Status', r.status)}
        <button class="btn btn-primary btn-sm" style="margin-top:12px;width:100%" id="upgradePlanBtn">Upgrade Plan</button>
      </div>
    </div>

    <!-- LIVE DATA FROM BILZORA POS -->
    <div class="grid-2" style="margin-top:16px">
      <div class="panel">
        <div class="panel-title" style="margin-bottom:14px">🪑 Live Tables</div>
        <div id="liveTablesContainer"><div style="text-align:center;padding:16px"><div class="spinner" style="width:20px;height:20px"></div><div style="font-size:12px;color:var(--text-dim);margin-top:6px">Loading tables from POS...</div></div></div>
      </div>
      <div class="panel">
        <div class="panel-title" style="margin-bottom:14px">👥 Staff (from POS)</div>
        <div id="liveStaffContainer"><div style="text-align:center;padding:16px"><div class="spinner" style="width:20px;height:20px"></div><div style="font-size:12px;color:var(--text-dim);margin-top:6px">Loading staff from POS...</div></div></div>
      </div>
    </div>

    <div class="grid-2" style="margin-top:16px">
      <div class="panel">
        <div class="panel-title" style="margin-bottom:14px">🍳 Kitchen / KDS Status</div>
        <div id="liveKDSContainer"><div style="text-align:center;padding:16px"><div class="spinner" style="width:20px;height:20px"></div><div style="font-size:12px;color:var(--text-dim);margin-top:6px">Loading KDS status...</div></div></div>
      </div>
      <div class="panel">
        <div class="panel-title" style="margin-bottom:14px">💓 Device Heartbeat</div>
        <div id="liveHeartbeatContainer"><div style="text-align:center;padding:16px"><div class="spinner" style="width:20px;height:20px"></div><div style="font-size:12px;color:var(--text-dim);margin-top:6px">Pinging POS device...</div></div></div>
      </div>
    </div>
  ` : tab === 'devices' ? `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">📟 Devices (${devs.length})</div><button class="btn btn-primary btn-sm" id="addDeviceBtn">+ Add Device</button></div>
      ${devs.length === 0 ? '<div style="color:var(--text-dim);font-size:13px;padding:16px 0">No devices registered</div>' : `
      <table class="dtable"><thead><tr><th>Device</th><th>Type</th><th>Version</th><th>Last Sync</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        ${devs.map(d => `<tr>
          <td><div style="font-weight:600">${d.name}</div><div style="font-size:11px;font-family:var(--font-mono);color:var(--text-dim)">${d.id}</div></td>
          <td><span class="badge ghost">${d.type}</span></td>
          <td style="font-family:var(--font-mono);font-size:12px">${d.version}</td>
          <td style="font-size:12px;color:var(--text-muted)">${timeAgo(Date.now() - d.lastSync)}</td>
          <td>${d.status === 'online' ? '<span class="pill online"><span class="pill-dot"></span>Online</span>' : '<span class="pill offline"><span class="pill-dot"></span>Offline</span>'}</td>
          <td><button class="btn btn-xs btn-secondary push-update-btn" data-dev-id="${d.id}">Push Update</button></td>
        </tr>`).join('')}
      </tbody></table>`}
    </div>
  ` : tab === 'tickets' ? `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">🎫 Support Tickets (${tickets.length})</div></div>
      ${tickets.length === 0 ? '<div style="color:var(--text-dim);font-size:13px;padding:16px 0">No tickets</div>' : tickets.map(t => `
        <div class="ticket-card">
          <div class="ticket-top"><span class="ticket-id">${t.id}</span>${priorityBadge(t.priority)}</div>
          <div class="ticket-title">${t.title}</div>
          <div class="ticket-desc">${t.description}</div>
          <div class="ticket-footer"><span class="badge ${t.status === 'open' ? 'rose' : t.status === 'in-progress' ? 'amber' : t.status === 'resolved' ? 'emerald' : 'ghost'}">${t.status}</span><span style="font-size:11px;color:var(--text-dim)">${timeAgo(Date.now() - t.created)}</span></div>
        </div>
      `).join('')}
    </div>
  ` : tab === 'orders' ? `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">📦 Live Orders</div><button class="btn btn-sm btn-primary" id="fetchLiveOrders">🔄 Fetch from Bilzora API</button></div>
      <div id="liveOrdersContainer" style="color:var(--text-muted);font-size:13px;padding:16px 0">Click "Fetch from Bilzora API" to load live order data from the deployed POS.</div>
    </div>
  ` : tab === 'config' ? `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">🛠️ Remote Configuration</div></div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Edit this restaurant's configuration remotely. Changes sync to POS on next sync cycle.</p>
      <div class="grid-2">
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Restaurant Name</label>
          <input class="input-field" value="${r.name}" id="rcfgName">
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">GST Rate (%)</label>
          <select class="input-field" id="rcfgGst"><option value="5" ${r.gstRate === 5 ? 'selected' : ''}>5</option><option value="12" ${r.gstRate === 12 ? 'selected' : ''}>12</option><option value="18" ${r.gstRate === 18 ? 'selected' : ''}>18</option></select>
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Invoice Prefix</label>
          <input class="input-field" value="KCB-" id="rcfgPrefix">
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Daily Goal (₹)</label>
          <input class="input-field" type="number" value="50000" id="rcfgGoal">
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:16px" id="saveRemoteConfig">💾 Save & Push to POS</button>
    </div>
  ` : ''}`;
}

// ═══════════════════════════════════════
// 4. SUBSCRIPTIONS
// ═══════════════════════════════════════
function renderSubscriptions() {
    const planCounts = {};
    RESTAURANTS.forEach(r => { planCounts[r.plan] = (planCounts[r.plan] || 0) + 1; });
    const mrr = RESTAURANTS.filter(r => r.status === 'active' || r.status === 'trial').reduce((s, r) => { const p = PLANS.find(x => x.id === r.plan); return s + (p ? p.price / 12 : 0); }, 0);

    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">Subscription Management</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:24px">Manage plans, billing, and revenue</p>

  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card purple"><div class="kpi-header"><span class="kpi-label">Monthly Recurring Revenue</span><span class="kpi-icon">💰</span></div><div class="kpi-value">${fmt(Math.round(mrr))}</div><div class="kpi-change up">↑ 15% MoM</div></div>
    <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">Annual Revenue</span><span class="kpi-icon">📈</span></div><div class="kpi-value">${fmt(Math.round(mrr * 12))}</div></div>
    <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">Avg Revenue / Restaurant</span><span class="kpi-icon">🏪</span></div><div class="kpi-value">${fmt(Math.round(mrr * 12 / RESTAURANTS.length))}</div></div>
  </div>

  <!-- PLAN CARDS -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:24px">
    ${PLANS.map(p => `
      <div class="panel" style="border-top:3px solid ${p.color}">
        <div style="font-size:18px;font-weight:800;margin-bottom:4px">${p.name}</div>
        <div style="font-size:24px;font-weight:900;color:${p.color};margin-bottom:16px">${fmt(p.price)}<span style="font-size:13px;color:var(--text-dim);font-weight:400">/year</span></div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${p.features.map(f => `<div style="font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:6px"><span style="color:${p.color}">✓</span> ${f}</div>`).join('')}
        </div>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);text-align:center">
          <span style="font-size:22px;font-weight:900">${planCounts[p.id] || 0}</span>
          <span style="font-size:12px;color:var(--text-dim);display:block">restaurants</span>
        </div>
      </div>
    `).join('')}
  </div>

  <!-- SUBSCRIPTION TABLE -->
  <div class="panel">
    <div class="panel-header"><div class="panel-title">📋 All Subscriptions</div></div>
    <table class="dtable"><thead><tr><th>Restaurant</th><th>Plan</th><th>Price</th><th>Status</th><th>Expires</th><th>Actions</th></tr></thead><tbody>
      ${RESTAURANTS.map(r => {
        const p = PLANS.find(x => x.id === r.plan);
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:8px"><span>${r.logo}</span><span style="font-weight:600">${r.name}</span></div></td>
          <td><span class="badge ${r.plan === 'enterprise' ? 'amber' : r.plan === 'growth' ? 'purple' : 'blue'}">${r.plan}</span></td>
          <td>${p ? fmt(p.price) : '—'}</td>
          <td>${statusPill(r.status)}</td>
          <td style="font-size:12px;font-family:var(--font-mono)">${r.expiry}</td>
          <td><button class="btn btn-xs btn-secondary sub-upgrade-btn" data-id="${r.id}">Upgrade</button> <button class="btn btn-xs btn-ghost sub-extend-btn" data-id="${r.id}">Extend</button></td>
        </tr>`;
    }).join('')}
    </tbody></table>
  </div>`;
}

// ═══════════════════════════════════════
// 5. DEVICES
// ═══════════════════════════════════════
function renderDevices() {
    const online = DEVICES.filter(d => d.status === 'online').length;
    const types = {};
    DEVICES.forEach(d => { types[d.type] = (types[d.type] || 0) + 1; });

    return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div><h2 style="font-size:20px;font-weight:800">Device Management</h2>
    <p style="font-size:13px;color:var(--text-muted);margin-top:2px">${DEVICES.length} total · ${online} online · ${DEVICES.length - online} offline</p></div>
    <button class="btn btn-primary" id="addDeviceBtnGlobal">+ Add Device</button>
  </div>
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">Online</span><span class="kpi-icon">🟢</span></div><div class="kpi-value">${online}</div></div>
    <div class="kpi-card rose"><div class="kpi-header"><span class="kpi-label">Offline</span><span class="kpi-icon">🔴</span></div><div class="kpi-value">${DEVICES.length - online}</div></div>
    <div class="kpi-card cyan"><div class="kpi-header"><span class="kpi-label">POS Terminals</span><span class="kpi-icon">💻</span></div><div class="kpi-value">${types['POS'] || 0}</div></div>
    <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">KDS + Captain</span><span class="kpi-icon">📟</span></div><div class="kpi-value">${(types['KDS'] || 0) + (types['Captain'] || 0)}</div></div>
  </div>
  <div class="panel">
    <div class="panel-header"><div class="panel-title">All Devices</div></div>
    <table class="dtable"><thead><tr><th>Device</th><th>Restaurant</th><th>Type</th><th>Version</th><th>OS</th><th>Last Sync</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${DEVICES.map(d => `<tr>
        <td><div style="font-weight:600">${d.name}</div><div style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim)">${d.id}</div></td>
        <td>${d.restaurant}</td>
        <td><span class="badge ghost">${d.type}</span></td>
        <td style="font-family:var(--font-mono);font-size:12px">${d.version}</td>
        <td style="font-size:12px;color:var(--text-muted)">${d.os}</td>
        <td style="font-size:12px">${timeAgo(Date.now() - d.lastSync)}</td>
        <td>${d.status === 'online' ? '<span class="pill online"><span class="pill-dot"></span>Online</span>' : '<span class="pill offline"><span class="pill-dot"></span>Offline</span>'}</td>
        <td><button class="btn btn-xs btn-secondary push-update-btn-global" data-dev-id="${d.id}">Push Update</button></td>
      </tr>`).join('')}
    </tbody></table>
  </div>`;
}

// ═══════════════════════════════════════
// 6. LIVE OPERATIONS COMMAND CENTER
// ═══════════════════════════════════════
function renderCommandCenter() {
    const h = SYSTEM_HEALTH;
    const onlineR = RESTAURANTS.filter(r => (Date.now() - r.lastSync) < 600000).length;
    const staleR = RESTAURANTS.filter(r => (Date.now() - r.lastSync) >= 600000 && (Date.now() - r.lastSync) < 3600000).length;
    const offlineR = RESTAURANTS.filter(r => (Date.now() - r.lastSync) >= 3600000).length;

    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">🛡️ Live Operations Command Center</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Real-time monitoring, heartbeat status, and system health</p>

  <!-- SYSTEM HEALTH KPIs -->
  <div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">
    <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">API Latency</span><span class="kpi-icon">⚡</span></div><div class="kpi-value">${h.apiLatency}ms</div><div class="kpi-change up">Normal</div></div>
    <div class="kpi-card cyan"><div class="kpi-header"><span class="kpi-label">Server Load</span><span class="kpi-icon">📊</span></div><div class="kpi-value">${h.serverLoad}%</div><div class="kpi-change up">Healthy</div></div>
    <div class="kpi-card purple"><div class="kpi-header"><span class="kpi-label">Uptime</span><span class="kpi-icon">🕐</span></div><div class="kpi-value">${h.uptime}%</div></div>
    <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">WebSockets</span><span class="kpi-icon">🔌</span></div><div class="kpi-value">${h.activeWebSockets}</div></div>
    <div class="kpi-card blue"><div class="kpi-header"><span class="kpi-label">DB Connections</span><span class="kpi-icon">🗄️</span></div><div class="kpi-value">${h.dbConnections}</div></div>
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <!-- REGIONAL BREAKDOWN -->
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">🗺️ Regional Breakdown</div>
      <table class="dtable"><thead><tr><th>Region</th><th>Restaurants</th><th>Online</th><th>Orders</th><th>Latency</th></tr></thead><tbody>
        ${Object.entries(h.regions).map(([key, r]) => `<tr>
          <td style="font-weight:600;text-transform:capitalize">${key}</td>
          <td>${r.restaurants}</td>
          <td><span class="pill ${r.online === r.restaurants ? 'online' : 'warning'}"><span class="pill-dot"></span>${r.online}/${r.restaurants}</span></td>
          <td style="font-weight:700">${r.orders.toLocaleString()}</td>
          <td style="color:${r.latency > 50 ? 'var(--amber)' : 'var(--emerald)'}">${r.latency}ms</td>
        </tr>`).join('')}
      </tbody></table>
    </div>
    <!-- PEAK HOURS -->
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">📈 Peak Hours Detection</div>
      ${h.peakHours.map(p => `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="font-weight:700;font-family:var(--font-mono);font-size:13px;min-width:50px">${p.hour}</span>
        <div class="progress" style="flex:1"><div class="progress-fill" style="width:${p.load}%;background:${p.load > 90 ? 'var(--rose)' : p.load > 75 ? 'var(--amber)' : 'var(--emerald)'}"></div></div>
        <span style="font-size:12px;color:var(--text-muted);min-width:80px">${p.load}% · ${p.orders} orders</span>
      </div>`).join('')}
    </div>
  </div>

  <!-- SYSTEM ALERTS -->
  <div class="panel" style="margin-bottom:20px">
    <div class="panel-title" style="margin-bottom:14px">🚨 Active Alerts</div>
    ${h.alerts.map(a => `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:8px;background:${a.type === 'critical' ? 'var(--rose-bg)' : a.type === 'warning' ? 'var(--amber-bg)' : 'var(--emerald-bg)'};border-radius:var(--radius-sm);border:1px solid ${a.type === 'critical' ? 'rgba(244,63,94,0.2)' : a.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}">
      <span style="font-size:16px">${a.type === 'critical' ? '🔴' : a.type === 'warning' ? '🟡' : '🟢'}</span>
      <span style="flex:1;font-size:13px;font-weight:500">${a.message}</span>
      <span style="font-size:11px;color:var(--text-dim)">${timeAgo(Date.now() - a.time)}</span>
    </div>`).join('')}
  </div>

  <!-- DEVICE HEARTBEAT STATUS -->
  <div class="panel">
    <div class="panel-title" style="margin-bottom:14px">💓 Device Heartbeat Status (60s ping)</div>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px">
      <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">Online & Syncing</span></div><div class="kpi-value">${onlineR}</div></div>
      <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">Stale (>10m)</span></div><div class="kpi-value">${staleR}</div></div>
      <div class="kpi-card rose"><div class="kpi-header"><span class="kpi-label">Offline (>1h)</span></div><div class="kpi-value">${offlineR}</div></div>
    </div>
    ${DEVICES.map(d => {
        const hbDiff = Date.now() - (d.lastHeartbeat || d.lastSync);
        const hbStatus = hbDiff < 60000 ? 'online' : hbDiff < 300000 ? 'warning' : 'offline';
        return `<div class="sync-card">
      <div class="sync-indicator ${hbStatus}"></div>
      <div class="sync-info"><div class="sync-name">${d.name}</div><div class="sync-detail">${d.restaurant} · ${d.id} · ${d.os}</div></div>
      <div style="display:flex;gap:16px;align-items:center;font-size:11px;color:var(--text-muted)">
        <span>CPU: <strong style="color:${(d.cpuUsage || 0) > 80 ? 'var(--rose)' : 'var(--text-primary)'}">${d.cpuUsage || 0}%</strong></span>
        <span>RAM: <strong style="color:${(d.ramUsage || 0) > 80 ? 'var(--rose)' : 'var(--text-primary)'}">${d.ramUsage || 0}%</strong></span>
      </div>
      <div class="sync-time">${timeAgo(hbDiff)}</div>
      <span class="pill ${hbStatus}"><span class="pill-dot"></span>${hbStatus === 'online' ? 'Alive' : hbStatus === 'warning' ? 'Stale' : 'Dead'}</span>
    </div>`;
    }).join('')}
  </div>`;
}

// ═══════════════════════════════════════
// 7. REMOTE CONFIG
// ═══════════════════════════════════════
function renderRemoteConfig(state) {
    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">Remote Configuration</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Edit any restaurant's config remotely — changes sync to POS automatically</p>
  <div class="panel">
    <div class="panel-header"><div class="panel-title">🏪 Select Restaurant</div></div>
    <select class="input-field" id="remoteRestSelect" style="max-width:400px">
      <option value="">— Choose a restaurant —</option>
      ${RESTAURANTS.map(r => `<option value="${r.id}">${r.logo} ${r.name} (${r.id})</option>`).join('')}
    </select>
  </div>
  <div id="remoteConfigPanel">
    <div class="empty-state"><div class="empty-icon">🛠️</div><div class="empty-text">Select a restaurant above to edit its configuration</div></div>
  </div>`;
}

// ═══════════════════════════════════════
// 8. UPDATE DEPLOYMENT (Full Pipeline)
// ═══════════════════════════════════════
function renderUpdateDeploy() {
    const dp = DEPLOYMENT_PIPELINE;
    const stageIdx = dp.stages.indexOf(dp.current.stage);

    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">Software Deployment Pipeline</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">6-stage deployment pipeline with rollback capability</p>

  <!-- PIPELINE STAGES -->
  <div class="panel" style="margin-bottom:20px">
    <div class="panel-title" style="margin-bottom:16px">🚀 Current Deployment: v${dp.current.version}</div>
    <div style="display:flex;gap:4px;margin-bottom:16px">
      ${dp.stages.map((s, i) => {
        const status = i < stageIdx ? 'complete' : i === stageIdx ? 'active' : 'pending';
        return `<div style="flex:1;text-align:center">
          <div style="height:6px;border-radius:3px;background:${status === 'complete' ? 'var(--emerald)' : status === 'active' ? 'var(--amber)' : 'var(--border)'};margin-bottom:6px"></div>
          <div style="font-size:10px;font-weight:${status === 'active' ? '700' : '500'};color:${status === 'active' ? 'var(--amber)' : status === 'complete' ? 'var(--emerald)' : 'var(--text-dim)'};text-transform:capitalize">${s}</div>
        </div>`;
    }).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
      <div style="padding:12px;background:var(--bg-3);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-dim)">Canary Target</div><div style="font-size:18px;font-weight:800">${dp.current.canaryActual}%</div></div>
      <div style="padding:12px;background:var(--bg-3);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-dim)">Checks Passed</div><div style="font-size:18px;font-weight:800;color:var(--emerald)">${dp.current.passedChecks}</div></div>
      <div style="padding:12px;background:var(--bg-3);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-dim)">Failed Checks</div><div style="font-size:18px;font-weight:800;color:${dp.current.failedChecks > 0 ? 'var(--rose)' : 'var(--emerald)'}">${dp.current.failedChecks}</div></div>
      <div style="padding:12px;background:var(--bg-3);border-radius:var(--radius-sm)"><div style="font-size:11px;color:var(--text-dim)">Progress</div><div style="font-size:18px;font-weight:800">${dp.current.progress}%</div></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-primary promote-pipeline-btn">⏩ Advance Pipeline</button>
      ${dp.current.rollbackAvailable ? '<button class="btn btn-danger rollback-btn" data-version="' + dp.current.version + '">↩ Rollback</button>' : ''}
    </div>
  </div>

  <!-- DEPLOYMENT HISTORY -->
  <div class="panel" style="margin-bottom:20px">
    <div class="panel-title" style="margin-bottom:14px">📋 Deployment History</div>
    <table class="dtable"><thead><tr><th>Version</th><th>Completed</th><th>Duration</th><th>Result</th></tr></thead><tbody>
      ${dp.history.map(h => `<tr>
        <td style="font-family:var(--font-mono);font-weight:600">v${h.version}</td>
        <td style="font-size:12px">${timeAgo(Date.now() - h.completedAt)}</td>
        <td>${h.duration}</td>
        <td><span class="badge ${h.result === 'success' ? 'emerald' : 'rose'}">${h.result === 'rolled_back' ? '↩ Rolled Back' : '✅ Success'}</span>${h.reason ? `<div style="font-size:10px;color:var(--text-dim);margin-top:2px">${h.reason}</div>` : ''}</td>
      </tr>`).join('')}
    </tbody></table>
  </div>

  <!-- VERSION LIST -->
  <div class="panel">
    <div class="panel-title" style="margin-bottom:14px">📦 All Versions</div>
    ${VERSIONS.map(v => `
    <div class="deploy-card">
      <div>
        <div class="deploy-version">${v.version}</div>
        <div class="deploy-meta">${v.date}</div>
      </div>
      <div class="deploy-info">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
          ${v.changelog.slice(0, 3).map(c => `<span class="tag">${c}</span>`).join('')}
          ${v.changelog.length > 3 ? `<span class="tag">+${v.changelog.length - 3} more</span>` : ''}
        </div>
        <div class="progress" style="max-width:200px"><div class="progress-fill" style="width:${v.rollout}%;background:${v.status === 'latest' ? 'var(--emerald)' : v.status === 'beta' ? 'var(--amber)' : v.status === 'deprecated' ? 'var(--rose)' : 'var(--blue)'}"></div></div>
        <div style="font-size:10px;color:var(--text-dim);margin-top:4px">${v.rollout}% rollout</div>
      </div>
      <span class="badge ${v.status === 'latest' ? 'emerald' : v.status === 'beta' ? 'amber' : v.status === 'deprecated' ? 'rose' : v.status === 'stable' ? 'blue' : 'ghost'}">${v.status}</span>
      ${v.status === 'beta' ? `<button class="btn btn-sm btn-primary promote-btn" data-version="${v.version}">Promote to Stable</button>` : ''}
      ${v.status !== 'latest' && v.status !== 'beta' ? `<button class="btn btn-sm btn-ghost rollback-btn" data-version="${v.version}">↩ Rollback To</button>` : ''}
    </div>
  `).join('')}
  </div>`;
}

// ═══════════════════════════════════════
// 9. TICKETS (with SLA & Metrics)
// ═══════════════════════════════════════
function renderTickets() {
    const sm = SUPPORT_METRICS;
    const open = TICKETS.filter(t => t.status === 'open').length;
    const inProg = TICKETS.filter(t => t.status === 'in-progress').length;
    return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div><h2 style="font-size:20px;font-weight:800">Support War Room</h2><p style="font-size:13px;color:var(--text-muted)">${open} open · ${inProg} in progress · ${TICKETS.length} total</p></div>
    <button class="btn btn-primary" id="newTicketBtn">+ New Ticket</button>
  </div>
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
    <div class="kpi-card cyan"><div class="kpi-header"><span class="kpi-label">Avg Resolution</span><span class="kpi-icon">⏱️</span></div><div class="kpi-value">${sm.avgResolutionTime}h</div></div>
    <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">First Contact Resolution</span><span class="kpi-icon">✅</span></div><div class="kpi-value">${sm.firstContactResolution}%</div></div>
    <div class="kpi-card purple"><div class="kpi-header"><span class="kpi-label">CSAT Score</span><span class="kpi-icon">⭐</span></div><div class="kpi-value">${sm.csatScore}/5</div></div>
    <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">SLA Compliance</span><span class="kpi-icon">📋</span></div><div class="kpi-value">${sm.slaCompliance}%</div></div>
  </div>
  <div class="panel" style="margin-bottom:20px"><div class="panel-title" style="margin-bottom:14px">👥 Tickets Per Agent</div>
    <div style="display:flex;gap:20px;flex-wrap:wrap">${Object.entries(sm.ticketsPerAgent).map(([name, count]) => `<div style="flex:1;min-width:140px;padding:12px;background:var(--bg-3);border-radius:var(--radius-sm);text-align:center"><div style="font-size:22px;font-weight:800">${count}</div><div style="font-size:12px;color:var(--text-muted)">${name}</div></div>`).join('')}</div>
  </div>
  <div class="filter-row">
    ${['all', 'open', 'in-progress', 'waiting', 'resolved'].map(f => `<div class="filter-chip ticket-filter ${f === 'all' ? 'active' : ''}" data-filter="${f}">${f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</div>`).join('')}
  </div>
  ${TICKETS.map(t => {
        const slaR = t.slaDeadline ? t.slaDeadline - Date.now() : null;
        const slaB = slaR !== null && slaR < 0;
        const slaU = slaR !== null && slaR > 0 && slaR < 3600000;
        return `
    <div class="ticket-card" data-status="${t.status}" data-ticket-id="${t.id}">
      <div class="ticket-top">
        <span class="ticket-id">${t.id}</span>
        <div style="display:flex;gap:6px;align-items:center">
          ${t.slaDeadline && t.status !== 'resolved' ? `<span class="badge ${slaB ? 'rose' : slaU ? 'amber' : 'ghost'}" style="font-size:10px">⏱ SLA: ${slaB ? 'BREACHED' : slaU ? '<1h' : Math.ceil(slaR / 3600000) + 'h left'}</span>` : ''}
          ${priorityBadge(t.priority)}<span class="badge ${t.status === 'open' ? 'rose' : t.status === 'in-progress' ? 'amber' : t.status === 'resolved' ? 'emerald' : 'ghost'}">${t.status}</span>
        </div>
      </div>
      <div class="ticket-title">${t.title}</div>
      <div class="ticket-desc">${t.description}</div>
      <div class="ticket-footer">
        <span style="font-size:11px;color:var(--text-dim)">🏪 ${t.restaurant}</span>
        <span class="badge ghost">${t.type}</span>
        <span style="font-size:11px;color:var(--text-dim)">${t.agent ? '👤 ' + t.agent : '⚠️ Unassigned'}</span>
        <span style="font-size:11px;color:var(--text-dim);margin-left:auto">${timeAgo(Date.now() - t.created)}</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
        ${t.status === 'open' ? '<button class="btn btn-xs btn-primary ticket-status-btn" data-ticket-id="' + t.id + '" data-new-status="in-progress">▶ Start Working</button>' : ''}
        ${t.status === 'in-progress' ? '<button class="btn btn-xs btn-primary ticket-status-btn" data-ticket-id="' + t.id + '" data-new-status="resolved">✅ Resolve</button><button class="btn btn-xs btn-secondary ticket-status-btn" data-ticket-id="' + t.id + '" data-new-status="waiting">⏳ Waiting</button>' : ''}
        ${t.status === 'waiting' ? '<button class="btn btn-xs btn-primary ticket-status-btn" data-ticket-id="' + t.id + '" data-new-status="in-progress">▶ Resume</button><button class="btn btn-xs btn-secondary ticket-status-btn" data-ticket-id="' + t.id + '" data-new-status="resolved">✅ Resolve</button>' : ''}
        ${t.status === 'resolved' ? '<button class="btn btn-xs btn-ghost ticket-status-btn" data-ticket-id="' + t.id + '" data-new-status="open">↩ Reopen</button>' : ''}
        ${!t.agent ? '<button class="btn btn-xs btn-secondary ticket-assign-btn" data-ticket-id="' + t.id + '">👤 Assign</button>' : ''}
      </div>
    </div>`;
    }).join('')}`;
}

// ═══════════════════════════════════════
// 10. AUDIT LOG
// ═══════════════════════════════════════
function renderAuditLog() {
    const typeColors = { subscription: 'var(--amber)', config: 'var(--cyan)', device: 'var(--emerald)', menu: 'var(--brand)', security: 'var(--rose)', deployment: 'var(--blue)', onboarding: 'var(--emerald)' };

    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">Audit Log</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Complete history of all admin actions across all restaurants</p>
  <div class="filter-row">
    ${['all', 'subscription', 'config', 'device', 'menu', 'security', 'deployment', 'onboarding'].map(f => `<div class="filter-chip audit-filter ${f === 'all' ? 'active' : ''}" data-filter="${f}">${f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</div>`).join('')}
  </div>
  <div class="panel">
    ${AUDIT_LOG.map(a => `
      <div class="audit-item">
        <div class="audit-dot" style="background:${typeColors[a.type] || 'var(--text-dim)'}"></div>
        <div class="audit-content">
          <div class="audit-action"><strong>${a.action}</strong></div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${a.target}</div>
          <div class="audit-time">By ${a.user} · ${formatDateTime(a.time)} · <span class="badge ghost" style="font-size:9px">${a.type}</span>${a.ip ? ` · <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">IP: ${a.ip}</span>` : ''}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ═══════════════════════════════════════
// 11. AI ANALYTICS
// ═══════════════════════════════════════
function renderAIAnalytics() {
    const ai = AI_PREDICTIONS;
    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">🤖 AI Analytics & Predictions</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Machine learning insights powered by restaurant data</p>

  <!-- Revenue Forecast -->
  <div class="grid-3" style="margin-bottom:20px">
    <div class="ai-prediction"><div class="ai-label">🔮 AI Prediction · Tomorrow's Revenue</div><div class="ai-value">${fmt(ai.revenueForecast.tomorrow)}</div><div class="ai-confidence">${ai.revenueForecast.confidence}% confidence</div></div>
    <div class="ai-prediction"><div class="ai-label">📅 Next Week Forecast</div><div class="ai-value">${fmt(ai.revenueForecast.nextWeek)}</div><div class="ai-confidence">Based on 90-day trend analysis</div></div>
    <div class="ai-prediction"><div class="ai-label">📊 Next Month Projection</div><div class="ai-value">${fmt(ai.revenueForecast.nextMonth)}</div><div class="ai-confidence">Seasonal + growth factor applied</div></div>
  </div>

  <div class="grid-2">
    <!-- Top Predicted Items -->
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">🍽️ Predicted Top Sellers (Tomorrow)</div>
      ${ai.topPredictedItems.map((item, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;${i < ai.topPredictedItems.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
          <span style="font-size:16px;font-weight:900;width:24px;color:var(--text-dim)">${i + 1}</span>
          <div style="flex:1"><div style="font-weight:600;font-size:13px">${item.name}</div></div>
          <div style="font-weight:800;font-size:14px">${item.predicted}</div>
          <span style="font-size:14px">${item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️'}</span>
        </div>
      `).join('')}
    </div>

    <!-- Churn Risk -->
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">⚠️ Churn Risk Monitor</div>
      ${ai.churnRisk.map(c => `
        <div style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-weight:600;font-size:13px">${c.restaurant}</span><span style="font-weight:800;color:${c.risk > 70 ? 'var(--rose)' : c.risk > 50 ? 'var(--amber)' : 'var(--emerald)'}">${c.risk}%</span></div>
          <div class="progress"><div class="progress-fill" style="width:${c.risk}%;background:${c.risk > 70 ? 'var(--rose)' : c.risk > 50 ? 'var(--amber)' : 'var(--emerald)'}"></div></div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:4px">${c.reason}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="grid-2">
    <!-- Inventory Alerts -->
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">📦 AI Inventory Alerts</div>
      ${ai.inventoryAlerts.map(a => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:${a.severity === 'critical' ? 'var(--rose-bg)' : 'var(--amber-bg)'};border-radius:var(--radius-sm);border:1px solid ${a.severity === 'critical' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'}">
          <span style="font-size:18px">${a.severity === 'critical' ? '🚨' : '⚠️'}</span>
          <div style="flex:1"><div style="font-weight:600;font-size:13px">${a.item} — ${a.current} ${a.unit}</div><div style="font-size:11px;color:var(--text-muted)">${a.restaurant} · ${a.predicted}</div></div>
        </div>
      `).join('')}
    </div>

    <!-- Fraud Alerts -->
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">🛡️ Fraud Detection</div>
      ${ai.fraudAlerts.map(f => `
        <div style="padding:12px;margin-bottom:8px;background:${f.severity === 'high' ? 'var(--rose-bg)' : 'var(--amber-bg)'};border-radius:var(--radius-sm);border:1px solid ${f.severity === 'high' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'}">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-weight:700;font-size:13px">${f.type}</span>${priorityBadge(f.severity)}</div>
          <div style="font-size:12px;color:var(--text-secondary)">${f.description}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:4px">🏪 ${f.restaurant} · ${timeAgo(Date.now() - f.time)}</div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ═══════════════════════════════════════
// 12. USERS / TEAM
// ═══════════════════════════════════════
function renderUsers() {
    const roleLabels = { super_admin: 'Super Admin', support_agent: 'Support Agent', sales_rep: 'Sales Rep', engineer: 'Engineer' };
    const roleColors = { super_admin: 'amber', support_agent: 'purple', sales_rep: 'cyan', engineer: 'emerald' };

    return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div><h2 style="font-size:20px;font-weight:800">Team & Roles</h2><p style="font-size:13px;color:var(--text-muted)">Manage internal Restova team members</p></div>
    <button class="btn btn-primary" id="addTeamBtn">+ Add Team Member</button>
  </div>
  <div class="panel">
    <table class="dtable"><thead><tr><th>Member</th><th>Role</th><th>Region</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead><tbody>
      ${ADMIN_USERS.map(u => `<tr>
        <td><div style="display:flex;align-items:center;gap:10px"><div class="user-avatar-sm">${u.avatar}</div><div><div style="font-weight:600">${u.name}</div><div style="font-size:11px;color:var(--text-dim)">${u.email}</div></div></div></td>
        <td><span class="badge ${roleColors[u.role] || 'ghost'}">${roleLabels[u.role] || u.role}</span></td>
        <td style="font-size:12px;color:var(--text-muted)">${u.region || 'All'}</td>
        <td>${statusPill(u.status)}</td>
        <td style="font-size:12px;color:var(--text-muted)">${timeAgo(Date.now() - u.lastLogin)}</td>
        <td><button class="btn btn-xs btn-secondary edit-user-btn" data-user-id="${u.id}">Edit</button></td>
      </tr>`).join('')}
    </tbody></table>
  </div>

  <div class="panel" style="margin-top:20px">
    <div class="panel-title" style="margin-bottom:14px">🔐 Role Permissions Matrix</div>
    <table class="dtable"><thead><tr><th>Permission</th><th>Super Admin</th><th>Support Agent</th><th>Sales Rep</th><th>Engineer</th></tr></thead><tbody>
      ${[
            ['View all restaurants', '✅', '✅', '✅', '✅'],
            ['Edit restaurant config', '✅', '✅', '❌', '✅'],
            ['Manage subscriptions', '✅', '❌', '✅', '❌'],
            ['Push software updates', '✅', '❌', '❌', '✅'],
            ['Handle support tickets', '✅', '✅', '❌', '❌'],
            ['View analytics', '✅', '❌', '✅', '✅'],
            ['Manage team members', '✅', '❌', '❌', '❌'],
            ['Access audit log', '✅', '❌', '❌', '✅'],
        ].map(([perm, ...roles]) => `<tr><td style="font-weight:500">${perm}</td>${roles.map(r => `<td style="text-align:center">${r}</td>`).join('')}</tr>`).join('')}
    </tbody></table>
  </div>`;
}

// ═══════════════════════════════════════
// 13. SETTINGS
// ═══════════════════════════════════════
function renderSettings() {
    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:20px">Admin Settings</h2>
  <div class="grid-2">
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">🏢 Organization</div>
      <div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Company Name</label><input class="input-field" value="Restova Technologies"></div>
      <div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Support Email</label><input class="input-field" value="support@restova.com"></div>
      <div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Bilzora API URL</label><input class="input-field" value="https://bilzora.faizanldz07.workers.dev" id="bilzoraApiUrl"></div>
      <button class="btn btn-primary" id="saveSettingsBtn" style="margin-top:8px">💾 Save Settings</button>
    </div>
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">🔗 API Connection</div>
      <div style="padding:14px;background:var(--emerald-bg);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-sm);margin-bottom:12px">
        <div style="font-weight:700;font-size:13px;color:var(--emerald);margin-bottom:4px">✅ Bilzora API Connected</div>
        <div style="font-size:12px;color:var(--text-muted)">https://bilzora.faizanldz07.workers.dev</div>
      </div>
      <button class="btn btn-secondary" id="testApiBtn" style="width:100%">🔄 Test Connection</button>
      <div style="margin-top:16px"><div class="panel-title" style="margin-bottom:10px">📊 API Endpoints</div>
        ${['/api/orders', '/api/settings', '/api/counter', '/api/running', '/api/sync', '/api/reset'].map(e => `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)"><span class="badge ghost" style="font-size:10px;font-family:var(--font-mono)">GET</span><span style="font-size:12px;font-family:var(--font-mono);color:var(--text-secondary)">${e}</span></div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════
// 14. INTEGRATIONS (NEW)
// ═══════════════════════════════════════
function renderIntegrations() {
    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">🔗 Integration Orchestrator</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Manage external service connections, webhooks, and API credentials</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin-bottom:24px">
    ${INTEGRATIONS.map(ig => `
    <div class="panel" style="border-top:3px solid ${ig.status === 'active' ? 'var(--emerald)' : 'var(--border)'}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <span style="font-size:28px">${ig.icon}</span>
        <div style="flex:1"><div style="font-size:16px;font-weight:700">${ig.name}</div><span class="badge ghost" style="font-size:10px">${ig.type}</span></div>
        <span class="pill ${ig.status === 'active' ? 'online' : 'offline'}"><span class="pill-dot"></span>${ig.status}</span>
      </div>
      ${ig.status === 'active' ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="padding:8px;background:var(--bg-3);border-radius:var(--radius-sm);text-align:center"><div style="font-size:16px;font-weight:800">${ig.connectedRestaurants}</div><div style="font-size:10px;color:var(--text-dim)">Connected</div></div>
        <div style="padding:8px;background:var(--bg-3);border-radius:var(--radius-sm);text-align:center"><div style="font-size:16px;font-weight:800">${ig.totalOrders.toLocaleString()}</div><div style="font-size:10px;color:var(--text-dim)">Orders</div></div>
      </div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">Health: <strong style="color:${ig.health > 95 ? 'var(--emerald)' : 'var(--amber)'}">${ig.health}%</strong></div>
      <div class="progress" style="margin-bottom:10px"><div class="progress-fill" style="width:${ig.health}%;background:${ig.health > 95 ? 'var(--emerald)' : 'var(--amber)'}"></div></div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">API Key: <code style="background:var(--bg-3);padding:2px 6px;border-radius:4px;font-size:10px">${ig.apiKey}</code></div>
      ${ig.webhookUrl ? `<div style="font-size:11px;color:var(--text-dim)">Webhook: <code style="background:var(--bg-3);padding:2px 6px;border-radius:4px;font-size:10px">${ig.webhookUrl}</code></div>` : ''}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-xs btn-secondary integration-config-btn" data-id="${ig.id}">⚙️ Configure</button>
        <button class="btn btn-xs btn-ghost integration-disable-btn" data-id="${ig.id}" style="color:var(--rose)">Disable</button>
      </div>` : `
      <p style="font-size:12px;color:var(--text-dim);margin-bottom:12px">Not connected. Enable to start.</p>
      <button class="btn btn-sm btn-primary integration-enable-btn" data-id="${ig.id}">🔌 Enable</button>`}
    </div>`).join('')}
  </div>
  <div class="panel">
    <div class="panel-title" style="margin-bottom:14px">📊 Integration Order Flow</div>
    <div style="display:flex;align-items:center;gap:8px;padding:16px;background:var(--bg-3);border-radius:var(--radius-sm);font-size:13px;flex-wrap:wrap">
      <span class="badge purple">Aggregator Order</span><span style="color:var(--text-dim)">→</span>
      <span class="badge ghost">Webhook</span><span style="color:var(--text-dim)">→</span>
      <span class="badge cyan">Validate</span><span style="color:var(--text-dim)">→</span>
      <span class="badge blue">Route to POS</span><span style="color:var(--text-dim)">→</span>
      <span class="badge amber">KDS</span><span style="color:var(--text-dim)">→</span>
      <span class="badge emerald">Accepted</span>
    </div>
  </div>`;
}

// ═══════════════════════════════════════
// 15. INVOICES (NEW)
// ═══════════════════════════════════════
function renderInvoices() {
    const paid = INVOICES.filter(i => i.status === 'paid');
    const overdue = INVOICES.filter(i => i.status === 'overdue');
    const totalCollected = paid.reduce((s, i) => s + i.total, 0);
    const totalOverdue = overdue.reduce((s, i) => s + i.total, 0);
    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">🧾 Financial Control Center</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Invoice management, payment tracking, and revenue analytics</p>
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
    <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">Collected</span><span class="kpi-icon">💰</span></div><div class="kpi-value">${fmt(totalCollected)}</div></div>
    <div class="kpi-card rose"><div class="kpi-header"><span class="kpi-label">Overdue</span><span class="kpi-icon">⚠️</span></div><div class="kpi-value">${fmt(totalOverdue)}</div></div>
    <div class="kpi-card purple"><div class="kpi-header"><span class="kpi-label">Paid</span><span class="kpi-icon">✅</span></div><div class="kpi-value">${paid.length}</div></div>
    <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">Pending</span><span class="kpi-icon">🔴</span></div><div class="kpi-value">${overdue.length}</div></div>
  </div>
  <div class="panel">
    <div class="panel-header"><div class="panel-title">All Invoices</div><button class="btn btn-primary btn-sm" id="generateInvoiceBtn">+ Generate Invoice</button></div>
    <table class="dtable"><thead><tr><th>Invoice</th><th>Restaurant</th><th>Plan</th><th>Amount</th><th>Tax</th><th>Total</th><th>Status</th><th>Due</th><th>Payment</th></tr></thead><tbody>
      ${INVOICES.map(inv => `<tr>
        <td style="font-family:var(--font-mono);font-size:12px;font-weight:600">${inv.id}</td>
        <td style="font-weight:500">${inv.restaurant}</td>
        <td><span class="badge ${inv.plan === 'enterprise' ? 'amber' : inv.plan === 'growth' ? 'purple' : 'blue'}">${inv.plan}</span></td>
        <td>${fmt(inv.amount)}</td><td style="font-size:12px;color:var(--text-muted)">${fmt(inv.tax)}</td>
        <td style="font-weight:700">${fmt(inv.total)}</td>
        <td><span class="badge ${inv.status === 'paid' ? 'emerald' : inv.status === 'overdue' ? 'rose' : 'blue'}">${inv.status}</span></td>
        <td style="font-size:12px;font-family:var(--font-mono)">${inv.dueDate}</td>
        <td style="font-size:12px;color:var(--text-muted)">${inv.method || '—'}</td>
      </tr>`).join('')}
    </tbody></table>
  </div>`;
}

// ═══════════════════════════════════════
// 16. CRM & LOYALTY (NEW)
// ═══════════════════════════════════════
function renderCRM() {
    const crm = CRM_DATA;
    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">💎 CRM & Loyalty Program</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Customer relationship management and loyalty tier tracking</p>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
    <div class="kpi-card purple"><div class="kpi-header"><span class="kpi-label">Total Customers</span><span class="kpi-icon">👥</span></div><div class="kpi-value">${crm.totalCustomers.toLocaleString()}</div></div>
    <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">Active Members</span><span class="kpi-icon">💳</span></div><div class="kpi-value">${crm.activeMembers.toLocaleString()}</div></div>
    <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">Enrollment Rate</span><span class="kpi-icon">📈</span></div><div class="kpi-value">${Math.round(crm.activeMembers / crm.totalCustomers * 100)}%</div></div>
  </div>
  <div class="grid-2" style="margin-bottom:20px">
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">🏆 Loyalty Tiers</div>
      ${crm.loyaltyTiers.map(t => `<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="width:36px;height:36px;border-radius:50%;background:${t.color};display:flex;align-items:center;justify-content:center;font-size:16px">⭐</div>
        <div style="flex:1"><div style="font-weight:700">${t.name}</div><div style="font-size:11px;color:var(--text-dim)">${t.minPoints}+ pts · ${t.discount}% off</div></div>
        <div style="text-align:right"><div style="font-size:18px;font-weight:800">${t.members.toLocaleString()}</div><div style="font-size:10px;color:var(--text-dim)">members</div></div>
      </div>`).join('')}
    </div>
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">📢 Campaigns</div>
      ${crm.campaigns.map(c => `<div style="padding:12px;margin-bottom:8px;background:var(--bg-3);border-radius:var(--radius-sm)">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-weight:600;font-size:13px">${c.name}</span><span class="badge ${c.status === 'active' ? 'emerald' : c.status === 'scheduled' ? 'amber' : 'ghost'}">${c.status}</span></div>
        <div style="display:flex;gap:16px;font-size:12px;color:var(--text-muted)"><span>Reach: <strong>${c.reach.toLocaleString()}</strong></span><span>Conv: <strong>${c.conversions}</strong></span>${c.roi ? `<span>ROI: <strong style="color:var(--emerald)">${c.roi}%</strong></span>` : ''}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="panel">
    <div class="panel-title" style="margin-bottom:14px">📋 Recent Activity</div>
    <table class="dtable"><thead><tr><th>Customer</th><th>Action</th><th>Restaurant</th><th>Time</th></tr></thead><tbody>
      ${crm.recentActivities.map(a => `<tr><td style="font-weight:600">${a.customer}</td><td>${a.action}</td><td style="font-size:12px;color:var(--text-muted)">${a.restaurant}</td><td style="font-size:12px">${timeAgo(Date.now() - a.time)}</td></tr>`).join('')}
    </tbody></table>
  </div>`;
}

// ═══════════════════════════════════════
// 17. INVENTORY (NEW)
// ═══════════════════════════════════════
function renderInventory() {
    const inv = INVENTORY_DATA;
    return `
  <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">📦 Inventory Management</h2>
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Central inventory tracking across all restaurants</p>
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
    <div class="kpi-card cyan"><div class="kpi-header"><span class="kpi-label">Items Tracked</span><span class="kpi-icon">📊</span></div><div class="kpi-value">${inv.totalItems}</div></div>
    <div class="kpi-card amber"><div class="kpi-header"><span class="kpi-label">Low Stock</span><span class="kpi-icon">⚠️</span></div><div class="kpi-value">${inv.lowStockCount}</div></div>
    <div class="kpi-card rose"><div class="kpi-header"><span class="kpi-label">Out of Stock</span><span class="kpi-icon">🚨</span></div><div class="kpi-value">${inv.outOfStockCount}</div></div>
    <div class="kpi-card emerald"><div class="kpi-header"><span class="kpi-label">Total Value</span><span class="kpi-icon">💰</span></div><div class="kpi-value">${fmt(inv.categories.reduce((s, c) => s + c.value, 0))}</div></div>
  </div>
  <div class="grid-2" style="margin-bottom:20px">
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">📂 Categories</div>
      <table class="dtable"><thead><tr><th>Category</th><th>Items</th><th>Low Stock</th><th>Value</th></tr></thead><tbody>
        ${inv.categories.map(c => `<tr><td style="font-weight:600">${c.name}</td><td>${c.items}</td><td style="color:${c.lowStock > 0 ? 'var(--amber)' : 'var(--text-muted)'}">${c.lowStock}</td><td style="font-weight:700">${fmt(c.value)}</td></tr>`).join('')}
      </tbody></table>
    </div>
    <div class="panel">
      <div class="panel-title" style="margin-bottom:14px">🚨 Stock Alerts</div>
      ${inv.alerts.map(a => `<div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:${a.status === 'critical' ? 'var(--rose-bg)' : 'var(--amber-bg)'};border-radius:var(--radius-sm);border:1px solid ${a.status === 'critical' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'}">
        <span style="font-size:16px">${a.status === 'critical' ? '🔴' : '🟡'}</span>
        <div style="flex:1"><div style="font-weight:600;font-size:13px">${a.item}: ${a.current} ${a.unit} (min: ${a.reorderLevel})</div><div style="font-size:11px;color:var(--text-dim)">${a.restaurant} · ${a.supplier}</div></div>
        <button class="btn btn-xs btn-primary reorder-btn" data-item="${a.item}">📦 Reorder</button>
      </div>`).join('')}
    </div>
  </div>
  <div class="panel">
    <div class="panel-title" style="margin-bottom:14px">📋 Purchase Orders</div>
    <table class="dtable"><thead><tr><th>PO #</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
      ${inv.recentOrders.map(o => `<tr>
        <td style="font-family:var(--font-mono);font-weight:600">${o.id}</td>
        <td>${o.supplier}</td><td>${o.items}</td>
        <td style="font-weight:700">${fmt(o.total)}</td>
        <td><span class="badge ${o.status === 'delivered' ? 'emerald' : o.status === 'in-transit' ? 'amber' : 'blue'}">${o.status}</span></td>
        <td style="font-size:12px">${timeAgo(Date.now() - o.date)}</td>
      </tr>`).join('')}
    </tbody></table>
  </div>`;
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function statusPill(status) {
    const m = { active: 'online', suspended: 'offline', trial: 'warning', inactive: 'offline' };
    const l = { active: 'Active', suspended: 'Suspended', trial: 'Trial', inactive: 'Inactive' };
    return `<span class="pill ${m[status] || 'online'}"><span class="pill-dot"></span>${l[status] || status}</span>`;
}

function lifecycleBadge(lc) {
    const state = LIFECYCLE_STATES.find(s => s.id === lc);
    if (!state) return '';
    return `<span class="badge" style="background:${state.color}22;color:${state.color};border:1px solid ${state.color}44;font-size:10px">${state.label}</span>`;
}

function priorityBadge(p) {
    const c = { critical: 'rose', high: 'amber', medium: 'blue', low: 'ghost' };
    return `<span class="badge ${c[p] || 'ghost'}">${p}</span>`;
}

function infoRow(label, value) {
    return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--text-muted)">${label}</span><span style="font-weight:600">${value}</span></div>`;
}
