import { signSession } from '../../../lib/auth';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};

  // credenciais padrão — recomenda-se setar via variáveis de ambiente em produção
  const ADMIN_USER = process.env.ADMIN_USER || 'supreme';
  const ADMIN_PASS = process.env.ADMIN_PASS || '@CesarPrado346#';

  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = signSession({ user: ADMIN_USER });
    // cookie HttpOnly
    const cookie = serialize('fbsc_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    });
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ ok: true });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}