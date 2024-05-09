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