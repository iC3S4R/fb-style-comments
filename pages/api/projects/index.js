import { createServiceClient } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  const svc = createServiceClient();
  if (req.method === 'POST') {
    const { title, slug, lang, data, public: isPublic = true } = req.body;
    if(!slug) return res.status(400).json({ error: 'slug required' });
    try {
      const { data: up, error } = await svc.from('projects').upsert([{ title, slug, lang, data, public: isPublic }], { onConflict: 'slug', returning: 'representation' });
      if (error) throw error;
      return res.status(200).json(up?.[0] || up);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}