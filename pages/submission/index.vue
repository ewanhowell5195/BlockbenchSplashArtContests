<script src="/src/submission/file-input.js" type="text/javascript"></script>
<div v-if="contest.status === 'submissions' && !submission" class="container">
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
    <button id="submit">Create Submission</button>
  </div>
</div>
<div v-else-if="contest.status === 'submissions' && submission" class="container">
  <div class="panel">
    <h2>Your Submission</h2>
    <img :src="`/assets/images/submissions/${contest.id}/${submission.image}_thumbnail_large.webp`" :data-popup-src="`/assets/images/submissions/${contest.id}/${submission.image}.webp`" class="popupable" alt="Your submission" loading="lazy">
    <button id="retract" class="danger secondary">Retract Submission</button>
  </div>
</div>
<div v-else class="container">Submissions are not open at this time</div>