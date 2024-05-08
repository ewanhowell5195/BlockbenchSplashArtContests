<div id="home-background-container">
  <div v-for="[i, contest] of contests.slice(0, 3).entries()" class="home-background" :class="{ enter: i }" :style="{ backgroundImage: `url('assets/images/${contest.status === 'finished' ? `submissions/${contest.id}/${contest.image}_thumbnail_large.webp` : `contests/concept_${contest.id}_thumbnail_small.webp`}')` }"></div>
</div>
<div id="home-content-container">
  <div v-if="contests.length > 1" id="progress">
    <div id="progress-bar"></div>
  </div>
  <div v-for="[i, contest] of contests.slice(0, 3).entries()" class="home-content" :class="{ enter: i }">
    <h2>Splash Art Contest {{ contest.id }}</h2>
    <h1 :style="{ backgroundImage: f.blurImageSVG(contest.status === 'finished' ? `assets/images/submissions/${contest.id}/${contest.image}_thumbnail_small.webp` : `assets/images/contests/concept_${contest.id}_thumbnail_small.webp`) }">{{ contest.theme }}</h1>
    <div v-if="contest.status !== 'finished'" class="live-details">
      <div class="live">Live</div>
      <p><strong>Welcome to the {{ f.numSuffix(contest.id) }} Blockbench Splash Art Contest!</strong></p>
      <h3 v-if="contest.status === 'upcoming'">Submissions open {{ f.relativeTime(contest.open) }}</h3>
      <h3 v-else-if="contest.status === 'submissions'">Submissions close {{ f.relativeTime(contest.close) }}</h3>
      <h3 v-else-if="contest.status === 'reviewing'">Voting opens {{ f.relativeTime(contest.vote) }}</h3>
      <h3 v-else-if="contest.status === 'voting'">Voting closes {{ f.relativeTime(contest.finish) }}</h3>
    </div>
    <div v-if="contest.status === 'finished'">
      <p>The splash art contest has concluded and the results are in!</p>
    </div>
    <div class="button-row">
      <a v-if="contest.status !== 'finished'" class="button" :href="'contests/' + contest.id">View contest</a>
      <a v-else class="button" :href="'contests/' + contest.id">View results</a>
      <a class="button secondary" href="contests">View older contests</a>
    </div>
  </div>
</div>