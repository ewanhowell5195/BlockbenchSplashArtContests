<div id="submissions" class="container">
  <div v-for="submission of submissions" class="panel">
    <img class="submission-image popupable" :src="`/assets/images/submissions/${currentContest.id}/${submission.image}_thumbnail_small.webp`" :data-popup-src="`/assets/images/submissions/${currentContest.id}/${submission.image}.webp`">
    <div class="submission-artists">
      By
      <span v-for="(artist, j) of submission.artists">
        <a :href="'/artists/' + artist.id" target="_blank">{{ artist.name }}</a><span v-if="j < submission.artists.length - 1"> & </span>
      </span>
    </div>
    <div>Additional Marketing: {{ submission.agreed ? "Yes" : "No" }}</div>
  </div>
</div>