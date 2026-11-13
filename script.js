function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('youtu.be')) return parsed.pathname.slice(1).split('/')[0];
    if (parsed.searchParams.has('v')) return parsed.searchParams.get('v');
    const parts = parsed.pathname.split('/').filter(Boolean);
    const videoPath = parts.findIndex((part) => ['shorts', 'embed', 'live'].includes(part));
    return videoPath >= 0 ? parts[videoPath + 1] : null;
  } catch {
    return null;
  }
}

function loadVideoThumbnails() {
  document.querySelectorAll('.video-thumb').forEach((link) => {
    const videoId = getYouTubeVideoId(link.href);
    if (!videoId) return;

    const thumbnail = document.createElement('img');
    thumbnail.className = 'youtube-thumbnail';
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    thumbnail.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    thumbnail.addEventListener('error', () => {
      if (thumbnail.dataset.fallback) return;
      thumbnail.dataset.fallback = 'true';
      thumbnail.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    });
    thumbnail.addEventListener('load', () => link.classList.add('has-thumbnail'));
    link.prepend(thumbnail);
  });
}

const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.video-card')];
const search = document.querySelector('#video-search');
const emptyState = document.querySelector('#empty-state');
let activeFilter = 'all';
function updateVideos() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach((card) => {
    const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
    const searchMatch = !query || (card.dataset.title + ' ' + card.textContent).toLowerCase().includes(query);
    card.hidden = !(categoryMatch && searchMatch);
    if (!card.hidden) visible++;
  });
  emptyState.hidden = visible > 0;
}
filters.forEach((button) => button.addEventListener('click', () => {
  filters.forEach((filter) => filter.classList.toggle('active', filter === button));
  activeFilter = button.dataset.filter;
  updateVideos();
}));
search.addEventListener('input', updateVideos);
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
  if (event.key === 'Escape' && document.activeElement === search) search.blur();
});
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
menuToggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-25% 0px -60% 0px' });
sections.forEach((section) => observer.observe(section));
loadVideoThumbnails();

document.querySelectorAll('.person-avatar img').forEach((image) => {
  image.addEventListener('error', () => { image.hidden = true; });
});

const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const themeLabel = themeToggle.querySelector('.theme-label');
function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
}
const savedTheme = localStorage.getItem('better-muslim-theme');
setTheme(savedTheme === 'dark' ? 'dark' : 'light');
themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('better-muslim-theme', nextTheme);
  setTheme(nextTheme);
});
