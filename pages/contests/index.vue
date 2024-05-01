<div id="live-contest" v-if="contest.status !== 'finished'" class="container">
  <div class="contest panel">
    <a class="contest-header" :href="'/contests/' + contest.id" :style="{ backgroundImage: `url('${contest.status === 'finished' && contest.image ? `/assets/images/submissions/${contest.id}/${contest.image}_thumbnail_small.webp` : `/assets/images/contests/concept_${contest.id}_thumbnail_small.webp`}')` }">
      <div>
        <h1>{{ contest.theme }}</h1>
      </div>
    </a>
    <div class="contest-details">
      <div>
        <h2>Contest #{{ contest.id }}</h2>
        <span class="live">Live</span>
      </div>
      <h3 v-if="contest.status === 'upcoming'">Submissions open {{ f.relativeTime(contest.open) }}</h3>
      <h3 v-else-if="contest.status === 'submissions'">Submissions close {{ f.relativeTime(contest.close) }}</h3>
      <h3 v-else-if="contest.status === 'reviewing'">Voting opens {{ f.relativeTime(contest.vote) }}</h3>
      <h3 v-else-if="contest.status === 'voting'">Voting closes {{ f.relativeTime(contest.finish) }}</h3>
      <div class="button-row">
        <a class="button" :href="'contests/' + contest.id">View Contest</a>
      </div>
    </div>
  </div>
</div>
<div id="contests" class="container">
  <div v-for="contest of contests.filter(e => e.status === 'finished')" class="contest panel">
    <a class="contest-header" :href="'/contests/' + contest.id" :style="{ backgroundImage: `url('${contest.status === 'finished' && contest.image ? `/assets/images/submissions/${contest.id}/${contest.image}_thumbnail_small.webp` : `/assets/images/contests/concept_${contest.id}_thumbnail_small.webp`}')` }">
      <div>
        <h1>{{ contest.theme }}</h1>
      </div>
    </a>
    <div class="contest-details">
      <div>
        <h2>Contest #{{ contest.id }}</h2>
        <span class="subtle">{{ new Date(contest.date).toLocaleString().split(",")[0] }}</span>
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
        <a class="button" :href="'contests/' + contest.id">View Results</a>
      </div>
    </div>
  </div>
</div>