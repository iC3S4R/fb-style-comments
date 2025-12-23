import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import CommentWidget from '../../components/CommentWidget';

export default function EmbedPage({ project }) {
  const comments = project?.data || [];
  const lang = project?.lang || 'es';
  return (
    <div style={{ padding: 16 }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <CommentWidget comments={comments} lang={lang} />
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const { slug } = ctx.params;
  const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).limit(1).single();
  if (error || !data) {
    return { notFound: true };
  }
  return { props: { project: data } };
}