<div class="container">
  <div id="artist-profile" class="panel">
    <div id="artist-banner">
      <img :src="banner" alt="">
      <a v-if="user && user.id === artist.id" id="edit-profile" class="button" href="/account"><span class="icon">edit</span>Edit Profile</a>
    </div>
    <div id="artist-profile-body">
      <div id="artist-profile-main">
        <div id="artist-avatar">
        <img :src="avatar ?? '/assets/images/branding/default_avatar.webp'" width="180" height="180" alt="Avatar">
      </div>
        <div id="artist-details">
          <h1>{{ artist.name }}</h1>
          <a v-if="artist.socialMedia" id="artist-social" class="button secondary" :href="artist.socialMedia" target="_blank"><img class="favicon" :src="`https://www.google.com/s2/favicons?domain=${encodeURIComponent(artist.socialMedia)}&sz=32`" width="22" height="22" alt="Social Media Favicon"><span>{{ f.prettyURL(artist.socialMedia) }}</span></a>
        </div>
        <div v-if="trophies.golds || trophies.silvers || trophies.bronzes" id="artist-trophy-case">
          <div v-if="trophies.golds" class="profile-trophy" :title="trophies.golds.toLocaleString() + 'x 1st place'">
            <img src="/assets/images/icons/trophy_0.png" width="42" height="42" alt="1st place trophy">
            <span>{{ trophies.golds.toLocaleString() }}</span>
          </div>
          <div v-if="trophies.silvers" class="profile-trophy" :title="trophies.silvers.toLocaleString() + 'x 2nd place'">
            <img src="/assets/images/icons/trophy_1.png" width="42" height="42" alt="2nd place trophy">
            <span>{{ trophies.silvers.toLocaleString() }}</span>
          </div>
          <div v-if="trophies.bronzes" class="profile-trophy" :title="trophies.bronzes.toLocaleString() + 'x 3rd place'">
            <img src="/assets/images/icons/trophy_2.png" width="42" height="42" alt="3rd place trophy">
            <span>{{ trophies.bronzes.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      <p v-if="artist.bio" id="artist-bio">{{ artist.bio }}</p>
      <div id="artist-profile-stats">
        <div v-if="trophies.golds" class="profile-trophy mobile-trophy" :title="trophies.golds.toLocaleString() + 'x 1st place'">
          <img src="/assets/images/icons/trophy_0.png" width="22" height="22" alt="1st place trophy">
          <span>{{ trophies.golds.toLocaleString() }}</span>
        </div>
        <div v-if="trophies.silvers" class="profile-trophy mobile-trophy" :title="trophies.silvers.toLocaleString() + 'x 2nd place'">
          <img src="/assets/images/icons/trophy_1.png" width="22" height="22" alt="2nd place trophy">
          <span>{{ trophies.silvers.toLocaleString() }}</span>
        </div>
        <div v-if="trophies.bronzes" class="profile-trophy mobile-trophy" :title="trophies.bronzes.toLocaleString() + 'x 3rd place'">
          <img src="/assets/images/icons/trophy_2.png" width="22" height="22" alt="3rd place trophy">
          <span>{{ trophies.bronzes.toLocaleString() }}</span>
        </div>
        <div class="profile-stat">
          <img src="/assets/images/icons/like.png" width="22" height="22" alt="Votes">
          <span>{{ votes.toLocaleString() }} Vote{{ votes === 1 ? '' : 's' }}</span>
        </div>
        <div class="profile-stat">
          <span class="icon">image</span>
          <span>{{ submissions.length.toLocaleString() }} Submission{{ submissions.length === 1 ? '' : 's' }}</span>
        </div>
        <div v-if="collabs" class="profile-stat">
          <span class="icon">group</span>
          <span>{{ collabs.toLocaleString() }} Collaboration{{ collabs === 1 ? '' : 's' }}</span>
        </div>
      </div>
    </div>
  </div>
  <div id="submissions" data-popupable-group="submission">
    <div class="submission" v-for="submission of submissions">
      <img :src="`/assets/images/submissions/${submission.contest.id}/${submission.image}_thumbnail_large.webp`" :data-popupable-src="`/assets/images/submissions/${submission.contest.id}/${submission.image}.webp`" :data-popupable-title="submission.artists.length > 1 ? 'In collaboration with ' + submission.artists.filter(e => e.id !== artist.id).map(e => e.name).join(' & ') : null" :data-popupable-description="f.numSuffix(submission.position) + ' Place · ' + submission.votes.toLocaleString() + ' Vote' + (submission.votes === 1 ? '' : 's') + ' · Contest ' + submission.contest.id + ' - ' + submission.contest.theme" :alt="'Splash art by ' + submission.artists.map(e => e.name).join(' & ')" loading="lazy" data-popupable>
      <div>
        <a class="submission-position" :href="'/contests/' + submission.contest.id">
          <img v-if="submission.position <= 3" :src="`/assets/images/icons/trophy_${submission.position - 1}.png`" width="28" height="28" :alt="f.numSuffix(submission.position) + ' Place Trophy'">
          <span>{{ f.numSuffix(submission.position) }} Place</span>
        </a>
        <div class="submission-votes">
          <img src="/assets/images/icons/like.png" width="20" height="20" alt="Like">
          <span>{{ submission.votes.toLocaleString() }} Vote<span v-if="submission.votes < 1 || submission.votes > 1">s</span></span>
        </div>
        <div class="submission-details">
          <a class="submission-contest" :href="'/contests/' + submission.contest.id">Contest {{ submission.contest.id }} · {{ submission.contest.theme }}</a>
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
</div>