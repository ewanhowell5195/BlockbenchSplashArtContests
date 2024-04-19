<h1>{{ config.title }}</h1>
<img  v-for="submission of submissions" :src="`/assets/images/submissions/${contest.id}/${submission.id}.png`" height="128px">