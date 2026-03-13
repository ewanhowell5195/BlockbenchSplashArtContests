<div id="submissions" class="container" data-popupable-group="submission" :data-contest="currentContest.id">
  <div v-for="submission of submissions" class="panel">
    <img class="submission-image" data-popupable :src="`/assets/images/submissions/${currentContest.id}/${submission.image}_thumbnail_small.webp`" :data-popupable-src="`/assets/images/submissions/${currentContest.id}/${submission.image}.webp`">
    <div class="submission-info">
      <div class="submission-details">
        <div class="submission-artists">
          By
          <span v-for="(artist, j) of submission.artists">
            <span v-if="j"> & </span><a :href="'/artists/' + artist.id">{{ artist.name }}</a>
          </span>
        </div>
        <div>Additional Marketing: {{ submission.agreed ? "Yes" : "No" }}</div>
      </div>
      <button class="danger secondary square delete-submission" :data-id="submission.id"><span class="icon">delete</span></button>
    </div>
  </div>
</div>