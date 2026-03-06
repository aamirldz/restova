-- Restova Admin Panel — D1 Database Schema

-- Restaurants managed by the admin panel
CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Devices registered to restaurants
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'online',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Support tickets
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    target TEXT,
    user TEXT DEFAULT 'Super Admin',
    type TEXT DEFAULT 'config',
    ip TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Admin users / team
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Integrations config
CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Key-value settings store
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_devices_restaurant ON devices(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_restaurant ON invoices(restaurant_id);

-- Default super admin
INSERT OR IGNORE INTO admin_users (id, data, status) VALUES (
    'USR-001',
    '{"id":"USR-001","name":"Super Admin","email":"admin@restova.com","role":"super_admin","avatar":"SA","twoFAEnabled":true}',
    'active'
);
