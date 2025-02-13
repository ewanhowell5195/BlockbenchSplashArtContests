<div class="container">
  <div v-if="contest.status === 'finished'" id="contest">
    <script src="/src/file-input.js" type="text/javascript"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <div class="divider">New Contest</div>
    <div class="panel">
      <h3>Contest Theme:</h3>
      <input id="theme" type="text" placeholder="Theme Name" required>
      <h3>Blockbench Version:</h3>
      <input id="version" type="text" placeholder="X.XX" required>
      <h3>Update Name:</h3>
      <div style="display: flex; gap: 10px; align-items: center;">
        <span>The</span>
        <input id="update" type="text" placeholder="Update Name" required>
        <span>Update</span>
      </div>
      <h3>Description:</h3>
      <input id="description" type="text" placeholder="Optional description…">
      <h3>Date and Times:</h3>
      <div id="dates-container">
        <div class="date">
          <h4>Contest Start:</h4>
          <input type="text" id="contest-date">
        </div>
        <div>
          <h4>Submissions Open:</h4>
          <input type="text" id="contest-open">
        </div>
        <div class="date">
          <h4>Submissions Close:</h4>
          <input type="text" id="contest-close">
        </div>
        <div class="date">
          <h4>Voting Starts:</h4>
          <input type="text" id="contest-vote">
        </div>
        <div class="date">
          <h4>Voting Closes:</h4>
          <input type="text" id="contest-finish">
        </div>
      </div>
      <h3>Image:</h3>
      <file-input id="image" accept="image/png" :data-max-file-size="settings.maxFileSize"></file-input>
      <button id="submit" disabled><div class="icon">add</div>Create Contest</button>
    </div>
  </div>
  <div v-else id="contest">
    <div class="divider">Current Contest</div>
    <div class="panel">
      <h2>Information</h2>
      <table>
        <tr>
          <td>Theme:</td>
          <td>{{ contest.theme }}</td>
        </tr>
        <tr>
          <td>Version:</td>
          <td>v{{ contest.version }}</td>
        </tr>
        <tr>
          <td>Name:</td>
          <td>The {{ contest.name }} Update</td>
        </tr>
        <tr>
          <td>Start Date:</td>
          <td>{{ new Date(contest.date).toLocaleString() }}</td>
        </tr>
        <tr>
          <td>Submissions Open:</td>
          <td>{{ new Date(contest.open).toLocaleString() }}</td>
        </tr>
        <tr>
          <td>Submissions Close:</td>
          <td>{{ new Date(contest.close).toLocaleString() }}</td>
        </tr>
        <tr>
          <td>Voting Starts:</td>
          <td>{{ new Date(contest.vote).toLocaleString() }}</td>
        </tr>
        <tr>
          <td>Voting Ends:</td>
          <td>{{ new Date(contest.finish).toLocaleString() }}</td>
        </tr>
        <tr>
          <td>Submissions:</td>
          <td>{{ contests[0].submissions.toLocaleString() }}</td>
        </tr>
      </table>
    </div>
    <div class="panel">
      <h2>Progress</h2>
      <h3>Status: <span id="contest-status">{{ contest.status.slice(0, 1).toUpperCase() + contest.status.slice(1) }}</span></h3>
      <div class="button-row">
        <button v-if="contest.status !== 'upcoming'" id="regress" class="danger secondary">{{ "Regress to " + (contest.status === "submissions" ? "Upcoming" : contest.status === "reviewing" ? "Submissions" : "Reviewing") }}</button>
        <button class="secondary" id="progress">{{ contest.status === "voting" ? "Finish" : "Progress to " + (contest.status === "upcoming" ? "Submissions" : contest.status === "submissions" ? "Reviewing" : "Voting") }}</button>
      </div>
    </div>
    <div class="panel">
      <a class="button" :href="'/admin/contests/' + contest.id">View Contest</a>
    </div>
  </div>
  <div class="divider">Tools</div>
  <div class="panel">
    <div class="button-row">
      <a href="/admin/sql" class="button">SQL</a>
    </div>
  </div>
  <div class="divider">Previous Contests</div>
  <div id="contests">
    <div v-for="contest of contests.filter(e => e.status === 'finished')" class="panel">
      <h2>#{{ contest.id }} - {{ contest.theme }}</h2>
      <div class="contest-date subtle">{{ new Date(contest.date).toLocaleString().split(",")[0] }}</div>
      <p>For Blockbench v{{ contest.version }} - The {{ contest.name }} Update</p>
      <div class="contest-stats subpanel">
        <span>Submissions: {{ contest.submissions.toLocaleString() }}</span>
        <span>Total votes: {{ contest.votes.toLocaleString() }}</span>
      </div>
      <a class="button" :href="'/admin/contests/' + contest.id">View Contest</a>
    </div>
  </div>
</div>