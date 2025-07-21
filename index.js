const puppeteer = require('puppeteer');

async function getM3U8(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let m3u8Url = null;

  page.on('request', request => {
    const reqUrl = request.url();
    if (reqUrl.includes('.m3u8')) {
      m3u8Url = reqUrl;
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(5000);
  } catch (e) {
    console.error('Error cargando la página:', e.message);
  }

  await browser.close();
  return m3u8Url;
}

const inputUrl = process.argv[2];

if (!inputUrl) {
  console.error('Por favor, pasa una URL como argumento');
  process.exit(1);
}

getM3U8(inputUrl).then(m3u8 => {
  if (m3u8) {
    console.log('URL M3U8 encontrada:', m3u8);
  } else {
    console.log('No se encontró URL M3U8.');
  }
});
