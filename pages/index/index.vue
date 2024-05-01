<div id="home-container" :style="{ backgroundImage: `url('${contest.status === 'finished' ? config.image.slice(0, -21) + '_thumbnail_large.webp' : `assets/images/contests/concept_${contest.id}_thumbnail_large.webp`}')` }">
  <div>
    <div class="container">
      <h1>Splash Art Contest {{ contest.id }}</h1>
      <h2>"{{ contest.theme }}"</h2>
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
</div>