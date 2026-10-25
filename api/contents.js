import fs from 'fs';
import path from 'path';

// Vercel Serverless Function: /api/contents
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const jsonPath = path.join(process.cwd(), 'yedekler', 'contents.json');
    let contents = [];

    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8');
      contents = JSON.parse(raw);
    }

    // Slug veya ID ile tekil kayıt sorgusu (örn: /api/contents?slug=audi-rs7-sportback veya URL path)
    const { slug, id, status, category, search } = req.query;

    if (slug || id) {
      const target = (slug || id).toString().toLowerCase();
      const item = contents.find(c => 
        (c.slug && c.slug.toLowerCase() === target) || 
        String(c.id) === target
      );

      if (!item) {
        return res.status(404).json({ error: 'İçerik bulunamadı' });
      }
      return res.status(200).json(item);
    }

    // Filtreleme
    let result = [...contents];

    if (status !== undefined && status !== 'all') {
      const isStatusTrue = status === 'true' || status === '1';
      result = result.filter(c => Boolean(c.status) === isStatusTrue);
    }

    if (category && category !== 'All') {
      result = result.filter(c => c.category && c.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      result = result.filter(c => 
        (c.title && c.title.toLowerCase().includes(s)) ||
        (c.summary && c.summary.toLowerCase().includes(s))
      );
    }

    // Sıralama
    result.sort((a, b) => {
      const orderA = a.sort_order ?? 999999;
      const orderB = b.sort_order ?? 999999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Vercel API error:', err);
    return res.status(500).json({ error: 'Veri okuma hatası: ' + err.message });
  }
}
