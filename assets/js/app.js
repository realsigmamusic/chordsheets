(function () {
  'use strict';

  let allSongs = [];
  let recentSongs = [];
  let showingAll = false;
  let fuse = null;

  const searchInput = document.getElementById('search-input');
  const songList    = document.getElementById('song-list');
  const favoritesList = document.getElementById('favorites-list');
  const favoritesSection = document.getElementById('favorites-section');
  const allSongsSection = document.getElementById('all-songs-section');
  const noResults   = document.getElementById('no-results');
  const btnShowAll  = document.getElementById('btn-show-all');

  const FAVORITES_KEY = 'chordsheets_favorites';
  const LIMIT_HOME = 5;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getSavedFavorites() {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  function isFavorite(songFile) {
    return getSavedFavorites().includes(songFile);
  }

  function renderCard(song) {
    const url = '?file=' + encodeURIComponent(song.file);

    return '<a href="' + url + '" class="song-item">'
      +   '<div class="song-card-content">'
      +     '<h1 class="song-card-title">' + escapeHtml(song.title) + '</h1>'
      +     '<span class="song-card-artist">' + escapeHtml(song.artist) + '</span>'
      +   '</div>'
      + '</a>';
  }

  function renderSetlistCard(song) {
    // Adiciona o parâmetro origin=setlist para ativar a navegação prev/next
    const html = renderCard(song);
    return html.replace('?file=', '?origin=setlist&file=');
  }

  function renderFavoritesSection() {
    const saved = getSavedFavorites();
    const favoriteSongs = allSongs.filter(s => saved.includes(s.file));

    if (favoriteSongs.length === 0) {
      favoritesSection.style.display = 'none';
    } else {
      favoritesSection.style.display = 'block';
      favoritesList.innerHTML = favoriteSongs.map(s => renderCard(s)).join('');
    }
  }

  function renderList(songs, showLimited = true) {
    if (songs.length === 0) {
      songList.innerHTML = '';
      noResults.style.display = 'block';
      allSongsSection.style.display = 'none';
      btnShowAll.style.display = 'none';
      return;
    }

    noResults.style.display = 'none';
    allSongsSection.style.display = 'block';

    const toShow = (showLimited && !showingAll && songs.length > LIMIT_HOME)
      ? songs.slice(0, LIMIT_HOME)
      : songs;

    songList.innerHTML = toShow.map(s => renderCard(s)).join('');

    if (showLimited && !showingAll && songs.length > LIMIT_HOME) {
      btnShowAll.style.display = 'block';
      btnShowAll.textContent = `Ver todas as ${songs.length} músicas`;
    } else {
      btnShowAll.style.display = 'none';
    }
  }

  function onSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      showingAll = false;
      renderList(recentSongs, true);
      return;
    }
    showingAll = false;
    renderList(fuse.search(query).map(function (r) { return r.item; }), false);
  }

  function onShowAll() {
    showingAll = true;
    btnShowAll.style.display = 'none';
    renderList(allSongs, false);
    window.scrollTo(0, 0);
  }

  function syncView() {
    const songCountLabel = document.getElementById('song-count');
    const songControls = document.getElementById('song-controls');
    const navbarBrand = document.getElementById('navbar-brand');
    const params = new URLSearchParams(window.location.search);

    if (params.has('file')) {
      document.getElementById('home-view').style.display = 'none';
      document.getElementById('song-view').style.display = 'block';
      if (songControls) songControls.style.display = 'flex';
      if (songCountLabel) songCountLabel.style.display = 'none';
    } else {
      document.getElementById('home-view').style.display = 'block';
      document.getElementById('song-view').style.display = 'none';
      if (songControls) songControls.style.display = 'none';
      if (songCountLabel) songCountLabel.style.display = 'inline';
      if (navbarBrand) navbarBrand.style.display = 'block';
      showTab('inicio');
      setActiveNav('nav-inicio');
      onSearch();
    }
  }

  async function init() {
    try {
      const res = await fetch('songs.json');
      const data = await res.json();

      // allSongs = ALFABÉTICA (para "ver todas")
      allSongs = data.sort(function (a, b) {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return titleA.localeCompare(titleB);
      });

      // recentSongs = POR DATA (últimas adicionadas/editadas)
      recentSongs = [...data]
        .sort(function (a, b) {
          return (b.mtime || 0) - (a.mtime || 0);
        });

      const n = data.length;

      fuse = new Fuse(allSongs, {
        keys: ['title', 'artist', 'lyrics'],
        threshold: 0.35,
        minMatchCharLength: 2,
        ignoreLocation: true
      });

      syncView();
    } catch (err) {
      console.error('Falha ao carregar songs.json', err);
      songList.innerHTML = '<p style="padding:1rem;color:var(--danger)">Erro ao carregar músicas.</p>';
    }
  }

  function renderArtistsSection() {
    const artistsEl = document.getElementById('artists-list');
    const artists = {};

    allSongs.forEach(s => {
      if (!s.artist) return;
      s.artist.split(',').map(a => a.trim()).filter(Boolean).forEach(name => {
        if (!artists[name]) artists[name] = [];
        artists[name].push(s);
      });
    });

    const sorted = Object.keys(artists).sort((a, b) => a.localeCompare(b));

    artistsEl.innerHTML = sorted.map(artist => {
      const count = artists[artist].length;
      return `<div class="artist-item" data-artist="${escapeHtml(artist)}">
        <span class="artist-name">${escapeHtml(artist)}</span>
      </div>`;
    }).join('');

    artistsEl.querySelectorAll('.artist-item').forEach(el => {
      el.addEventListener('click', () => {
        renderArtistSongs(el.dataset.artist);
      });
    });
  }

  function renderArtistSongs(artist) {
    const artistsEl = document.getElementById('artists-list');
    const songs = allSongs.filter(s => s.artist && s.artist.split(',').map(a => a.trim()).includes(artist));

    artistsEl.innerHTML = `
      <button class="artist-back-btn" id="artist-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
        </svg>
        Artistas
      </button>
      ${songs.map(s => renderCard(s)).join('')}
    `;

    document.getElementById('artist-back').addEventListener('click', renderArtistsSection);
  }

  // ── Bottom Nav ──
  const navItems = document.querySelectorAll('.bottom-nav-item');

  function setActiveNav(id) {
    navItems.forEach(i => i.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function showTab(tab) {
    document.getElementById('search-section').style.display    = tab === 'inicio'    ? 'block' : 'none';
    document.getElementById('all-songs-section').style.display = tab === 'inicio'    ? 'block' : 'none';
    document.getElementById('artists-section').style.display   = tab === 'artistas'  ? 'block' : 'none';
    document.getElementById('favorites-section').style.display = tab === 'favoritos' ? 'block' : 'none';
    document.getElementById('config-section').style.display    = tab === 'config'    ? 'block' : 'none';
    document.getElementById('no-results').style.display        = 'none';
  }

  document.getElementById('nav-inicio').addEventListener('click', () => {
    window.history.pushState({}, '', '?');
    syncView();
  });

  document.getElementById('nav-artistas').addEventListener('click', () => {
    window.history.pushState({}, '', '?');
    syncView();
    setActiveNav('nav-artistas');
    showTab('artistas');
    renderArtistsSection();
  });

  document.getElementById('nav-favoritos').addEventListener('click', () => {
    window.history.pushState({}, '', '?');
    syncView();
    setActiveNav('nav-favoritos');
    showTab('favoritos');
    renderFavoritesSection();
  });

  document.getElementById('nav-config').addEventListener('click', () => {
    window.history.pushState({}, '', '?');
    syncView();
    setActiveNav('nav-config');
    showTab('config');
  });

  searchInput.addEventListener('input', onSearch);
  btnShowAll.addEventListener('click', onShowAll);
  window.addEventListener('favoritesChanged', onSearch);
  window.addEventListener('popstate', syncView);
  init();
})();

// Versionamento ==================================================================================
async function loadAppVersion() {
    const res = await fetch('./sw.js');
    const text = await res.text();
    const match = text.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
    if (match) document.getElementById('app-version').textContent = `v${match[1]}`;
}
loadAppVersion()