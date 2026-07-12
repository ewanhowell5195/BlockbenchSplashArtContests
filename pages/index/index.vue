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
      <h2>What is all this?</h2>
      <p><a href="https://blockbench.net/" target="_blank">Blockbench</a> is a free, open source low poly 3D model editor. Every time it opens, it greets you with a piece of splash art, and every piece of it is made by the community.</p>
      <p>Ahead of each major Blockbench update, artists compete to create that update's splash art. This site is home to those contests: a theme is announced, submissions roll in, and the community votes for its favourites.</p>
      <div class="button-row">
        <a class="button" href="https://blockbench.net/" target="_blank">Visit Blockbench<span class="icon">open_in_new</span></a>
        <a class="button secondary" href="/contests">Browse past contests</a>
      </div>
    </div>
    <div v-if="collage.length" id="home-about-collage">
      <img v-for="entry of collage" :src="`/assets/images/submissions/${entry.id}/${entry.image}_thumbnail_small.webp`" :alt="'Winning splash art from contest ' + entry.id" loading="lazy">
    </div>
  </div>
  <div class="home-section" id="home-showcase">
    <h2>Built cube by cube</h2>
    <p>Every splash art begins life as a Blockbench model. Watch a real contest entry assemble itself piece by piece, light itself, and settle into the final shot, live in your browser.</p>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fluid-tabs@0.1.2/dist/fluid-tabs.min.css">
    <script src="https://cdn.jsdelivr.net/npm/fluid-tabs@0.1.2/dist/fluid-tabs.min.js" defer></script>
    <div class="tab-bar tab-style-slide" id="model-tabs">
      <button class="tab-bar-button active" data-tab="snowplough">Snowplough</button>
      <button class="tab-bar-button" data-tab="pickup_truck">Pickup Truck</button>
    </div>
    <div id="home-model">
      <canvas></canvas>
      <img id="model-render" alt="The final splash art render of the scene">
      <div id="model-buttons" class="hidden">
        <button id="model-reset" class="secondary"><span class="icon">zoom_out_map</span>View scene</button>
      </div>
      <div id="model-controls">
        <button id="model-play" aria-label="Play or pause"><span class="icon">pause</span></button>
        <input id="model-scrub" type="range" min="0" max="1000" step="any" value="0" aria-label="Animation progress">
      </div>
      <div id="model-loading"><span class="icon">progress_activity</span></div>
    </div>
  </div>
  <div class="home-section">
    <h2>How a contest works</h2>
    <div id="home-steps">
      <div class="home-step">
        <div class="home-step-number">1</div>
        <span class="icon">lightbulb</span>
        <h3>A theme is announced</h3>
        <p>Every contest pairs with an upcoming Blockbench update and gets its own theme to build around.</p>
      </div>
      <div class="home-step">
        <div class="home-step-number">2</div>
        <span class="icon">deployed_code</span>
        <h3>Model, render, submit</h3>
        <p>Create an original model in Blockbench, render it in 21:9, and submit it while submissions are open. Collaborations of up to two artists are welcome.</p>
      </div>
      <div class="home-step">
        <div class="home-step-number">3</div>
        <span class="icon">how_to_vote</span>
        <h3>The community votes</h3>
        <p>Once submissions close, everyone gets to view every entry and vote for their favourites. Artists stay anonymous until voting ends.</p>
      </div>
      <div class="home-step">
        <div class="home-step-number">4</div>
        <span class="icon">emoji_events</span>
        <h3>Winners get featured</h3>
        <p>The top voted art becomes the Blockbench splash screen slideshow, and 1st place is featured on update posts and in the Blockbench gallery.</p>
      </div>
    </div>
  </div>
  <div class="home-section" id="home-process">
    <h2>From cubes to splash art</h2>
    <div id="home-process-steps">
      <div class="home-process-step">
        <span class="icon">view_in_ar</span>
        <h3>Model</h3>
        <p>Every entry starts as an original model built in <a href="https://blockbench.net/" target="_blank">Blockbench</a>.</p>
      </div>
      <span class="icon home-process-arrow">arrow_forward</span>
      <div class="home-process-step">
        <span class="icon">palette</span>
        <h3>Texture</h3>
        <p>Paint it in Blockbench itself, or in any image editor you prefer, like Photoshop, Aseprite, GIMP, or Paint.NET.</p>
      </div>
      <span class="icon home-process-arrow">arrow_forward</span>
      <div class="home-process-step">
        <span class="icon">photo_camera</span>
        <h3>Render</h3>
        <p>Render the final shot in Blender, Cinema 4D, Sketchfab, or similar programs. Touching it up in post, like contrast or backgrounds, is allowed.</p>
      </div>
    </div>
    <a class="button secondary" href="https://www.blockbench.net/wiki/guides/model-rendering" target="_blank">Model rendering guide<span class="icon">open_in_new</span></a>
  </div>
  <div class="home-section">
    <h2>The story so far</h2>
    <div id="home-stats">
      <div class="subpanel">
        <span>{{ stats.contests.toLocaleString() }}</span>
        <span>Contests</span>
      </div>
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
        <span>Votes cast</span>
      </div>
    </div>
  </div>
  <div v-if="winners.length" class="home-section">
    <h2>Recent winners</h2>
    <div id="home-winners">
      <a v-for="winner of winners" class="home-winner panel" :href="'/contests/' + winner.id">
        <div class="home-winner-banner">
          <img :src="`/assets/images/submissions/${winner.id}/${winner.image}_thumbnail_small.webp`" :alt="'Winning splash art from contest ' + winner.id" loading="lazy">
          <img class="home-winner-trophy" src="/assets/images/icons/trophy_0.png" width="32" height="32" alt="1st place trophy">
        </div>
        <div class="home-winner-info">
          <span class="home-winner-title">Contest {{ winner.id }} · {{ winner.theme }}</span>
          <span class="home-winner-artists">By {{ winner.artists.map(e => e.name).join(" & ") }}</span>
        </div>
      </a>
    </div>
  </div>
  <div v-if="topArtists.length" class="home-section">
    <h2>Leading artists</h2>
    <div id="home-artists">
      <a v-for="artist of topArtists" class="home-artist panel" :href="'/artists/' + artist.id">
        <div class="home-artist-avatar">
          <img :src="artist.avatar ?? '/assets/images/branding/default_avatar.webp'" width="80" height="80" alt="">
        </div>
        <span class="home-artist-name">{{ artist.name }}</span>
        <span class="home-artist-stats">
          <span><img src="/assets/images/icons/like.png" width="16" height="16" alt="Votes">{{ artist.votes.toLocaleString() }}</span>
          <span v-if="artist.golds"><img src="/assets/images/icons/trophy_0.png" width="16" height="16" alt="1st place trophy">{{ artist.golds.toLocaleString() }}</span>
        </span>
      </a>
    </div>
    <a class="button secondary" id="home-artists-button" href="/artists">View all artists</a>
  </div>
  <div class="home-section" id="home-cta">
    <div class="panel">
      <h2>Think you could make the next splash?</h2>
      <p>Contests are announced in the Blockbench Discord server, so join and keep an eye out for when the next one begins. Your art could be the first thing every Blockbench user sees.</p>
      <div class="button-row">
        <a class="button" href="http://discord.blockbench.net/" target="_blank"><span class="fa fa-discord"></span>Join the Discord</a>
        <a class="button secondary" :href="'/contests/' + contest.id">View the latest contest</a>
      </div>
    </div>
  </div>
</div>