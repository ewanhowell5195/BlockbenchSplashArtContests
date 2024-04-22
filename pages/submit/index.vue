<div v-if="contest.status === 'submissions'">
  <h1>Upload a PNG file</h1>
  <label for="submission">Select a PNG file:</label>
  <input type="file" id="submission" name="myFile" accept="image/png">
  <button id="submit">Upload File</button>
</div>
<div v-else>Submissions are not open at this time</div>