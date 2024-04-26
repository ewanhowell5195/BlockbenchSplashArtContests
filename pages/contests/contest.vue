<div id="contest-header" :style="{ backgroundImage: `linear-gradient(transparent, var(--color-background)), url('${currentContest.status === 'finished' && submissions.length ? `/assets/images/submissions/${currentContest.id}/${submissions[0].image}_thumbnail_large.webp` : `/assets/images/contests/concept_${currentContest.id}_thumbnail_large.webp`}')` }">
  <div></div>
  <h1>Splash Art Contest {{ currentContest.id }}</h1>
  <h2>"{{ currentContest.theme }}"</h2>
  <h3 v-if="currentContest.status === 'upcoming'">Submissions open {{ f.relativeTime(currentContest.open) }}</h3>
  <h3 v-if="currentContest.status === 'submissions'">Submissions close {{ f.relativeTime(currentContest.close) }}</h3>
  <h3 v-if="currentContest.status === 'finished'">For Blockbench v{{ currentContest.version }} - The {{ currentContest.name }} Update</h3>
</div>
<div v-if="currentContest.status !== 'finished'" class="container">
  <button v-if="currentContest.status === 'upcoming'" disabled>Submit your splash art!</button>
  <a v-if="currentContest.status === 'submissions'" class="button" :href="'/submission'">Submit your splash art!</a>
  <h2>Welcome to the {{ f.numSuffix(currentContest.id) }} Blockbench Splash Art Contest!</h2>
  <p>This is the contest for the upcoming Blockbench update {{ currentContest.version }}!</p>
  <h2>Prizes</h2>
  <ul>
    <li>The <strong>top voted 20%</strong> of submissions (max 5) will be featured in order as a slide show on the Blockbench splash screen</li>
    <li>The <strong>1st place</strong> will be featured as the update art on social media posts about the update!</li>
    <li>The <strong>1st place</strong> model will also be featured in the <a href="https://www.blockbench.net/gallery" target="_blank">Blockbench Gallery</a></li>
    <li>The splash screen winners will receive a special Discord role with its own section in the member list for 4 weeks after the contest!</li>
  </ul>
  <p>The Theme for this Contest: <strong>Underwater!</strong></p>
  <h2>Rules</h2>
  <ol>
    <li>Renders can be made in Blender, Cinema4D, Light Tracer, Sketchfab, or in similar programs. Image editing in post (contrast, backgrounds etc.) is allowed. <a href="https://www.blockbench.net/wiki/guides/model-rendering" target="_blank">Model rendering basics</a></li>
    <li>The model needs to be an original creation, made in Blockbench for this contest. Don't re-use existing models or textures for the model or environment (that includes game worlds as backgrounds)</li>
    <li>Submission should not be based on existing brands or IPs</li>
    <li>Submissions should be G rated (no violence etc.)</li>
    <li>Collaborations of up to two people are allowed</li>
    <li>You can't win (1st place) in two consecutive contests</li>
    <li>Only one submission per person</li>
  </ol>
  <h2>Good luck and enjoy!</h2>
</div>
<div v-if="currentContest.status === 'finished'" class="container">
  <p v-if="currentContest.description">{{ currentContest.description }}</p>
  <h1 style="margin-bottom: 0;">Submissions:</h1>
  <div id="submissions">
    <div class="submission" v-for="(submission, i) of submissions">
      <img :src="`/assets/images/submissions/${currentContest.id}/${submission.image}_thumbnail_large.webp`" :alt="'Splash art by ' + submission.artists.map(e => e.name).join(' & ')" loading="lazy">
      <div class="popupable" :src="`/assets/images/submissions/${currentContest.id}/${submission.image}.webp`">
        <div class="submission-position">{{ f.numSuffix(i + 1) }} Place</div>
        <div class="submission-votes">{{ submission.votes.toLocaleString() }} Vote<span v-if="submission.votes < 1 || submission.votes > 1">s</span></div>
        <div class="submission-artists">
          By
          <span v-for="(artist, j) of submission.artists">
            <a :href="artist.socialMedia" target="_blank">{{ artist.name }}</a><span v-if="j < submission.artists.length - 1"> & </span>
          </span>
        </div>
      </div>
    </div>
  </div>
  <div id="contest-stats">
    <span>Contest date: {{ new Date(currentContest.date).toLocaleString().split(",")[0] }}</span>
    <span>Submissions: {{ submissions.length.toLocaleString() }}</span>
    <span>Participants: {{ submissions.reduce((a, e) => a + e.artists.length, 0).toLocaleString() }}</span>
    <span>Total votes: {{ submissions.reduce((a, e) => a + e.votes, 0).toLocaleString() }}</span>
  </div>
</div>