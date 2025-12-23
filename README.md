# FB-style Comments Generator (Next.js + Supabase)

App que permite criar sessões de comentários no estilo Facebook, gerar um embed (iframe/snippet) e exportar HTML/CSS. Pronto para deploy em Vercel.

Funcionalidades:
- Painel Admin para criar comentários/respostas, definir nome, avatar, imagens, reações e idioma.
- Salva "projetos" no Supabase (JSON) e armazena imagens no Supabase Storage.
- Gera URL de embed (iframe) / página standalone em `/embed/[id]`.
- Permite baixar HTML standalone.

Stack:
- Next.js (pages)
- Supabase (Postgres + Storage) para persistência
- React + CSS simples

Setup rápido
1. Crie um projeto no Supabase:
   - No Supabase, crie uma tabela `projects` com o SQL:
     CREATE TABLE projects (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       title text,
       slug text UNIQUE,
       lang text DEFAULT 'es',
       data jsonb,
       public boolean DEFAULT true,
       created_at timestamptz DEFAULT now()
     );
   - Ative Supabase Storage e crie um bucket público `uploads`.

2. Clone este repo e instale:
   npm install

3. Variáveis de ambiente (Vercel / .env.local):
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_BASE_URL=https://seu-site.vercel.app  # usado para gerar links

4. Rodar local:
   npm run dev
   Abra http://localhost:3000

5. Deploy no Vercel:
   - Conecte o repositório, adicione as mesmas ENV vars no projeto Vercel, deploy.

Como usar
- Acesse a home (Admin) → crie projeto → adicione comentários/avatars/imagens → Salvar projeto.
- Copie a URL de embed (ex.: https://seu-site.vercel.app/embed/<slug>) e cole num iframe no WordPress/Shopify:
  <iframe src="https://seu-site.vercel.app/embed/<slug>" style="width:100%;border:0;min-height:400px"></iframe>

Observações
- Evite usar imagens com direitos autorais sem permissão.
- Para editar o widget (CSS) ajuste `components/CommentWidget.jsx` e `styles/globals.css`.

Próximos passos que posso preparar para você:
- Integração com Stripe para planos pagos e limites de projetos.
- Área de login/contas (Auth) para multi-usuários.
- Export/Download de HTML/CSS com assets empacotados.
