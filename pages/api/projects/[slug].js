import { createServiceClient } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  const svc = createServiceClient();
  const { slug } = req.query;
  if (req.method === 'GET') {
    const { data, error } = await svc.from('projects').select('*').eq('slug', slug).limit(1).single();
    if (error) return res.status(404).json({ error: 'not found' });
    return res.status(200).json(data);
  }
  if (req.method === 'PUT') {
    const { title, lang, data: projectData, public: isPublic } = req.body;
    const { data, error } = await svc.from('projects').update({ title, lang, data: projectData, public: isPublic }).eq('slug', slug);
    if (error) return res.status(400).json({ error });
    return res.status(200).json(data);
  }
  res.setHeader('Allow', ['GET','PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}