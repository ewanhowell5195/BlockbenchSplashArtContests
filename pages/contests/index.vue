<div id="contests" class="container">
  <div v-for="contest of contests.filter(e => e.status === 'finished')" class="contest">
    <a class="contest-header" :href="'/contests/' + contest.id" :style="{ backgroundImage: `url('assets/images/submissions/${contest.id}/${contest.image}.png')` }">
      <div>
        <h1>{{ contest.theme }}</h1>
      </div>
    </a>
    <div class="contest-details">
      <div>
        <h2>Contest #{{ contest.id }}</h2>
        <span>{{ new Date(contest.date).toLocaleString().split(",")[0] }}</span>
      </div>
      <h3>The {{ contest.name }} Update</h3>
      <table>
        <tr>
          <td>Submissions:</td>
          <td>{{ contest.submissions.toLocaleString() }}</td>
        </tr>
        <tr>
          <td>Total votes:</td>
          <td>{{ contest.votes.toLocaleString() }}</td>
        </tr>
      </table>
      <div class="button-row">
        <a class="button secondary" :href="`https://github.com/JannisX11/blockbench/releases/tag/v${contest.version}.0`" target="_blank"><span class="fa fa-github"></span><span>Blockbench <span style="text-transform: lowercase;">v</span>{{ contest.version }}</span></a>
        <a class="button" :href="'contests/' + contest.id">View results</a>
      </div>
    </div>
  </div>
</div>