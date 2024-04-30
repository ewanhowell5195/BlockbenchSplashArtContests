<div v-if="contest.status === 'voting' && !voted">
  <template id="submissions">
    <img v-for="submission of submissions" :src="`/assets/images/submissions/${contest.id}/${submission.image}.webp`" :data-id="submission.id">
  </template>
  <div id="vote-start" class="container">
    <div class="panel">
      <h2>Vote!</h2>
      <p>You will first be shown every submission one at a time.</p>
      <p>After seeing every submission, you will sort the list of submissions so your favourite is at the top and your least favourite is at the bottom.</p>
      <button id="start">Start Voting!</button>
    </div>
  </div>
  <div id="submission-preview" class="hidden loading-fade">
    <div>
      <div class="step-heading">
        <span>Step 1: Viewing Submissions</span>
        <span>Submission <span id="submission-progress">1</span> of {{ submissions.length }}</span>
      </div>
      <div>
        <button class="hidden">Back</button>
        <span></span>
        <button>Next</button>
      </div>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 38 38" width="40" height="40"><defs><linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="A"><stop stop-color="#fff" stop-opacity="0" offset="0%"/><stop stop-color="#fff" stop-opacity=".631" offset="63.146%"/><stop stop-color="#fff" offset="100%"/></linearGradient></defs><g fill="none" fill-rule="evenodd"><g transform="translate(1 1)"><path d="M36 18c0-9.94-8.06-18-18-18" stroke="url(#A)" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"/></path><circle fill="#fff" cx="36" cy="18" r="1"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"/></circle></g></g></svg>
    <img class="popupable">
  </div>
  <div id="submission-voting" class="hidden container">
    <div class="panel">
      <h2>Step 2: Voting</h2>
      <p>Order the submissions so your favourite is at the top and your least favourite is at the bottom. The top {{ Math.ceil(submissions.length * 0.2) }} will be submitted as your vote{{ Math.ceil(submissions.length * 0.2) === 1 ? "" : "s"}}.</p>
    </div>
    <div class="divider">Order Submissions</div>
    <div id="submission-list"></div>
    <div class="divider">Submit Vote{{ Math.ceil(submissions.length * 0.2) === 1 ? "" : "s"}}</div>
    <div class="panel">
      <label for="ready">
        <input type="checkbox" id="ready">
        <span>I have sorted the submissions and am ready to submit! Votes cannot be recast.</span>
      </label>
      <button id="submit" disabled>Submit votes</button>
    </div>
  </div>
</div>
<div v-else-if="contest.status === 'voting'">
  <div id="contest-header" :style="{ backgroundImage: `linear-gradient(transparent, var(--color-background)), url('/assets/images/contests/concept_${contest.id}_thumbnail_large.webp')` }">
    <div></div>
    <h1>Splash Art Contest {{ contest.id }}</h1>
    <h2>"{{ contest.theme }}"</h2>
    <h3 >Voting closes {{ f.relativeTime(contest.finish) }}</h3>
  </div>
  <div class="container">
    <p v-if="contest.description">{{ contest.description }}</p>
    <h1>Live Results:</h1>
    <div id="submission-list">
      <div v-for="[i, submission] of submissions.entries()" class="panel" :data-id="submission.id" :style="{ backgroundImage: `linear-gradient(90deg, var(--color-panel), #0004), linear-gradient(90deg, var(--color-panel), transparent), url('/assets/images/submissions/${contest.id}/${submission.image}_thumbnail_small.webp')` }">
        <div>{{ f.numSuffix(i + 1) }}</div>
        <img :src="`/assets/images/submissions/${contest.id}/${submission.image}_thumbnail_small.webp`" :data-popup-src="`/assets/images/submissions/${contest.id}/${submission.image}.webp`" class="popupable">
        <div class="submission-info">
          <div class="submission-artists">
            By
            <span v-for="(artist, j) of submission.artists">
              <a :href="artist.socialMedia" target="_blank">{{ artist.name }}</a><span v-if="j < submission.artists.length - 1"> & </span>
            </span>
          </div>
          <div class="submission-votes">{{ submission.votes }} Vote{{ submission.votes === 1 ? "" : "s" }}</div>
          <div class="spacer"></div>
          <div v-if="submission.voters.includes(user.id)" class="your-vote">
            <span class="icon">check_circle</span>
            <span>Your vote</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div v-else class="container">Voting is not open at this time</div>