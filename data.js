/* ═══════════════════════════════════════════════════════════
   RESTOVA — Complete Data Layer
   Production-ready — All data reset to empty
   ═══════════════════════════════════════════════════════════ */

// ── LIFECYCLE STATES (System Config — Keep) ──
export const LIFECYCLE_STATES = [
    { id: 'lead', label: 'Lead', color: '#94A3B8', next: ['trial'] },
    { id: 'trial', label: 'Trial', color: '#3B82F6', next: ['onboarding', 'churned'] },
    { id: 'onboarding', label: 'Onboarding', color: '#8B5CF6', next: ['active', 'churned'] },
    { id: 'active', label: 'Active', color: '#10B981', next: ['renewal_due', 'grace_period', 'churned'] },
    { id: 'renewal_due', label: 'Renewal Due', color: '#F59E0B', next: ['renewed', 'grace_period', 'expired'] },
    { id: 'renewed', label: 'Renewed', color: '#10B981', next: ['active'] },
    { id: 'grace_period', label: 'Grace Period', color: '#EF4444', next: ['renewed', 'expired'] },
    { id: 'expired', label: 'Expired', color: '#6B7280', next: ['won_back', 'churned'] },
    { id: 'churned', label: 'Churned', color: '#DC2626', next: ['won_back'] },
    { id: 'won_back', label: 'Won Back', color: '#059669', next: ['active'] },
];

// ── RESTAURANTS ──
export const RESTAURANTS = [];

// ── SUBSCRIPTIONS / PLANS (System Config — Keep) ──
export const PLANS = [
    { id: 'starter', name: 'Starter', price: 8000, period: 'year', color: '#3B82F6', features: ['1 POS Terminal', 'Basic Billing', 'KOT Printing', 'Daily Reports', 'Email Support'] },
    { id: 'growth', name: 'Growth', price: 18000, period: 'year', color: '#8B5CF6', features: ['3 POS Terminals', 'KDS + Captain App', 'Inventory Management', 'CRM & Loyalty', '80+ Reports', 'Priority Support', 'Online Ordering'] },
    { id: 'enterprise', name: 'Enterprise', price: 36000, period: 'year', color: '#F59E0B', features: ['Unlimited Terminals', 'Multi-Outlet Chain', 'AI Analytics', 'API Access', 'Custom Integrations', 'Dedicated Support', 'SLA 99.9%', 'White Label Option'] },
];

// ── DEVICES ──
export const DEVICES = [];

// ── SUPPORT TICKETS ──
export const TICKETS = [];

// ── AUDIT LOG ──
export const AUDIT_LOG = [];

// ── SOFTWARE VERSIONS (System Config — Keep) ──
export const VERSIONS = [
    { version: '2.4.1', date: '2026-02-28', status: 'latest', rollout: 100, stage: 'production', changelog: ['Fixed KOT reprint bug', 'Added split payment for tables', 'Performance optimization for 100+ menu items', 'Dashboard auto-refresh improvement'] },
    { version: '2.4.0', date: '2026-02-15', status: 'stable', rollout: 100, stage: 'production', changelog: ['Table management overhaul', 'Added bill-pending & paid states', 'KDS item-level ready', 'Report history archival (90 days)'] },
    { version: '2.3.8', date: '2026-01-20', status: 'deprecated', rollout: 100, stage: 'production', changelog: ['CRM loyalty tiers', 'Inventory tracking', 'Staff login system', 'D1 cloud sync'] },
    { version: '2.3.5', date: '2025-12-10', status: 'unsupported', rollout: 100, stage: 'production', changelog: ['Initial release', 'Basic POS billing', 'KOT printing', 'Simple reports'] },
];

// ── DEPLOYMENT PIPELINE (System Config — Keep) ──
export const DEPLOYMENT_PIPELINE = {
    stages: ['development', 'testing', 'staging', 'canary', 'regional', 'production'],
    current: {
        version: '2.4.1',
        stage: 'production',
        progress: 100,
        startedAt: Date.now() - 86400000 * 7,
        canaryTarget: 0,
        canaryActual: 0,
        regionalTargets: [],
        failedChecks: 0,
        passedChecks: 0,
        rollbackAvailable: false,
    },
    history: []
};

// ── INTEGRATIONS ──
export const INTEGRATIONS = [
    { id: 'INT-001', name: 'Zomato', type: 'aggregator', icon: '🍽️', status: 'inactive', connectedRestaurants: 0, totalOrders: 0, lastSync: null, apiKey: null, webhookUrl: null, health: 0 },
    { id: 'INT-002', name: 'Swiggy', type: 'aggregator', icon: '🛵', status: 'inactive', connectedRestaurants: 0, totalOrders: 0, lastSync: null, apiKey: null, webhookUrl: null, health: 0 },
    { id: 'INT-003', name: 'Razorpay', type: 'payment', icon: '💳', status: 'inactive', connectedRestaurants: 0, totalOrders: 0, lastSync: null, apiKey: null, webhookUrl: null, health: 0 },
    { id: 'INT-004', name: 'PhonePe UPI', type: 'payment', icon: '📱', status: 'inactive', connectedRestaurants: 0, totalOrders: 0, lastSync: null, apiKey: null, webhookUrl: null, health: 0 },
    { id: 'INT-005', name: 'Google My Business', type: 'marketing', icon: '📍', status: 'inactive', connectedRestaurants: 0, totalOrders: 0, lastSync: null, apiKey: null, webhookUrl: null, health: 0 },
    { id: 'INT-006', name: 'WhatsApp Business', type: 'communication', icon: '💬', status: 'inactive', connectedRestaurants: 0, totalOrders: 0, lastSync: null, apiKey: null, webhookUrl: null, health: 0 },
];

// ── INVOICES ──
export const INVOICES = [];

// ── CRM & LOYALTY ──
export const CRM_DATA = {
    totalCustomers: 0,
    activeMembers: 0,
    loyaltyTiers: [
        { name: 'Bronze', minPoints: 0, members: 0, discount: 5, color: '#CD7F32' },
        { name: 'Silver', minPoints: 500, members: 0, discount: 10, color: '#C0C0C0' },
        { name: 'Gold', minPoints: 1500, members: 0, discount: 15, color: '#FFD700' },
        { name: 'Platinum', minPoints: 5000, members: 0, discount: 20, color: '#E5E4E2' },
    ],
    recentActivities: [],
    campaigns: [],
};

// ── INVENTORY ──
export const INVENTORY_DATA = {
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categories: [],
    alerts: [],
    recentOrders: [],
};

// ── SUPPORT METRICS ──
export const SUPPORT_METRICS = {
    avgResolutionTime: 0,
    firstContactResolution: 0,
    csatScore: 0,
    ticketsPerAgent: {},
    volumeByDay: [0, 0, 0, 0, 0, 0, 0],
    byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    slaCompliance: 0,
};

// ── SYSTEM HEALTH ──
export const SYSTEM_HEALTH = {
    apiLatency: 0,
    serverLoad: 0,
    uptime: 0,
    dbConnections: 0,
    activeWebSockets: 0,
    regions: {},
    peakHours: [],
    alerts: [],
};

// ── AI PREDICTIONS ──
export const AI_PREDICTIONS = {
    revenueForecast: { tomorrow: 0, nextWeek: 0, nextMonth: 0, confidence: 0 },
    topPredictedItems: [],
    inventoryAlerts: [],
    fraudAlerts: [],
    churnRisk: [],
};

// ── TEAM / ADMIN USERS ──
export const ADMIN_USERS = [
    { id: 'USR-001', name: 'Super Admin', email: 'admin@restova.com', role: 'super_admin', status: 'active', lastLogin: Date.now(), avatar: 'SA', twoFAEnabled: true },
];

// ── HELPERS ──
export function timeAgo(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return s + 's ago';
    const m = Math.floor(s / 60);
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    const d = Math.floor(h / 24);
    return d + 'd ago';
}

export function formatCurrency(n) {
    return '₹' + (n || 0).toLocaleString('en-IN');
}

export function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(ts) {
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function addAuditEntry(action, target, user = 'Super Admin', type = 'config') {
    AUDIT_LOG.unshift({
        id: 'AUD-' + String(AUDIT_LOG.length + 1).padStart(3, '0'),
        action, target, user, type,
        time: Date.now(),
        ip: '103.42.156.78',
    });
}
