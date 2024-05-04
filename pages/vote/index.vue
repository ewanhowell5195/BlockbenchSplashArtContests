<div v-if="contest.status === 'voting' && !voted">
  <template id="submissions">
    <img v-for="submission of submissions" :src="`/assets/images/submissions/${contest.id}/${submission.image}.webp`" :data-id="submission.id">
  </template>
  <div id="vote-start" class="container">
    <div class="panel">
      <h2>Voting!</h2>
      <p>You will first be shown every submission one at a time, allowing you to view each one before you vote.</p>
      <p>After seeing every submission, you can then select {{ voteCount }} submission{{ voteCount === 1 ? "" : "s" }} as your vote{{ voteCount === 1 ? "" : "s" }}.</p>
      <button id="start">View Submissions!</button>
    </div>
  </div>
  <div id="submission-preview" class="hidden loading-fade">
    <div>
      <div class="step-heading">
        <span>View Submissions</span>
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
      <h2>Voting</h2>
      <p>Select the {{ voteCount }} submission{{ voteCount === 1 ? "" : "s"}} that you wish to vote for.</p>
      <p>The submission artists will be revealed after you have voted.</p>
    </div>
    <div class="section">
      <div class="divider sticky">
        <div><span id="selection-counter">0</span> / {{ voteCount }} Selected</div>
      </div>
      <div id="submission-list"></div>
    </div>
    <div class="divider">Submit Vote{{ voteCount === 1 ? "" : "s"}}</div>
    <div class="panel">
      <label for="ready">
        <input type="checkbox" id="ready">
        <span>I have chosen my votes and am ready to submit! Votes cannot be recast.</span>
      </label>
      <button id="submit" disabled>Submit votes</button>
    </div>
  </div>
</div>
<div v-else class="container">Voting is not open at this time</div>