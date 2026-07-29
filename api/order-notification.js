const ENDPOINT = process.env.FORMSPREE_ORDER_ENDPOINT || 'https://formspree.io/f/mqerbqvd';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  const params = new URLSearchParams();
  params.set('_subject', payload._subject || `New LHA order ${payload.orderNumber || ''}`);
  params.set('form_type', 'order');
  params.set('email', payload.customerEmail || payload.email || 'orders@libyahoopsacademy.com');
  params.set('_replyto', payload.customerEmail || payload.email || '');
  params.set('message', payload.message || JSON.stringify(payload, null, 2));
  for (const [k,v] of Object.entries(payload)) if (!params.has(k)) params.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  try {
    const upstream = await fetch(ENDPOINT, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8','Accept':'application/json'}, body:params.toString() });
    const text = await upstream.text();
    if (!upstream.ok) return res.status(502).json({ok:false,status:upstream.status,detail:text.slice(0,500)});
    return res.status(200).json({ok:true});
  } catch (e) { return res.status(502).json({ok:false,error:String(e?.message||e)}); }
}
