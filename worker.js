/**
 * RESTOVA — Cloudflare Worker
 * Serves static assets + D1 API for persistent admin data
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // API routes
        if (url.pathname.startsWith('/api/')) {
            return handleAPI(url, request, env);
        }

        // Static assets handled by Cloudflare's asset binding
        return env.ASSETS.fetch(request);
    }
};

// ═══════════════════════════════════════
// API HANDLER
// ═══════════════════════════════════════
async function handleAPI(url, request, env) {
    const path = url.pathname;
    const method = request.method;
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

    // CORS preflight
    if (method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    try {
        // ══════════════════════════
        // RESTAURANTS
        // ══════════════════════════
        if (path === '/api/restaurants' && method === 'GET') {
            const rows = await env.DB.prepare('SELECT id, data, status, created_at FROM restaurants ORDER BY created_at DESC').all();
            const restaurants = rows.results.map(r => ({ ...JSON.parse(r.data), _status: r.status }));
            return new Response(JSON.stringify(restaurants), { headers });
        }

        if (path === '/api/restaurants' && method === 'POST') {
            const restaurant = await request.json();
            await env.DB.prepare('INSERT OR REPLACE INTO restaurants (id, data, status, updated_at) VALUES (?, ?, ?, unixepoch())')
                .bind(restaurant.id, JSON.stringify(restaurant), restaurant.status || 'active').run();
            return new Response(JSON.stringify({ ok: true, id: restaurant.id }), { headers });
        }

        if (path.startsWith('/api/restaurants/') && method === 'PUT') {
            const id = path.split('/api/restaurants/')[1];
            const restaurant = await request.json();
            await env.DB.prepare('UPDATE restaurants SET data = ?, status = ?, updated_at = unixepoch() WHERE id = ?')
                .bind(JSON.stringify(restaurant), restaurant.status || 'active', id).run();
            return new Response(JSON.stringify({ ok: true }), { headers });
        }

        if (path.startsWith('/api/restaurants/') && method === 'DELETE') {
            const id = path.split('/api/restaurants/')[1];
            await env.DB.prepare('DELETE FROM restaurants WHERE id = ?').bind(decodeURIComponent(id)).run();
            return new Response(JSON.stringify({ ok: true }), { headers });
        }

        // ══════════════════════════
        // DEVICES
        // ══════════════════════════
        if (path === '/api/devices' && method === 'GET') {
            const rows = await env.DB.prepare('SELECT id, data, status FROM devices ORDER BY created_at DESC').all();
            const devices = rows.results.map(r => ({ ...JSON.parse(r.data), _status: r.status }));
            return new Response(JSON.stringify(devices), { headers });
        }

        if (path === '/api/devices' && method === 'POST') {
            const device = await request.json();
            await env.DB.prepare('INSERT OR REPLACE INTO devices (id, restaurant_id, data, status, updated_at) VALUES (?, ?, ?, ?, unixepoch())')
                .bind(device.id, device.restaurantId, JSON.stringify(device), device.status || 'online').run();
            return new Response(JSON.stringify({ ok: true, id: device.id }), { headers });
        }

        if (path.startsWith('/api/devices/') && method === 'DELETE') {
            const id = path.split('/api/devices/')[1];
            await env.DB.prepare('DELETE FROM devices WHERE id = ?').bind(decodeURIComponent(id)).run();
            return new Response(JSON.stringify({ ok: true }), { headers });
        }

        // ══════════════════════════
        // TICKETS
        // ══════════════════════════
        if (path === '/api/tickets' && method === 'GET') {
            const rows = await env.DB.prepare('SELECT id, data, status FROM tickets ORDER BY created_at DESC').all();
            const tickets = rows.results.map(r => ({ ...JSON.parse(r.data), _status: r.status }));
            return new Response(JSON.stringify(tickets), { headers });
        }

        if (path === '/api/tickets' && method === 'POST') {
            const ticket = await request.json();
            await env.DB.prepare('INSERT OR REPLACE INTO tickets (id, restaurant_id, data, status, updated_at) VALUES (?, ?, ?, ?, unixepoch())')
                .bind(ticket.id, ticket.restaurantId || null, JSON.stringify(ticket), ticket.status || 'open').run();
            return new Response(JSON.stringify({ ok: true, id: ticket.id }), { headers });
        }

        if (path.startsWith('/api/tickets/') && method === 'PUT') {
            const id = path.split('/api/tickets/')[1];
            const ticket = await request.json();
            await env.DB.prepare('UPDATE tickets SET data = ?, status = ?, updated_at = unixepoch() WHERE id = ?')
                .bind(JSON.stringify(ticket), ticket.status || 'open', id).run();
            return new Response(JSON.stringify({ ok: true }), { headers });
        }

        // ══════════════════════════
        // AUDIT LOG
        // ══════════════════════════
        if (path === '/api/audit' && method === 'GET') {
            const limit = parseInt(url.searchParams.get('limit') || '100');
            const rows = await env.DB.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?').bind(limit).all();
            return new Response(JSON.stringify(rows.results), { headers });
        }

        if (path === '/api/audit' && method === 'POST') {
            const entry = await request.json();
            const id = 'AUD-' + Date.now();
            await env.DB.prepare('INSERT INTO audit_log (id, action, target, user, type, ip) VALUES (?, ?, ?, ?, ?, ?)')
                .bind(id, entry.action, entry.target || null, entry.user || 'Super Admin', entry.type || 'config', entry.ip || null).run();
            return new Response(JSON.stringify({ ok: true, id }), { headers });
        }

        // ══════════════════════════
        // INVOICES
        // ══════════════════════════
        if (path === '/api/invoices' && method === 'GET') {
            const rows = await env.DB.prepare('SELECT id, data, status FROM invoices ORDER BY created_at DESC').all();
            const invoices = rows.results.map(r => ({ ...JSON.parse(r.data), _status: r.status }));
            return new Response(JSON.stringify(invoices), { headers });
        }

        if (path === '/api/invoices' && method === 'POST') {
            const invoice = await request.json();
            await env.DB.prepare('INSERT OR REPLACE INTO invoices (id, restaurant_id, data, status) VALUES (?, ?, ?, ?)')
                .bind(invoice.id, invoice.restaurantId || null, JSON.stringify(invoice), invoice.status || 'pending').run();
            return new Response(JSON.stringify({ ok: true, id: invoice.id }), { headers });
        }

        // ══════════════════════════
        // ADMIN USERS
        // ══════════════════════════
        if (path === '/api/users' && method === 'GET') {
            const rows = await env.DB.prepare('SELECT id, data, status FROM admin_users ORDER BY created_at DESC').all();
            const users = rows.results.map(r => ({ ...JSON.parse(r.data), _status: r.status }));
            return new Response(JSON.stringify(users), { headers });
        }

        if (path === '/api/users' && method === 'POST') {
            const user = await request.json();
            await env.DB.prepare('INSERT OR REPLACE INTO admin_users (id, data, status) VALUES (?, ?, ?)')
                .bind(user.id, JSON.stringify(user), user.status || 'active').run();
            return new Response(JSON.stringify({ ok: true, id: user.id }), { headers });
        }

        // ══════════════════════════
        // INTEGRATIONS
        // ══════════════════════════
        if (path === '/api/integrations' && method === 'GET') {
            const rows = await env.DB.prepare('SELECT id, data FROM integrations ORDER BY id').all();
            const integrations = rows.results.map(r => JSON.parse(r.data));
            return new Response(JSON.stringify(integrations), { headers });
        }

        if (path === '/api/integrations' && method === 'POST') {
            const integration = await request.json();
            await env.DB.prepare('INSERT OR REPLACE INTO integrations (id, data, updated_at) VALUES (?, ?, unixepoch())')
                .bind(integration.id, JSON.stringify(integration)).run();
            return new Response(JSON.stringify({ ok: true }), { headers });
        }

        // ══════════════════════════
        // SETTINGS (key-value)
        // ══════════════════════════
        if (path === '/api/settings' && method === 'GET') {
            const rows = await env.DB.prepare('SELECT key, value FROM settings').all();
            const settings = {};
            rows.results.forEach(r => { settings[r.key] = r.value; });
            return new Response(JSON.stringify(settings), { headers });
        }

        if (path === '/api/settings' && method === 'PUT') {
            const body = await request.json();
            const stmt = env.DB.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, unixepoch())');
            const batch = Object.entries(body).map(([k, v]) => stmt.bind(k, typeof v === 'string' ? v : JSON.stringify(v)));
            if (batch.length) await env.DB.batch(batch);
            return new Response(JSON.stringify({ ok: true }), { headers });
        }

        // ══════════════════════════
        // DASHBOARD STATS
        // ══════════════════════════
        if (path === '/api/stats' && method === 'GET') {
            const restaurants = await env.DB.prepare('SELECT COUNT(*) as count FROM restaurants').first();
            const activeRestaurants = await env.DB.prepare("SELECT COUNT(*) as count FROM restaurants WHERE status = 'active'").first();
            const devices = await env.DB.prepare('SELECT COUNT(*) as count FROM devices').first();
            const openTickets = await env.DB.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('open','in-progress')").first();
            const invoices = await env.DB.prepare('SELECT COUNT(*) as count FROM invoices').first();

            return new Response(JSON.stringify({
                totalRestaurants: restaurants?.count || 0,
                activeRestaurants: activeRestaurants?.count || 0,
                totalDevices: devices?.count || 0,
                openTickets: openTickets?.count || 0,
                totalInvoices: invoices?.count || 0,
            }), { headers });
        }

        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}
