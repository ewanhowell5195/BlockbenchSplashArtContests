<div class="container">
  <div v-if="contest.status !== 'finished'" id="current-contest">
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