<div class="container">
  <div class="panel terminal-panel">
    <div class="terminal-toolbar">
      <button type="button" class="term-btn" data-command="git pull">Pull changes</button>
      <button type="button" class="term-btn" data-command="npm i">npm i</button>
      <button type="button" class="term-btn" data-command="pm2 restart blockbench_contest" data-confirm="Restart the server? (pm2 restart blockbench_contest)">Restart server</button>
      <button type="button" class="term-btn ghost" id="clear-btn">Clear</button>
    </div>
    <div id="output" class="output"></div>
    <form id="terminal-form" class="input-line">
      <span id="prompt" class="prompt">$</span>
      <input id="command" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Enter a command…">
    </form>
  </div>
</div>
