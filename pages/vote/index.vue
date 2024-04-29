<div v-if="contest.status === 'voting'">
  <template id="submissions">
    <img v-for="submission of submissions" :src="`/assets/images/submissions/${submission.contest}/${submission.image}.webp`" :data-id="submission.id">
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
    <div class="step-heading">Step 2: Voting</div>
    <div id="submission-list"></div>
  </div>
</div>
<div v-else class="container">Voting is not open at this time</div>