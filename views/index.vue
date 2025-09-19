<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>{{ config.title }}</title>
    <link rel="icon" type="image/svg+xml" href="/assets/images/branding/favicon.svg">
    <meta property="og:type" content="website">
    <meta property="og:title" :content="config.title">
    <meta name="description" :content="config.description">
    <meta property="og:description" :content="config.description">
    <meta property="og:image" :content="`${domain}/${config.image}`">
    <meta property="twitter:image" :content="`${domain}/${config.image}`">
    <meta property="twitter:card" content="summary_large_image">
    <meta name="theme-color" :content="config.colour">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@1" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/brands.min.css" />
    <link rel="stylesheet" href="/src/styles.css">
    <link v-if="styles" rel="stylesheet" :href="'/src/' + styles">
  </head>
  <body :class="{ 'role-user': !user?.admin, 'role-admin': user?.admin }">
    <header>
      <div id="header">
        <a id="home-link" href="/">
          <img src="/assets/images/branding/logo.svg" width="32" height="32" alt="Logo">
        </a>
        <div class="spacer"></div>
        <nav>
          <a href="https://blockbench.net/" target="_blank">Blockbench <span class="icon">open_in_new</span></a>
          <a v-if="user?.admin" href="/admin">Admin</a>
          <a v-if="contest.status === 'upcoming'" id="current-contest" :href="'/contests/' + contest.id">Upcoming</a>
          <a v-else-if="contest.status === 'submissions'" id="current-contest" href="/submission">Submit</a>
          <a v-else-if="contest.status === 'reviewing'" id="current-contest" :href="'/contests/' + contest.id">Current</a>
          <a v-else-if="contest.status === 'voting'" id="current-contest" href="/vote">Vote</a>
          <a href="/contests">Contests</a>
          <a v-if="user" href="/account">
            <img :src="user.avatar + '?size=32'" width="32" height="32" alt="Avatar">
            <span>{{ user.global_name ?? user.username }}</span>
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
    <footer>
      <div id="footer">
        <a href="https://ewanhowell.com/" target="_blank">Site by Ewan Howell</a>
      </div>
    </footer>
    <div id="notification-container"></div>
    <script src="/src/script.js"></script>
    <script v-if="script" :src="'/src/' + script"></script>
  </body>
</html>