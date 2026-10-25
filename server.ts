import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const SITE_URL = process.env.VITE_SITE_URL || process.env.APP_URL || 'https://batteryhousepk.com';

async function createServer() {
  const app = express();

  // Middleware to parse json
  app.use(express.json());

  // Dynamic Sitemap endpoint
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const staticRoutes = [
      '',
      '/services',
      '/custom-pack',
      '/about',
      '/contact',
      '/track-order',
      '/payment-methods',
      '/shipping-returns',
      '/warranty',
      '/terms',
      '/privacy',
      '/blog',
      '/blog/how-36v-10s-pack-is-built',
      '/blog/how-to-spot-fake-18650-cells',
      '/blog/4s-vs-6s-drone-batteries',
      '/category/12v-battery-packs',
      '/category/24v-battery-packs',
      '/category/36v-battery-packs',
      '/category/48v-battery-packs',
      '/category/lithium-cells-18650'
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${SITE_URL.replace(/\/$/, '')}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : route.startsWith('/blog') ? '0.7' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  });

  // Robots.txt endpoint
  app.get('/robots.txt', (_req: Request, res: Response) => {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /account

Sitemap: ${SITE_URL.replace(/\/$/, '')}/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(robotsTxt);
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      business: 'BatteryHouse PK',
      services: ['Lithium Battery Packs', 'Custom Assembly', 'PCB Assembly', 'SMD Soldering'],
      timestamp: new Date().toISOString()
    });
  });

  let vite: any;
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0'
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  // Pre-render bot middleware for Googlebot, GPTBot, ClaudeBot, PerplexityBot
  app.use('*', async (req: Request, res: Response, next) => {
    const url = req.originalUrl;
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /Googlebot|GPTBot|ClaudeBot|PerplexityBot|bingbot|facebookexternalhit|Twitterbot/i.test(userAgent);

    try {
      let template: string;
      if (!isProduction) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        const indexPath = path.resolve(__dirname, 'dist/index.html');
        template = fs.readFileSync(indexPath, 'utf-8');
      }

      // If requested by a search or AI crawler, inject semantic HTML text with confirmed facts only
      if (isBot) {
        const crawlerContent = `
          <div id="crawler-content" style="padding:24px; font-family:sans-serif; background:#091D33; color:#F4F8FB;">
            <h1>BatteryHouse PK – Lithium Battery Packs &amp; Custom Assembly</h1>
            <p>Pakistan-based seller of lithium battery packs (12V, 24V, 36V, 48V packs built from 18650 cells), 3.7V lithium cells, and custom-built packs. We also offer PCB assembly and precision SMD soldering services.</p>
            
            <h2>Contact &amp; Ordering Information</h2>
            <p>Phone &amp; WhatsApp: 03419257891 (https://wa.me/923419257891) | Email: batteryhousepk82@gmail.com | Location: Pakistan</p>
            <p>Accepted Payments: Cash on Delivery, JazzCash and Easypaisa on 03419257891 (Account Title: Battery House PK).</p>
            
            <h2>Product Categories</h2>
            <ul>
              <li>12V Lithium Battery Packs (built from 18650 cells)</li>
              <li>24V Lithium Battery Packs</li>
              <li>36V Lithium Battery Packs (for electric bikes and vehicles)</li>
              <li>48V Lithium Battery Packs</li>
              <li>3.7V Lithium Cells (18650)</li>
              <li>Custom-built battery packs to customer specifications</li>
            </ul>

            <h2>Technical Services</h2>
            <ul>
              <li>Custom lithium battery pack assembly</li>
              <li>Printed Circuit Board (PCB) assembly</li>
              <li>Surface Mount Device (SMD) soldering</li>
            </ul>
          </div>
        `;
        template = template.replace('<div id="root"></div>', `<div id="root">${crawlerContent}</div>`);
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ BatteryHouse PK server active at http://0.0.0.0:${PORT}`);
  });
}

createServer();
