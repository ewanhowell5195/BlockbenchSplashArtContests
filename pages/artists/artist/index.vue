<div id="artist-header" :style="{ backgroundImage: `linear-gradient(transparent, var(--color-background)), url('${image}')` }">
  <div></div>
  <h1 :style="{ backgroundImage: f.blurImageSVG(config.image) }">{{ artist.name }}</h1>
</div>
<div class="container">
  <div id="contest-information" class="panel">
    <h2>{{ artist.name }}</h2>
    <a v-if="artist.socialMedia" class="button secondary" :href="artist.socialMedia" target="_blank" style="text-transform: initial;"><img class="favicon" :src="`https://www.google.com/s2/favicons?domain=${encodeURIComponent(artist.socialMedia)}&sz=32`" width="22" height="22" alt="Social Media Favicon"><span>{{ f.prettyURL(artist.socialMedia) }}</span></a>
    <div id="artist-stats" class="subpanel">
      <span>Submissions: {{ submissions.length.toLocaleString() }}</span>
      <span>Collaborations: {{ submissions.filter(e => e.artists.length > 1).length.toLocaleString() }}</span>
      <span>Total votes: {{ votes.toLocaleString() }}</span>
    </div>
  </div>
  <div class="divider">Submissions</div>
  <div id="submissions">
    <div class="submission" v-for="submission of submissions">
      <img :src="`/assets/images/submissions/${submission.contest.id}/${submission.image}_thumbnail_large.webp`" :alt="'Splash art by ' + submission.artists.map(e => e.name).join(' & ')" loading="lazy">
      <div class="popupable" :src="`/assets/images/submissions/${submission.contest.id}/${submission.image}.webp`">
        <a class="submission-position" :href="'/contests/' + submission.contest.id">
          <img v-if="submission.position <= 3" :src="`/assets/images/icons/trophy_${submission.position - 1}.png`" width="38" height="38" :alt="f.numSuffix(submission.position) + ' Place Trophy'">
          <span>{{ f.numSuffix(submission.position) }} Place</span>
        </a>
        <div class="submission-votes">
          <img src="/assets/images/icons/like.png" width="28" height="28" alt="Like">
          <span>{{ submission.votes.toLocaleString() }} Vote<span v-if="submission.votes < 1 || submission.votes > 1">s</span></span>
        </div>
        <div v-if="submission.artists.length > 1" class="submission-artists">
          Collaboration with
          <span v-for="(artist, j) of submission.artists.filter(e => e.id !== artist.id)">
            <span v-if="j"> & </span><a :href="'/artists/' + artist.id">{{ artist.name }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</div>