import React from 'react';

const L = {
  pt: { like: "Curtir", reply: "Responder", minutes: "min" },
  en: { like: "Like", reply: "Reply", minutes: "min" },
  es: { like: "Me gusta", reply: "Responder", minutes: "min" }
};

function escapeText(t = '') {
  return (t + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function renderReactions(reactions = {}) {
  const arr = [
    { k: 'like', e: '👍' },
    { k: 'love', e: '❤️' },
    { k: 'wow', e: '😮' },
    { k: 'sad', e: '😢' },
    { k: 'angry', e: '😡' }
  ];
  return (
    <div className="reactions-inline" dangerouslySetInnerHTML={{
      __html: arr.map(a => reactions[a.k] ? `<span class="reaction">${a.e} ${reactions[a.k]}</span>` : '').join('')
    }} />
  );
}

export default function CommentWidget({ comments = [], lang = 'es' }) {
  const strings = L[lang] || L.en;
  return (
    <div className="fb-comments-widget">
      {comments.map((c) => (
        <div key={c.id || Math.random()} style={{ marginBottom: 6 }}>
          <div className="fb-comment">
            <div className="fb-comment-left">
              <div className="fb-avatar">
                {c.author?.avatar ? <img src={c.author.avatar} alt={c.author?.name} /> : <div style={{ width: 44, height: 44, borderRadius: 22, background: '#ddd' }} />}
              </div>
            </div>
            <div className="fb-comment-main">
              <div className="fb-comment-head"><strong className="fb-author">{c.author?.name}</strong></div>
              <div className="fb-comment-body" dangerouslySetInnerHTML={{ __html: escapeText(c.text) }} />
              {c.image ? <div className="fb-comment-image"><img src={c.image} alt="comment attachment" /></div> : null}
              <div className="fb-comment-actions">
                <span className="fb-action">{strings.like}</span> · <span className="fb-action">{strings.reply}</span> · <small className="small">1 {strings.minutes}</small>
              </div>
            </div>
            <div className="fb-reactions">
              {renderReactions(c.reactions || {})}
            </div>
          </div>

          {c.replies && c.replies.length ? (
            <div className="fb-replies">
              {c.replies.map((r) => (
                <div key={r.id || Math.random()} className="fb-reply">
                  <div className="fb-avatar-small">
                    {r.author?.avatar ? <img src={r.author.avatar} alt={r.author?.name} /> : null}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>{r.author?.name}</strong> <div dangerouslySetInnerHTML={{ __html: escapeText(r.text) }} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}