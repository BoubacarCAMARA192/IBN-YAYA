// ─── LOADING SCREEN ───
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hidden');
  }, 1500);
});

// ─── THEME TOGGLE ───
const themeToggle = document.getElementById('themeToggle');
let isLight = false;
themeToggle.addEventListener('click', () => {
  isLight = !isLight;
  document.body.classList.toggle('light-theme', isLight);
  themeToggle.textContent = isLight ? '☀' : '☾';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-theme');
  themeToggle.textContent = '☀';
  isLight = true;
}

// ─── BACK TO TOP ───
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
});
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── PARTICULES ───
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 20) + 's';
    p.style.animationDelay = Math.random() * 15 + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    container.appendChild(p);
  }
}
createParticles();

// ─── NAVBAR SCROLL ───
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 100);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── REVEAL ON SCROLL ───
function revealOnScroll() {
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add('active');
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ─── COUNTDOWN ───
function updateCountdown() {
  const departure = new Date('2017-09-10T03:00:00');
  const now = new Date();
  const diff = now - departure;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  document.getElementById('heroCountdown').textContent =
    `🕯 ${days} jours, ${hours} heures et ${minutes} minutes depuis ton départ`;
  document.getElementById('daysSince').textContent = `${days} jours`;
}
updateCountdown();
setInterval(updateCountdown, 60000);

// ─── VISITEURS ───
fetch('/api/visit', { method: 'POST' })
  .then(r => r.json())
  .then(d => {
    document.getElementById('visitorCounter').innerHTML =
      `👤 <strong>${d.visitors}</strong> visiteurs ont honoré cette mémoire`;
  })
  .catch(() => {
    document.getElementById('visitorCounter').textContent = '🕯';
  });

// ─── MESSAGES (LIVRE D'OR) ───
let messagesLoaded = false;

function loadMessages() {
  const list = document.getElementById('messagesList');
  fetch('/api/messages')
    .then(r => r.json())
    .then(msgs => {
      messagesLoaded = true;
      if (msgs.length === 0) {
        list.innerHTML = '<div class="loading-msg">Soyez le premier à laisser un message.</div>';
        return;
      }
      list.innerHTML = msgs.map(m => `
        <div class="message-card">
          <div>
            <span class="msg-name">${escapeHtml(m.name)}</span>
            <span class="msg-date">${new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
          <div class="msg-content">${escapeHtml(m.content)}</div>
        </div>
      `).join('');
    })
    .catch(() => {
      list.innerHTML = '<div class="loading-msg">Impossible de charger les messages.</div>';
    });
}
loadMessages();

function submitMessage() {
  const name = document.getElementById('msgName').value.trim();
  const content = document.getElementById('msgContent').value.trim();
  if (!name || !content) {
    alert('Veuillez remplir tous les champs.');
    return;
  }
  const btn = document.querySelector('.guestbook-form button');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content })
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      document.getElementById('msgName').value = '';
      document.getElementById('msgContent').value = '';
      alert('Merci ! Ton message sera visible après modération.');
    }
  })
  .catch(() => alert('Erreur lors de l\'envoi.'))
  .finally(() => {
    btn.disabled = false;
    btn.textContent = '✉ Envoyer mon message';
  });
}

// ─── BOUGIES ───
let candleLit = true;
let candleCount = 0;
const flame = document.getElementById('flame');
const glow = document.getElementById('candleGlow');
const countDisplay = document.getElementById('candleCount');

function toggleCandle() {
  flame.style.display = candleLit ? 'none' : 'block';
  glow.style.display = candleLit ? 'none' : 'block';
  candleLit = !candleLit;
}

function loadCandleCount() {
  fetch('/api/candles/count')
    .then(r => r.json())
    .then(d => {
      candleCount = d.candles;
      countDisplay.textContent = candleCount;
    });
}
loadCandleCount();

function lightCandle() {
  const name = document.getElementById('candleName').value.trim() || 'Anonyme';
  fetch('/api/candles/light', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  .then(r => r.json())
  .then(d => {
    candleCount = d.candles;
    countDisplay.textContent = candleCount;
    if (!candleLit) {
      toggleCandle();
    }
    document.getElementById('candleName').value = '';
  });
}

// ─── PHOTOS ───
function loadPhotos() {
  const grid = document.getElementById('galleryGrid');
  fetch('/api/photos')
    .then(r => r.json())
    .then(photos => {
      if (photos.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">
            Aucune photo pour le moment. Ajoute tes souvenirs ci-dessous.
          </div>
        `;
        return;
      }
      grid.innerHTML = photos.map(p => `
        <div class="gallery-item">
          <img src="/uploads/${p.filename}" alt="${escapeHtml(p.caption)}" loading="lazy">
        </div>
      `).join('');
    });
}
loadPhotos();

function uploadPhotos(event) {
  const files = event.target.files;
  if (!files.length) return;
  const formData = new FormData();
  formData.append('photo', files[0]);
  formData.append('caption', 'Souvenir de mon père');

  fetch('/api/photos/upload', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        loadPhotos();
      } else {
        alert('Erreur: ' + (d.error || 'Inconnue'));
      }
    })
    .catch(() => alert('Erreur lors de l\'upload'))
    .finally(() => { event.target.value = ''; });
}

// ─── PIERRES (MEMORIAL STONES) ───
function loadPrieres() {
  const pile = document.getElementById('prieresPile');
  const countEl = document.getElementById('prieresNumber');
  fetch('/api/prieres')
    .then(r => r.json())
    .then(prieres => {
      countEl.textContent = prieres.length;
      if (prieres.length === 0) {
        pile.innerHTML = '<div class="loading-msg">Sois le premier à déposer une prière.</div>';
        return;
      }
      pile.innerHTML = prieres.map(p => `
        <div class="priere-item">
          <div>
            <span class="priere-icon">🤲</span>
            <span class="priere-name">${escapeHtml(p.name)}</span>
            <span class="priere-date">${new Date(p.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
          <div class="priere-message">${escapeHtml(p.message)}</div>
        </div>
      `).join('');
    })
    .catch(() => {
      pile.innerHTML = '<div class="loading-msg">Impossible de charger les prières.</div>';
    });
}
      loadPrieres();

function submitPriere() {
  const name = document.getElementById('priereName').value.trim();
  const message = document.getElementById('priereMessage').value.trim();
  if (!name || !message) {
    alert('Veuillez remplir tous les champs.');
    return;
  }
  const btn = document.querySelector('.prieres-form button');
  btn.disabled = true;
  btn.textContent = 'Dépôt en cours...';

  fetch('/api/prieres', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message })
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      document.getElementById('priereName').value = '';
      document.getElementById('priereMessage').value = '';
loadPrieres();
    }
  })
  .catch(() => alert('Erreur lors du dépôt.'))
  .finally(() => {
    btn.disabled = false;
    btn.textContent = '🤲 Déposer ma prière';
  });
}

// ─── LIVRE (BOOK) ───
function loadLivre() {
  const dedicaceEl = document.getElementById('livreDedicace');
  const chapitresEl = document.getElementById('livreChapitres');

  fetch('/api/livre')
    .then(r => r.json())
    .then(livre => {
      dedicaceEl.textContent = livre.dedicace;

      fetch('/api/livre/chapitres')
        .then(r => r.json())
        .then(chapitres => {
          chapitresEl.innerHTML = chapitres.map((ch, i) => `
            <div class="livre-chapitre" onclick="toggleChapitre(this)">
              <div class="livre-chapitre-header">
                <span class="livre-chapitre-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="livre-chapitre-titre">${escapeHtml(ch.titre)}</span>
                <span class="livre-chapitre-toggle">▼</span>
              </div>
              <div class="livre-chapitre-contenu">
                <p>${escapeHtml(ch.contenu)}</p>
              </div>
            </div>
          `).join('');
        });
    })
    .catch(() => {
      chapitresEl.innerHTML = '<div class="loading-msg">Impossible de charger le livre.</div>';
    });
}
loadLivre();

function toggleChapitre(el) {
  el.classList.toggle('open');
}

// ─── UTILS ───
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, c => map[c]);
}