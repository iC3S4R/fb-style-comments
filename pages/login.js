import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        // redireciona para admin (ou para ref query)
        const next = router.query.next || '/';
        router.replace(next);
      } else {
        setErr(data?.error || 'Erro ao autenticar');
      }
    } catch (error) {
      setErr('Erro de rede');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f7fa' }}>
      <div style={{ width:420, background:'#fff', padding:20, borderRadius:12, boxShadow:'0 6px 30px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginTop:0 }}>Login — Admin</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ display:'block', marginBottom:8 }}>Usuário</label>
          <input value={username} onChange={(e)=>setUsername(e.target.value)} style={{ width:'100%', padding:8, borderRadius:8, border:'1px solid #e6e9ee' }} />
          <label style={{ display:'block', margin:'12px 0 8px' }}>Senha</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width:'100%', padding:8, borderRadius:8, border:'1px solid #e6e9ee' }} />
          {err ? <div style={{ color:'crimson', marginTop:10 }}>{err}</div> : null}
          <div style={{ marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <button type="submit" disabled={loading} style={{ background:'#2e6fd8', color:'#fff', padding:'8px 12px', border:0, borderRadius:8, cursor:'pointer' }}>{loading ? 'Entrando...' : 'Entrar'}</button>
            <a href="#" onClick={async (ev)=>{ ev.preventDefault(); alert('Credenciais padrão: user = supreme, pass = @CesarPrado346# (recomendo alterar em produção)'); }}>Ajuda</a>
          </div>
        </form>
      </div>
    </div>
  );
}