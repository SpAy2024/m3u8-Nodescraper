const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/getm3u8', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    let m3u8Url = null;

    page.on('request', request => {
      const reqUrl = request.url();
      if (reqUrl.includes('.m3u8')) {
        m3u8Url = reqUrl;
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(5000);
    await browser.close();

    if (m3u8Url) {
      res.json({ m3u8: m3u8Url });
    } else {
      res.json({ m3u8: null, message: 'No se encontró archivo .m3u8' });
    }

  } catch (err) {
    res.status(500).json({ error: 'Error procesando la URL', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Servicio M3U8 Scraper activo.');
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});

