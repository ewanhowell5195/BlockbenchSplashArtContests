<div class="container">
  <div id="account-header" class="panel">
    <img :src="user.avatar + '?size=128'" width="128" height="128" alt="Avatar">
    <div class="panel-group">
      <h1>{{ user.global_name ?? user.username }}</h1>
      <h2 :hidden="!artist || (user.global_name ?? user.username) === artist.name">{{ artist?.name }}</h2>
      <p class="subtle">{{ user.id }}</p>
    </div>
    <div class="spacer"></div>
    <a v-if="artist && hasProfile" id="view-profile" class="button secondary" :href="'/artists/' + artist.id"><span class="icon">person</span><span>View Profile</span></a>
  </div>
  <div class="panel" v-if="!artist">
    <button id="register">Register as an artist</button>
    <p>You will not appear in the artist list until you have at least one submission in a contest that has finished.</p>
  </div>
  <div class="panel" v-if="artist">
    <div class="panel-group">
      <h2>Artist Avatar</h2>
      <label>The avatar shown on your artist page. Maximum {{ settings.maxFileSize / 1024 / 1024 }} MB, minimum 64x64. It will be cropped square and resized.</label>
      <div id="avatar-settings">
        <div id="avatar-preview">
          <img :src="artistAvatar ?? '/assets/images/branding/default_avatar.webp'" width="96" height="96" alt="Artist avatar">
        </div>
        <div>
          <button id="upload-avatar" :data-max-file-size="settings.maxFileSize"><span class="icon">upload</span>Upload Avatar</button>
          <button id="sync-avatar" class="secondary"><span class="fa fa-discord"></span>Sync from Discord</button>
          <button id="remove-avatar" class="secondary danger" :disabled="!artistAvatar"><span class="icon">delete</span>Remove</button>
          <input id="avatar-file" type="file" accept="image/png, image/jpeg, image/webp" class="hidden">
        </div>
      </div>
    </div>
    <div class="panel-group">
      <h2>Display Name</h2>
      <label for="display-name">The name that appears on your submissions and on your artist page.</label>
      <input id="display-name" type="text" maxlength="32" :data-original="artist.name" :value="artist.name">
    </div>
    <div class="panel-group">
      <h2>Social Media URL</h2>
      <label for="social-media">The URL used for linking to your social media or portfolio.</label>
      <input id="social-media" type="url" maxlength="256" :data-original="artist.socialMedia" :value="artist.socialMedia">
    </div>
    <div class="panel-group">
      <h2>Bio</h2>
      <label for="bio">A short bio shown on your artist page.</label>
      <textarea id="bio" maxlength="512" rows="4" :data-original="artist.bio ?? ''" :value="artist.bio ?? ''"></textarea>
    </div>
    <button id="save-changes" disabled>Save changes</button>
  </div>
  <div class="panel" v-if="artist && finishedSubmissions.length">
    <div class="panel-group">
      <h2>Featured Submission</h2>
      <label>The submission used as your profile banner and your artist list preview. Defaults to your most voted submission.</label>
      <div id="featured-picker">
        <div v-for="s of finishedSubmissions" class="featured-option" :class="{ selected: artist.featured === s.image }" :data-image="s.image" :title="'Contest ' + s.contest.id + ' - ' + s.contest.theme" tabindex="0" role="button">
          <img :src="`/assets/images/submissions/${s.contest.id}/${s.image}_thumbnail_small.webp`" :alt="'Contest ' + s.contest.id + ' - ' + s.contest.theme" loading="lazy">
          <span class="icon">check_circle</span>
        </div>
      </div>
    </div>
  </div>
  <div class="panel">
    <a class="button secondary danger" href="/logout"><span class="icon">logout</span>Log Out</a>
  </div>
</div>