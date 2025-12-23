// Observação: este arquivo substitui/atualiza a versão anterior de pages/index.js para proteger a rota Admin
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import CommentWidget from '../components/CommentWidget';
import { nanoid } from 'nanoid';
import { verifySession } from '../lib/auth';

const LANGS = [{ val: 'pt', label: 'Português' }, { val: 'en', label: 'English' }, { val: 'es', label: 'Español' }];

export default function Admin({ initialSlug }) {
  const [title, setTitle] = useState('Meu projeto de comentários');
  const [slug, setSlug] = useState(initialSlug || '');
  const [lang, setLang] = useState('es');
  const [comments, setComments] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [commentText, setCommentText] = useState('Sufro de diabetes tipo 2 y la medición constante...');
  const [reactionsInput, setReactionsInput] = useState('43,12,0,1,0');
  const [commentImageFile, setCommentImageFile] = useState(null);
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(()=> {
    if(!slug) setSlug(`proj-${Date.now().toString(36).slice(4,10)}`);
  }, []);

  async function uploadFile(file) {
    if(!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${nanoid()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if(error) {
      console.error('Upload error', error);
      return null;
    }
    const publicUrl = supabase.storage.from('uploads').getPublicUrl(data.path).publicUrl;
    return publicUrl;
  }

  async function addComment() {
    const avatarUrl = avatarFile ? await uploadFile(avatarFile) : '';
    const imgUrl = commentImageFile ? await uploadFile(commentImageFile) : '';
    const reactions = (reactionsInput || '').split(',').map(s=>parseInt(s.trim()||'0'));
    while(reactions.length < 5) reactions.push(0);
    const comment = {
      id: `c_${nanoid()}`,
      author: { name: 'Usuário', avatar: avatarUrl },
      text: commentText,
      image: imgUrl,
      reactions: { like: reactions[0]||0, love: reactions[1]||0, wow: reactions[2]||0, sad: reactions[3]||0, angry: reactions[4]||0 },
      replies: []
    };
    setComments(prev => [comment, ...prev]);
  }

  async function saveProject() {
    // chama o endpoint server-side para salvar (poderíamos chamar supabase no cliente, mas é mais seguro via API)
    const payload = { title, slug, lang, data: comments, public: true };
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) {
      alert('Erro ao salvar: ' + (json?.error?.message || json?.error || 'unknown'));
      return;
    }
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/embed/${slug}`;
    setEmbedUrl(url);
    alert('Projeto salvo! URL de embed copiada para o campo.');
  }

  return (
    <div className="container">
      <h1>FB-style Comments — Admin</h1>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 12 }}>
          <div>
            <label>Projeto (título)</label>
            <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} />

            <label>Slug (usado na URL)</label>
            <input type="text" value={slug} onChange={(e)=>setSlug(e.target.value)} />

            <label>Idioma</label>
            <select value={lang} onChange={(e)=>setLang(e.target.value)}>
              {LANGS.map(l=> <option key={l.val} value={l.val}>{l.label}</option>)}
            </select>

            <hr />

            <label>Avatar (upload)</label>
            <input type="file" accept="image/*" onChange={(e)=>setAvatarFile(e.target.files[0])} />
            <label>Texto do comentário</label>
            <textarea value={commentText} onChange={(e)=>setCommentText(e.target.value)} />
            <label>Imagem do comentário</label>
            <input type="file" accept="image/*" onChange={(e)=>setCommentImageFile(e.target.files[0])} />
            <label>Reações (nums separados por vírgula: 👍,❤️,😮,😢,😡)</label>
            <input type="text" value={reactionsInput} onChange={(e)=>setReactionsInput(e.target.value)} />

            <div style={{ marginTop: 10 }}>
              <button className="btn" onClick={addComment}>Adicionar comentário</button>
              <button className="btn secondary" style={{ marginLeft: 8 }} onClick={()=>{ setComments([]) }}>Limpar todos</button>
            </div>

            <hr />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={saveProject}>Salvar projeto (Supabase)</button>
              <button className="btn" onClick={()=>{
                const snippet = `<iframe src="${process.env.NEXT_PUBLIC_BASE_URL || ''}/embed/${slug}" style="width:100%;border:0;min-height:300px"></iframe>`;
                navigator.clipboard?.writeText(snippet);
                alert('Iframe copiado para área de transferência!');
              }}>Gerar iframe</button>
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Embed URL</label>
              <input type="text" value={embedUrl} readOnly />
            </div>
          </div>

          <div>
            <h3>Preview</h3>
            <div className="card">
              <CommentWidget comments={comments} lang={lang} />
            </div>

            <h4>Comentários criados</h4>
            <div className="small card">
              {comments.length === 0 ? <i>Sem comentários</i> : comments.map(c=>(
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <strong>{c.author?.name}</strong> — {c.text.slice(0,120)}
                  <div className="small">Reações: {Object.values(c.reactions||{}).join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card small">
        Dicas: após salvar, use a URL de embed em iframes no WordPress/Shopify. Para atualizações automáticas, use o endpoint /api/projects para sobrescrever `projects` por slug.
      </div>
    </div>
  );
}

// Protege a rota admin — se não autenticado, redireciona para /login
export async function getServerSideProps(ctx) {
  const cookie = ctx.req.headers.cookie || '';
  const match = cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('fbsc_session='));
  const token = match ? match.split('=')[1] : null;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return {
      redirect: {
        destination: '/login?next=' + encodeURIComponent(ctx.resolvedUrl || '/'),
        permanent: false
      }
    };
  }
  // opcional: você pode passar dados iniciais
  return { props: { initialSlug: null } };
}