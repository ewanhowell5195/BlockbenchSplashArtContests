<div id="contest-header" :style="{ backgroundImage: `url('/assets/images/submissions/${contest.id}/${submissions[0].image}.png')` }">
  <div></div>
  <h1>Splash Art Contest {{ contest.id }}</h1>
  <h2>"{{ contest.theme }}"</h2>
  <h3>For Blockbench {{ contest.version }} - The {{ contest.name }} Update</h3>
</div>
<div class="container">
  <h1 style="margin-bottom: 0;">Submissions:</h1>
</div>
<div id="submissions" class="container">
  <div class="submission" v-for="(submission, i) of submissions">
    <img :src="`/assets/images/submissions/${contest.id}/${submission.image}.png`" loading="lazy">
    <div class="popupable" :src="`/assets/images/submissions/${contest.id}/${submission.image}.png`">
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
<div class="container">
  <p>Contest date: {{ new Date(contest.date).toLocaleString().split(",")[0] }}</p>
  <p>Submissions: {{ submissions.length.toLocaleString() }}</p>
  <p>Participants: {{ submissions.reduce((a, e) => a + e.artists.length, 0).toLocaleString() }}</p>
  <p>Total votes: {{ submissions.reduce((a, e) => a + e.votes, 0).toLocaleString() }}</p>
</div>