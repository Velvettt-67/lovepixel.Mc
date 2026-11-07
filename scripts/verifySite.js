import http from 'http';

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, length: data.length, data });
      });
    }).on('error', reject);
  });
}

async function verify() {
  const routes = ['/', '/community', '/staff', '/events', '/partners', '/payouts', '/gallery'];
  console.log('Testing dev server responses:');
  for (const r of routes) {
    const res = await checkUrl(`http://localhost:5173${r}`);
    console.log(`Route: ${r.padEnd(12)} -> Status: ${res.statusCode}, Body size: ${res.length} bytes`);
    if (res.statusCode !== 200 || !res.data.includes('<div id="root"></div>')) {
      console.error(`FAILED: ${r}`);
      process.exit(1);
    }
  }
  console.log('All dev routes verified successfully!');
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
