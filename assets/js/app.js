(function () {
  'use strict';

  let allSongs = [];
  let latestSongs = [];
  let fuse = null;

  const searchInput = document.getElementById('search-input');
  const songList    = document.getElementById('song-list');
  const noResults   = document.getElementById('no-results');
  const songCount   = document.getElementById('song-count');

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderList(songs) {
    if (songs.length === 0) {
      songList.innerHTML = '';
      noResults.style.display = 'block';
      return;
    }

    noResults.style.display = 'none';

    songList.innerHTML = songs.map(function (song) {
      const url = 'song.html?file=' + encodeURIComponent(song.file);

      return '<a href="' + url + '" class="song-item">'
        +   '<h1 class="song-card-title">' + escapeHtml(song.title) + '</h1>'
        +   '<span class="song-card-artist">' + escapeHtml(song.artist) + '</span>'
        + '</a>';
    }).join('');
  }

  function onSearch() {
    const query = searchInput.value.trim();
    if (!query) { renderList(latestSongs); return; }
    renderList(fuse.search(query).map(function (r) { return r.item; }));
  }

  async function init() {
    try {
      const res = await fetch('songs.json');
      const data = await res.json();

      // ORDENAÇÃO
      allSongs = data.sort(function (a, b) {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return titleA.localeCompare(titleB);
      });

      latestSongs = [...data]
        .sort(function (a, b) {
          return (b.mtime || 0) - (a.mtime || 0);
        })
        .slice(0, 5); // Pega apenas as 5 primeiras

      const n = allSongs.length;
      songCount.textContent = n + ' música' + (n !== 1 ? 's' : '');

      // Fuse busca por: título, artista, letra
      fuse = new Fuse(allSongs, {
        keys: ['title', 'artist', 'lyrics'],
        threshold: 0.35,
        minMatchCharLength: 2,
        ignoreLocation: true
      });

      renderList(latestSongs);
    } catch (err) {
      console.error('Falha ao carregar songs.json', err);
      songList.innerHTML = '<p style="padding:1rem;color:var(--danger)">Erro ao carregar músicas.</p>';
    }
  }

  searchInput.addEventListener('input', onSearch);
  init();
})();