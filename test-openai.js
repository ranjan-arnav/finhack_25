const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env.local manually since we can't depend on Next.js env loading in this script
const envPath = path.join(__dirname, '.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_OPENAI_API_KEY=(sk-[a-zA-Z0-9\-_]+)/);
    if (match && match[1]) {
        apiKey = match[1];
    }
} catch (error) {
    console.error('Error reading .env.local:', error);
    process.exit(1);
}

if (!apiKey) {
    console.error('Could not find NEXT_PUBLIC_OPENAI_API_KEY in .env.local');
    process.exit(1);
}

console.log('Testing OpenAI Key:', apiKey.substring(0, 8) + '...');

const data = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Say this is a test" }],
    temperature: 0.7
});

const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            console.log('Response Body:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Response Body (Raw):', body);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
