<div v-if="contest.status === 'submissions' && !submission" class="container">
  <script src="/src/file-input.js" type="text/javascript"></script>
  <div class="panel">
    <h2>Upload Submission</h2>
    <h3 style="margin-bottom: -10px;">Requirements:</h3>
    <table>
      <tr>
        <td>Maximum File Size:</td>
        <td>{{ settings.maxFileSize / 1024 / 1024 }} MB</td>
      </tr>
      <tr>
        <td>Minimum Size:</td>
        <td>{{ settings.minWidth.toLocaleString() }} x {{ Math.round(settings.minWidth / settings.aspectRatio[0] * settings.aspectRatio[1]).toLocaleString() }}</td>
      </tr>
      <tr>
        <td>Maximum Size:</td>
        <td>{{ settings.maxWidth.toLocaleString() }} x {{ Math.round(settings.maxWidth / settings.aspectRatio[0] * settings.aspectRatio[1]).toLocaleString() }}</td>
      </tr>
      <tr>
        <td>Aspect Ratio:</td>
        <td>{{ settings.aspectRatio.join(":") }}</td>
      </tr>
    </table>
    <file-input accept="image/png" :data-max-file-size="settings.maxFileSize" :data-aspect-ratio="settings.aspectRatio.join(':')" :data-min-width="settings.minWidth" :data-max-width="settings.maxWidth"></file-input>
    <label for="required">
      <input type="checkbox" id="required">
      <span>I agree that my submission can be used for the Blockbench splash screen, the gallery on <a href="https://blockbench.net/" target="_blank">blockbench.net</a>, the <a href="/contests" target="_blank">previous contests archive</a>, and for update posts on social media, such as Discord, Twitter, Reddit, etc.</span>
    </label>
    <label for="optional">
      <input type="checkbox" id="optional">
      <span>I agree that my submission can be used for additional Blockbench marketing, such as social media banners, posts, YouTube end-cards, etc. (Optional)</span>
    </label>
    <button id="submit" disabled><svg viewBox="0 0 24 24"><path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z"></path></svg>Create Submission</button>
  </div>
</div>
<div v-else-if="contest.status === 'submissions' && submission" class="container">
  <div class="panel">
    <h2>Your Submission</h2>
    <img :src="`/assets/images/submissions/${contest.id}/${submission.image}_thumbnail_large.webp`" :data-popup-src="`/assets/images/submissions/${contest.id}/${submission.image}.webp`" class="popupable" alt="Your submission" loading="lazy">    
  </div>
  <div class="panel">
    <h2>Artist Details</h2>
    <p>These are the details that will appear on your submission.</p>
    <div class="subpanel">
      <p><strong>Artist Name:</strong></p>
      <p>{{ artist.name }}</p>
    </div>
    <div v-if="artist.socialMedia" class="subpanel">
      <p><strong>Social Media:</strong></p>
      <p><a :href="artist.socialMedia" target="_blank">{{ artist.socialMedia }}</a></p>
    </div>
    <p>These details can be changed from your <a href="/account">account</a> page.</p>
  </div>
  <div v-if="submission.artists.length === 1" class="panel">
    <h2>Invite Collaborator</h2>
    <p>Worked on this submission with someone else? Generate an invite link to add them as a collaborator!</p>
    <div class="button-row">
      <button v-if="invite" id="invite" :data-invite="invite"><span class="icon">link</span>Copy Invite Link</button>
      <button v-else id="invite"><span class="icon">person_add</span>Generate Invite Link</button>
      <button id="delete-invite" class="danger secondary square" :class="{ hidden: !invite }"><span class="icon">delete</span></button>
    </div>
  </div>
  <div v-else class="panel">
    <h2>Collaborators</h2>
    <div v-for="[i, artist] of submission.artists.entries()" class="collaborator subpanel">
      <a :href="'/artists/' + artist.id" class="button secondary square"><span class="icon">person</span></a>
      <a :href="'https://discord.com/users/' + artist.id" class="button secondary square" target="_blank"><span class="fa fa-discord"></span></a>
      <div class="name">{{ artist.name }}</div>
      <div class="spacer"></div>
      <button v-if="i !== 0 && user.id !== artist.id" class="danger secondary square remove-collaborator" :data-id="artist.id"><span class="icon">delete</span></button>
      <div v-else-if="user.id === artist.id" class="subtle">You</div>
      <div v-else-if="i === 0 && user.id !== artist.id" class="subtle">Owner</div>
    </div>
  </div>
  <div class="panel">
    <button v-if="submission.artists[0].id === user.id" id="retract" class="danger secondary"><span class="icon">delete</span>Retract Submission</button>
    <button v-else id="leave" class="danger secondary" :data-id="user.id"><span class="icon">logout</span>Leave Submission</button>
  </div>
</div>
<div v-else class="container">Submissions are not open at this time</div>