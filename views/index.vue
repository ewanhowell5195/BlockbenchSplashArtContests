<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>{{ config.title }}</title>
    <link rel="icon" type="image/svg+xml" href="/assets/images/branding/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@1" />
    <link rel="stylesheet" href="/assets/styles.css">
    <link v-if="styles" rel="stylesheet" :href="'/src/' + styles">
  </head>
  <body>
    <header>
      <div id="header">
        <a id="home-link" href="/">
          <img src="/assets/images/branding/logo.svg" width="32" height="32" alt="Logo">
          <span>Blockbench Splash Art Contests</span>
        </a>
        <div class="spacer"></div>
        <nav>
          <a href="https://blockbench.net/" target="_blank">Blockbench</a>
          <a href="/contests">Contests</a>
          <a href="/vote">Vote</a>
          <a v-if="user" href="/account">
            <img :src="user.avatar" width="32" height="32" alt="Avatar">
            <span>{{ user.global_name }}</span>
          </a>
          <a v-else href="/account">
            <img src="https://cdn.discordapp.com/embed/avatars/0.png" width="32" height="32" alt="Avatar">
            <span>Sign In</span>
          </a>
        </nav>
      </div>
    </header>
    <main>
      <render>content</render>
    </main>
    <script src="/assets/script.js"></script>
    <script v-if="script" :src="'/src/' + script"></script>
  </body>
</html>