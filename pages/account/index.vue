<div class="container">
  <div id="account-header" class="panel">
    <img :src="user.avatar + '?size=128'" width="128" height="128" alt="Avatar">
    <div class="panel-group">
      <h1>{{ user.global_name }}</h1>
      <h2 :hidden="!artist || user.global_name === artist.name">{{ artist?.name }}</h2>
      <p class="subtle">{{ user.id }}</p>
    </div>
  </div>
  <div class="panel" v-if="!artist">
    <button id="register">Register as an artist</button>
    <p>You will not appear in the artist list until you have at least one submission in a contest that has finished.</p>
  </div>
  <div class="panel" v-if="artist">
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
    <button id="save-changes" disabled>Save changes</button>
  </div>
  <div class="panel">
    <a class="button secondary danger" href="/logout"><span class="icon">logout</span>Log Out</a>
  </div>
</div>