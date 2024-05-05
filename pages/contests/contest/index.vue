<div id="contest-header" :style="{ backgroundImage: `linear-gradient(transparent, var(--color-background)), url('${currentContest.status === 'finished' && submissions.length ? `/assets/images/submissions/${currentContest.id}/${submissions[0].image}_thumbnail_large.webp` : `/assets/images/contests/concept_${currentContest.id}_thumbnail_large.webp`}')` }">
  <div></div>
  <h2>Splash Art Contest {{ currentContest.id }}</h2>
  <h1 :style="{ backgroundImage: f.blurImageSVG(currentContest.status === 'finished' && submissions.length ? `assets/images/submissions/${currentContest.id}/${submissions[0].image}_thumbnail_small.webp` : `assets/images/contests/concept_${currentContest.id}_thumbnail_small.webp`) }">{{ currentContest.theme }}</h1>
</div>
<div v-if="currentContest.status !== 'finished'" class="container">
  <div class="panel">
    <h2>Welcome to the {{ f.numSuffix(currentContest.id) }} Blockbench Splash Art Contest!</h2>
    <p>This is the contest for the upcoming Blockbench update v{{ currentContest.version }}!</p>
    <h3 v-if="currentContest.status === 'upcoming'">Submissions open {{ f.relativeTime(currentContest.open) }}</h3>
    <h3 v-else-if="currentContest.status === 'submissions'">Submissions close {{ f.relativeTime(currentContest.close) }}</h3>
    <h3 v-else-if="currentContest.status === 'reviewing'">Voting opens {{ f.relativeTime(currentContest.vote) }}</h3>
    <h3 v-else-if="currentContest.status === 'voting'">Voting closes {{ f.relativeTime(currentContest.finish) }}</h3>
    <h3 v-else-if="currentContest.status === 'finished'">For Blockbench v{{ currentContest.version }} - The {{ currentContest.name }} Update</h3>
    <button v-if="currentContest.status === 'upcoming'" disabled>Submit your splash art!</button>
    <a v-else-if="currentContest.status === 'submissions'" class="button" :href="'/submission'">Submit your splash art!</a>
    <button v-else-if="currentContest.status === 'reviewing'" disabled>Vote now!</button>
    <a v-else-if="currentContest.status === 'voting'" class="button" :href="'/vote'">Vote now!</a>
  </div>
  <div class="panel">
    <h2>The theme for this contest: <strong>Underwater!</strong></h2>
  </div>
  <div class="panel">
    <h2>Prizes</h2>
    <ul>
      <li>The <strong>top voted 20%</strong> of submissions (max 5) will be featured in order as a slide show on the Blockbench splash screen.</li>
      <li>The <strong>1st place</strong> will be featured as the update art on social media posts about the update!</li>
      <li>The <strong>1st place</strong> model will also be featured in the <a href="https://www.blockbench.net/gallery" target="_blank">Blockbench Gallery</a></li>
      <li>The splash screen winners will receive a special Discord role with its own section in the member list for 4 weeks after the contest!</li>
    </ul>
  </div>
  <div class="panel">
    <h2>Rules</h2>
    <ol>
      <li>Renders can be made in Blender, Cinema4D, Light Tracer, Sketchfab, or in similar programs. Image editing in post (contrast, backgrounds etc.) is allowed. <a href="https://www.blockbench.net/wiki/guides/model-rendering" target="_blank">Model rendering basics</a></li>
      <li>The model needs to be an original creation, made in Blockbench for this contest. Don't re-use existing models or textures for the model or environment (that includes game worlds as backgrounds)</li>
      <li>Submission should not be based on existing brands or IPs</li>
      <li>Submissions should be G rated (no violence, etc.)</li>
      <li>Collaborations of up to two people are allowed</li>
      <li>You can't win (1st place) in two consecutive contests</li>
      <li>Only one submission per person</li>
    </ol>
  </div>
  <div class="panel">
    <h2>Good luck and enjoy!</h2>
  </div>
</div>
<div v-if="currentContest.status === 'finished'" class="container">
  <div id="contest-information" class="panel">
    <h2>Information</h2>
    <div id="contest-date" class="subtle">{{ new Date(currentContest.date).toLocaleString().split(",")[0] }}</div>
    <p>This contest was for the Blockbench v{{ currentContest.version }} update, also known as the {{ currentContest.name }} update.</p>
    <p v-if="currentContest.description" id="contest-description">{{ currentContest.description }}</p>
    <a class="button secondary" :href="`https://github.com/JannisX11/blockbench/releases/tag/v${currentContest.version}.0`" target="_blank"><span class="fa fa-github"></span><span>Blockbench <span style="text-transform: lowercase;">v</span>{{ currentContest.version }}</span></a>
    <div id="contest-stats" class="subpanel">
      <span>Submissions: {{ submissions.length.toLocaleString() }}</span>
      <span>Participants: {{ submissions.reduce((a, e) => a + e.artists.length, 0).toLocaleString() }}</span>
      <span>Total votes: {{ submissions.reduce((a, e) => a + e.votes, 0).toLocaleString() }}</span>
    </div>
  </div>
  <div class="divider">Submissions</div>
  <div id="submissions">
    <div class="submission" v-for="(submission, i) of submissions">
      <img :src="`/assets/images/submissions/${currentContest.id}/${submission.image}_thumbnail_large.webp`" :alt="'Splash art by ' + submission.artists.map(e => e.name).join(' & ')" loading="lazy">
      <div class="popupable" :src="`/assets/images/submissions/${currentContest.id}/${submission.image}.webp`">
        <div class="submission-position">
          <img v-if="i < 3" :src="`/assets/images/icons/trophy_${i}.png`" width="38" height="38" :alt="f.numSuffix(i + 1) + ' Place Trophy'">
          <span>{{ f.numSuffix(i + 1) }} Place</span>
        </div>
        <div class="submission-votes">
          <img src="/assets/images/icons/like.png" width="28" height="28" alt="Like">
          <span>{{ submission.votes.toLocaleString() }} Vote<span v-if="submission.votes < 1 || submission.votes > 1">s</span></span>
        </div>
        <div class="submission-artists">
          By
          <span v-for="(artist, j) of submission.artists">
            <span v-if="j"> & </span><a :href="'/artists/' + artist.id">{{ artist.name }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</div>