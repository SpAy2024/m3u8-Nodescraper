const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL no proporcionada');

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
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
      res.json({ success: true, m3u8: m3u8Url });
    } else {
      res.json({ success: false, message: 'No se encontró M3U8' });
    }
  } catch (err) {
    res.status(500).send('Error al procesar la página: ' + err.message);
  }
});

app.get('/', (req, res) => {
  res.send('M3U8 Scraper en funcionamiento. Usa /scrape?url=https://...');
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

