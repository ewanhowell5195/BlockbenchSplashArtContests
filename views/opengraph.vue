<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>{{ config.title }}</title>
    <link rel="icon" type="image/svg+xml" href="/assets/images/branding/favicon.svg">
    <meta property="og:type" content="website">
    <meta property="og:title" :content="config.title">
    <meta name="description" :content="config.description">
    <meta property="og:description" :content="config.description">
    <meta property="og:image" :content="`${domain}/${config.image}`">
    <meta property="twitter:image" :content="`${domain}/${config.image}`">
    <meta property="twitter:card" content="summary_large_image">
  </head>
</html>