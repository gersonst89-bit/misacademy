const fs = require('fs');

async function scrape() {
  try {
    const res = await fetch('https://siteedufuture.xyz/');
    const html = await res.text();
    fs.writeFileSync('site_dump.html', html);
    console.log('Successfully saved to site_dump.html');
  } catch (err) {
    console.error('Error fetching site:', err);
  }
}

scrape();
