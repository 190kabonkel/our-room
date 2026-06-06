const SUPABASE_URL = 'https://etpdeqsdkrinzrgmgcum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cGRlcXNka3JpbnpyZ21nY3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTE2NjYsImV4cCI6MjA5NjMyNzY2Nn0.bAEjm4cKkxfgMbDUeItMVjnmbZDaBM9CmKt9SX98j8Y';

async function apiFetch(path, options = {}) {
  const res = await fetch(SUPABASE_URL + path, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadComments() {
  try {
    const data = await apiFetch('/rest/v1/comments?order=created_at.desc');
    renderComments(data);
  } catch (e) {
    document.getElementById('comments-list').innerHTML =
      '<p style="color:red;">Failed to load comments: ' + e.message + '</p>';
    console.error(e);
  }
}

async function postComment() {
  const username = document.getElementById('username-input').value.trim();
  const text     = document.getElementById('comment-input').value.trim();
  const errorMsg = document.getElementById('error-msg');

  if (!username) { errorMsg.textContent = 'Please enter your name.'; return; }
  if (!text)     { errorMsg.textContent = 'Please write a comment.'; return; }
  errorMsg.textContent = '';

  try {
    await apiFetch('/rest/v1/comments', {
      method: 'POST',
      body: JSON.stringify({ username, text, likes: 0 })
    });
    document.getElementById('comment-input').value = '';
  } catch (e) {
    errorMsg.textContent = 'Failed to post comment: ' + e.message;
    console.error(e);
  }
}

async function likeComment(id, currentLikes) {
  try {
    await apiFetch('/rest/v1/comments?id=eq.' + id, {
      method: 'PATCH',
      body: JSON.stringify({ likes: currentLikes + 1 })
    });
  } catch (e) { console.error(e); }
}

async function deleteComment(id) {
  try {
    await apiFetch('/rest/v1/comments?id=eq.' + id, {
      method: 'DELETE',
      headers: { 'Prefer': '' }
    });
  } catch (e) { console.error(e); }
}

function renderComments(comments) {
  const list    = document.getElementById('comments-list');
  const countEl = document.getElementById('comments-count');

  countEl.textContent = comments.length + ' comment(s)';

  if (comments.length === 0) {
    list.innerHTML = '<p>No comments yet. Be the first!</p>';
    return;
  }

  list.innerHTML = comments.map(comment => `
    <div>
      <strong>${escapeHtml(comment.username)}</strong>
      <small> — ${new Date(comment.created_at).toLocaleString()}</small>
      <p>${escapeHtml(comment.text)}</p>
      <button onclick="likeComment(${comment.id}, ${comment.likes})">👍 Like (${comment.likes})</button>
      <button onclick="deleteComment(${comment.id})">🗑 Delete</button>
    </div>
  `).join('');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function startRealtime() {
  const wsUrl = 'wss://etpdeqsdkrinzrgmgcum.supabase.co/realtime/v1/websocket'
    + '?apikey=' + SUPABASE_KEY + '&vsn=1.0.0';

  const socket = new WebSocket(wsUrl);

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({
      topic: 'realtime:public:comments',
      event: 'phx_join',
      payload: {},
      ref: '1'
    }));
  });

  socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (
      msg.topic === 'realtime:public:comments' &&
      msg.event !== 'phx_reply' &&
      msg.event !== 'phx_close'
    ) {
      loadComments();
    }
  });

  socket.addEventListener('close', () => {
    setTimeout(startRealtime, 3000);
  });

  socket.addEventListener('error', (e) => {
    console.error('WebSocket error:', e);
  });
}

loadComments();
startRealtime();
