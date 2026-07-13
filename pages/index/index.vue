<div id="home-hero">
  <div id="home-background-container">
    <div v-for="[i, contest] of contests.slice(0, 3).entries()" :i="i" class="home-background" :class="{ enter: i }" :style="{ backgroundImage: `url('assets/images/${contest.status === 'finished' ? `submissions/${contest.id}/${contest.image}_thumbnail_large.webp` : `contests/concept_${contest.id}_thumbnail_small.webp`}')` }"></div>
  </div>
  <div id="home-content-container">
    <div v-if="contests.length > 1" id="progress">
      <div id="prev" class="icon">navigate_before</div>
      <div id="progress-bar"></div>
      <div id="next" class="icon">navigate_next</div>
      <div id="pause-play" class="icon">pause</div>
    </div>
    <div v-for="[i, contest] of contests.slice(0, 3).entries()" :i="i" class="home-content" :class="{ enter: i }">
      <h2>Splash Art Contest {{ contest.id }}</h2>
      <h1 :style="{ backgroundImage: f.blurImageSVG(contest.status === 'finished' ? `assets/images/submissions/${contest.id}/${contest.image}_thumbnail_small.webp` : `assets/images/contests/concept_${contest.id}_thumbnail_small.webp`) }">{{ contest.theme }}</h1>
      <div v-if="contest.status !== 'finished'" id="live-details">
        <div class="live">Live</div>
        <div v-if="contest.status === 'upcoming'">Submissions open {{ f.relativeTime(contest.open) }}</div>
        <div v-else-if="contest.status === 'submissions'">Submissions close {{ f.relativeTime(contest.close) }}</div>
        <div v-else-if="contest.status === 'reviewing'">Voting opens {{ f.relativeTime(contest.vote) }}</div>
        <div v-else-if="contest.status === 'voting'">Voting closes {{ f.relativeTime(contest.finish) }}</div>
      </div>
      <div class="button-row">
        <a class="button" :href="'contests/' + contest.id">View contest</a>
        <a class="button secondary" href="contests">View older contests</a>
      </div>
    </div>
  </div>
  <a id="scroll-hint" href="#home-sections" aria-label="Scroll down for more"><span class="icon">keyboard_arrow_down</span></a>
</div>
<div id="home-sections">
  <div class="home-section" id="home-about">
    <div>
      <h2>About the contests</h2>
      <p><a href="https://blockbench.net/" target="_blank">Blockbench</a> is a free, open source low poly 3D model editor. Every time it opens, it shows a piece of splash art, and all of that art is made by the community.</p>
      <p>Before each major Blockbench update, artists compete to make its splash art. Those contests live here: a theme is announced, entries come in, and the community votes for its favourites.</p>
      <div class="button-row">
        <a class="button" href="https://blockbench.net/" target="_blank">Blockbench<span class="icon">open_in_new</span></a>
        <a class="button secondary" href="/contests">Past contests</a>
      </div>
    </div>
    <div v-if="collage.length" id="home-about-collage">
      <img v-for="entry of collage" :src="`/assets/images/submissions/${entry.id}/${entry.image}_thumbnail_small.webp`" :alt="'Winning splash art from contest ' + entry.id" loading="lazy">
    </div>
  </div>
  <div class="home-section" id="home-showcase">
    <div class="home-heading">
      <h2>Built cube by cube</h2>
      <p>Every splash art starts as a Blockbench model. Watch a real contest entry build itself into the final shot, live in your browser.</p>
    </div>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fluid-tabs@0.1.2/dist/fluid-tabs.min.css">
    <script src="https://cdn.jsdelivr.net/npm/fluid-tabs@0.1.2/dist/fluid-tabs.min.js" defer></script>
    <div id="model-showcase">
      <div class="tab-bar tab-style-slide" id="model-tabs">
        <button class="tab-bar-button active" data-tab="snowplough">Snowplough</button>
        <button class="tab-bar-button" data-tab="pickup_truck">Pickup Truck</button>
      </div>
      <div id="home-model">
        <canvas></canvas>
        <img id="model-render" alt="The final splash art render of the scene">
        <div id="model-buttons">
          <button id="model-replay" class="model-icon-button hidden" title="Replay"><span class="icon">replay</span></button>
          <button id="model-reset" class="model-icon-button hidden" title="View scene"><span class="icon">zoom_out</span></button>
          <button id="model-fullscreen" class="model-icon-button" title="Fullscreen"><span class="icon">fullscreen</span></button>
        </div>
        <div id="model-controls">
          <button id="model-play" aria-label="Play or pause"><span class="icon">pause</span></button>
          <input id="model-scrub" type="range" min="0" max="1000" step="any" value="0" aria-label="Animation progress">
        </div>
        <div id="model-loading"><span class="icon">progress_activity</span></div>
      </div>
    </div>
  </div>
  <div class="home-section">
    <h2>How a contest works</h2>
    <div id="home-steps">
      <div class="home-step">
        <div class="home-step-marker">
          <span class="icon">lightbulb</span>
          <span class="home-step-number">1</span>
        </div>
        <h3>A theme is announced</h3>
        <p>Each contest ties in with an upcoming Blockbench update and gets its own theme to build around.</p>
      </div>
      <div class="home-step">
        <div class="home-step-marker">
          <span class="icon">deployed_code</span>
          <span class="home-step-number">2</span>
        </div>
        <h3>Model, render, submit</h3>
        <p>Make an original model in Blockbench, render it, and submit it before the deadline. Up to two artists can team up.</p>
      </div>
      <div class="home-step">
        <div class="home-step-marker">
          <span class="icon">how_to_vote</span>
          <span class="home-step-number">3</span>
        </div>
        <h3>The community votes</h3>
        <p>Once submissions close, everyone can browse the entries and vote for their favourites. Artists stay anonymous until voting ends.</p>
      </div>
      <div class="home-step">
        <div class="home-step-marker">
          <span class="icon">emoji_events</span>
          <span class="home-step-number">4</span>
        </div>
        <h3>Winners get featured</h3>
        <p>The top voted art becomes the Blockbench splash screen slideshow, and 1st place is featured on update posts and in the Blockbench gallery.</p>
      </div>
    </div>
  </div>
  <div class="home-section">
    <h2>The story so far</h2>
    <div id="home-stats">
      <div class="panel">
        <span class="icon">flag</span>
        <div>
          <span>{{ stats.contests.toLocaleString() }}</span>
          <span>Contests</span>
          <span>across {{ stats.years }} years</span>
        </div>
      </div>
      <div class="panel">
        <span class="icon">groups</span>
        <div>
          <span>{{ stats.artists.toLocaleString() }}</span>
          <span>Artists</span>
          <span>including {{ stats.champions }} winners</span>
        </div>
      </div>
      <div class="panel">
        <span class="icon">photo_library</span>
        <div>
          <span>{{ stats.submissions.toLocaleString() }}</span>
          <span>Submissions</span>
          <span>about {{ stats.perContest }} per contest</span>
        </div>
      </div>
      <div class="panel">
        <span class="icon">favorite</span>
        <div>
          <span>{{ stats.votes.toLocaleString() }}</span>
          <span>Votes cast</span>
          <span v-if="stats.voters">by roughly {{ stats.voters.toLocaleString() }} voters</span>
        </div>
      </div>
    </div>
  </div>
  <div class="home-section" id="home-process">
    <h2>From cubes to splash art</h2>
    <div id="home-process-steps">
      <div class="home-process-step">
        <div class="home-process-tools single">
          <a class="tool-logo" href="https://blockbench.net/" target="_blank" title="Blockbench"><img src="/assets/images/logos/blockbench-ui.svg" alt="Blockbench"></a>
        </div>
        <h3>Model</h3>
        <p>Start by making your original model in <a href="https://blockbench.net/" target="_blank">Blockbench</a>.</p>
      </div>
      <span class="icon home-process-arrow">arrow_forward</span>
      <div class="home-process-step">
        <div class="home-process-tools grid">
          <a class="tool-logo" href="https://aseprite.org/" target="_blank" title="Aseprite"><img class="pixelated" src="/assets/images/logos/aseprite.png" alt="Aseprite"></a>
          <a class="tool-logo" href="https://www.adobe.com/products/photoshop.html" target="_blank" title="Photoshop"><img src="/assets/images/logos/photoshop.svg" alt="Photoshop"></a>
          <a class="tool-logo" href="https://www.gimp.org/" target="_blank" title="GIMP"><img src="/assets/images/logos/gimp.svg" alt="GIMP"></a>
          <a class="tool-logo" href="https://paint.net/" target="_blank" title="Paint.NET"><img src="/assets/images/logos/paintnet.png" alt="Paint.NET"></a>
        </div>
        <h3>Texture</h3>
        <p>Texture it in Blockbench itself, or in any image editor you prefer, like <a href="https://www.adobe.com/products/photoshop.html" target="_blank">Photoshop</a>, <a href="https://aseprite.org/" target="_blank">Aseprite</a>, <a href="https://www.gimp.org/" target="_blank">GIMP</a>, or <a href="https://paint.net/" target="_blank">Paint.NET</a>.</p>
      </div>
      <span class="icon home-process-arrow">arrow_forward</span>
      <div class="home-process-step">
        <div class="home-process-tools pyramid">
          <a class="tool-logo" href="https://www.blender.org/" target="_blank" title="Blender"><img src="/assets/images/logos/blender.svg" alt="Blender"></a>
          <a class="tool-logo" href="https://lighttracer.org/" target="_blank" title="Lighttracer"><img src="/assets/images/logos/lighttracer.svg" alt="Lighttracer"></a>
          <a class="tool-logo" href="https://sketchfab.com/" target="_blank" title="Sketchfab"><img src="/assets/images/logos/sketchfab.svg" alt="Sketchfab"></a>
        </div>
        <h3>Render</h3>
        <p>Render the final shot in <a href="https://www.blender.org/" target="_blank">Blender</a>, <a href="https://lighttracer.org/" target="_blank">Lighttracer</a>, <a href="https://sketchfab.com/" target="_blank">Sketchfab</a>, or similar. Touch-ups in post, like contrast or backgrounds, are allowed.</p>
      </div>
    </div>
    <a class="button secondary" href="https://www.blockbench.net/wiki/guides/model-rendering" target="_blank">Model rendering guide<span class="icon">open_in_new</span></a>
  </div>
  <div v-if="winners.length" class="home-section">
    <h2>Hall of fame</h2>
    <div id="home-bento">
      <a v-for="[i, winner] of winners.entries()" class="home-winner panel" :class="{ featured: !i }" :href="'/contests/' + winner.id">
        <img :src="`/assets/images/submissions/${winner.id}/${winner.image}_thumbnail_${i ? 'small' : 'large'}.webp`" :alt="'Winning splash art from contest ' + winner.id" loading="lazy">
        <img class="home-winner-trophy" src="/assets/images/icons/trophy_0.png" width="32" height="32" alt="1st place trophy">
        <div class="home-winner-info">
          <span class="home-winner-title">Contest {{ winner.id }} · {{ winner.theme }}</span>
          <span class="home-winner-artists">By {{ winner.artists.map(e => e.name).join(" & ") }}</span>
        </div>
      </a>
      <div v-if="topArtists.length" id="home-artists" class="panel">
        <div id="home-artists-header">
          <h3>Leading artists</h3>
          <a href="/artists">View all</a>
        </div>
        <a v-for="[i, artist] of topArtists.entries()" class="home-artist" :href="'/artists/' + artist.id">
          <span class="home-artist-rank" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
          <div class="home-artist-avatar">
            <img :src="artist.avatar ?? '/assets/images/branding/default_avatar.webp'" width="44" height="44" alt="">
          </div>
          <span class="home-artist-name">{{ artist.name }}</span>
          <span class="home-artist-stats">
            <span><img src="/assets/images/icons/like.png" width="16" height="16" alt="Votes">{{ artist.votes.toLocaleString() }}</span>
            <span v-if="artist.golds"><img src="/assets/images/icons/trophy_0.png" width="16" height="16" alt="1st place trophy">{{ artist.golds.toLocaleString() }}</span>
          </span>
        </a>
      </div>
    </div>
  </div>
  <div class="home-section" id="home-cta">
    <div class="panel">
      <h2>Think you could make the next splash?</h2>
      <p>Contests are announced in the Blockbench Discord server, so join to catch the next one when it starts. The winning art ends up in front of everyone who opens Blockbench.</p>
      <div class="button-row">
        <a class="button" href="http://discord.blockbench.net/" target="_blank"><span class="fa fa-discord"></span>Join the Discord</a>
        <a class="button secondary" :href="'/contests/' + contest.id">View the latest contest</a>
      </div>
    </div>
  </div>
</div>