import { put, get } from '@vercel/blob';

// Slaat de stand van de paklijst op in een Vercel Blob-store.
// GET  /api/state?key=abc123   -> { ok:true, state:{...} }
// POST /api/state?key=abc123   -> body: { check:{}, koop:{} }
//
// De sleutel is een willekeurige string die de browser zelf aanmaakt.
// Wie de sleutel niet heeft, komt niet bij de lijst.

const PREFIX = 'waterlinie/';

function geldigeSleutel(k) {
  return typeof k === 'string' && /^[a-z0-9]{8,40}$/.test(k);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(501).json({
      ok: false,
      error: 'geen-store',
      message: 'Er is nog geen Blob-store aan dit project gekoppeld.'
    });
  }

  const key = (req.query && req.query.key) || '';
  if (!geldigeSleutel(key)) {
    return res.status(400).json({ ok: false, error: 'ongeldige-sleutel' });
  }
  const pathname = PREFIX + key + '.json';

  try {
    if (req.method === 'GET') {
      const result = await get(pathname, { access: 'private', useCache: false });
      if (!result || result.statusCode !== 200) {
        return res.status(200).json({ ok: true, state: null });
      }
      const tekst = await new Response(result.stream).text();
      return res.status(200).json({ ok: true, state: JSON.parse(tekst) });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ ok: false, error: 'geen-body' });
      }
      const schoon = {
        check: body.check && typeof body.check === 'object' ? body.check : {},
        koop: body.koop && typeof body.koop === 'object' ? body.koop : {},
        bijgewerkt: new Date().toISOString()
      };
      await put(pathname, JSON.stringify(schoon), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true
      });
      return res.status(200).json({ ok: true, bijgewerkt: schoon.bijgewerkt });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'methode-niet-toegestaan' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'mislukt', message: String((e && e.message) || e) });
  }
}
