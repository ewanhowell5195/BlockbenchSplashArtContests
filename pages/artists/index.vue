<div class="container">
  <div class="panel">
    <h2>Artists</h2>
    <div id="artists-stats">
      <div class="subpanel">
        <span>{{ stats.artists.toLocaleString() }}</span>
        <span>Artists</span>
      </div>
      <div class="subpanel">
        <span>{{ stats.submissions.toLocaleString() }}</span>
        <span>Submissions</span>
      </div>
      <div class="subpanel">
        <span>{{ stats.votes.toLocaleString() }}</span>
        <span>Total votes</span>
      </div>
      <div class="subpanel">
        <span>{{ stats.contests.toLocaleString() }}</span>
        <span>Contests</span>
      </div>
    </div>
  </div>
  <div id="artists-toolbar">
    <form id="artist-search" action="/artists" method="get">
      <input v-if="sort !== 'votes'" type="hidden" name="sort" :value="sort">
      <input v-if="direction !== (sort === 'name' ? 'asc' : 'desc')" type="hidden" name="dir" :value="direction">
      <input type="text" name="search" placeholder="Search artists" aria-label="Search artists" maxlength="64" :value="search">
      <a v-if="search" id="clear-search" :href="link({ search: '' })" title="Clear search" aria-label="Clear search"><span class="icon">close</span></a>
      <button type="submit" title="Search" aria-label="Search"><span class="icon">search</span></button>
    </form>
    <div id="sort-options">
      <span id="sort-label">Sort by:</span>
      <span id="sort-label-mobile" class="icon" title="Sort by">filter_list</span>
      <a v-for="s of sorts" :data-key="s.key" :class="{ active: s.active }" :href="s.href">{{ s.label }}<span v-if="s.active && s.key === 'name'" class="icon sort-icon">{{ direction === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span></a>
    </div>
  </div>
  <div id="artist-results">
    <div v-if="artists.length" id="artist-list">
      <a v-for="(artist, i) of artists" class="artist-card panel" :href="'/artists/' + artist.id">
        <div class="artist-banner">
          <img :src="`/assets/images/submissions/${artist.contest}/${artist.image}_thumbnail_small.webp`" :alt="'Splash art by ' + artist.name" loading="lazy">
          <span v-if="rankStart !== null" class="artist-rank" :class="rankStart + i < 3 ? 'rank-' + (rankStart + i + 1) : null">#{{ (rankStart + i + 1).toLocaleString() }}</span>
          <div class="artist-trophies">
            <span v-if="artist.golds" class="trophy-pill" :title="artist.golds.toLocaleString() + 'x 1st place'"><img src="/assets/images/icons/trophy_0.png" width="18" height="18" alt="1st place trophy">{{ artist.golds.toLocaleString() }}</span>
            <span v-if="artist.silvers" class="trophy-pill" :title="artist.silvers.toLocaleString() + 'x 2nd place'"><img src="/assets/images/icons/trophy_1.png" width="18" height="18" alt="2nd place trophy">{{ artist.silvers.toLocaleString() }}</span>
            <span v-if="artist.bronzes" class="trophy-pill" :title="artist.bronzes.toLocaleString() + 'x 3rd place'"><img src="/assets/images/icons/trophy_2.png" width="18" height="18" alt="3rd place trophy">{{ artist.bronzes.toLocaleString() }}</span>
          </div>
        </div>
        <div class="artist-avatar">
          <img :src="artist.avatar ?? '/assets/images/branding/default_avatar.webp'" width="64" height="64" alt="" loading="lazy">
        </div>
        <div class="artist-info">
          <span class="artist-stats">
            <span :title="artist.votes.toLocaleString() + ' vote' + (artist.votes === 1 ? '' : 's')"><img src="/assets/images/icons/like.png" width="16" height="16" alt="Votes">{{ artist.votes.toLocaleString() }}</span>
            <span :title="artist.submissions.toLocaleString() + ' submission' + (artist.submissions === 1 ? '' : 's')"><span class="icon">image</span>{{ artist.submissions.toLocaleString() }}</span>
          </span>
          <span class="artist-name" :title="artist.name">{{ artist.name }}</span>
        </div>
      </a>
    </div>
    <div v-else id="no-artists" class="panel">
      <h3>No artists found</h3>
      <p>No artists match "{{ search }}".</p>
      <a class="button" :href="link({ search: '' })"><span class="icon">close</span>Clear search</a>
    </div>
    <div v-if="totalPages > 1" id="pagination">
      <a v-if="page > 1" class="page-chip" :href="link({ page: page - 1 })" aria-label="Previous page"><span class="icon">chevron_left</span></a>
      <template v-for="p of pagination">
        <span v-if="p.gap" class="page-gap">…</span>
        <a v-else class="page-chip" :class="{ current: p.current }" :href="p.href">{{ p.n }}</a>
      </template>
      <a v-if="page < totalPages" class="page-chip" :href="link({ page: page + 1 })" aria-label="Next page"><span class="icon">chevron_right</span></a>
    </div>
  </div>
</div>