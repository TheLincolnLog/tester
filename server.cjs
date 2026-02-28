const http = require('http'), 
      https = require('https'), 
      fs = require('fs'), 
      path = require('path');

const PORT = process.env.PORT || 3001;
const KEY = process.env.GEMINI_API_KEY;
const HOST = 'generativelanguage.googleapis.com';
const MIME = { 
    '.html': 'text/html', 
    '.js': 'application/javascript', 
    '.png': 'image/png', 
    '.jpg': 'image/jpeg', 
    '.ico': 'image/x-icon', 
    '.json': 'application/json' 
};

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function callGemini(model, body, attempt = 1) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: HOST,
            path: `/v1beta/models/${model}:generateContent?key=${encodeURIComponent(KEY)}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const pr = https.request(opts, r => {
            const cs = [];
            r.on('data', c => cs.push(c));
            r.on('end', async () => {
                const responseData = Buffer.concat(cs).toString('utf8');
                if (r.statusCode === 429 && attempt <= 3) {
                    const wait = attempt * 2000;
                    console.log(`[429] Retrying in ${wait}ms...`);
                    await sleep(wait);
                    return resolve(callGemini(model, body, attempt + 1));
                }
                resolve({ status: r.statusCode, data: responseData });
            });
        });

        pr.on('error', e => reject(e));
        pr.write(body);
        pr.end();
    });
}

// 1. Create the server first
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Methods': 'POST,GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
        res.end();
        return;
    }

    if (req.url.startsWith('/api/gemini') && req.method === 'POST') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', async () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const parsed = JSON.parse(raw);
                const model = 'gemini-2.5-flash'; 
                delete parsed.model;
                const body = JSON.stringify(parsed);

                console.log(`[proxy] -> Requesting ${model}`);
                const result = await callGemini(model, body);
                
                res.writeHead(result.status, { 'Content-Type': 'application/json' });
                res.end(result.data);
            } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Server processing error' }));
            }
        });
        return;
    }

    const fp = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    fs.readFile(fp, (e, d) => {
        if (e) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'text/plain' });
        res.end(d);
    });
});

// 2. Then call .listen() on that variable
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server live at port ${PORT}`);
});
