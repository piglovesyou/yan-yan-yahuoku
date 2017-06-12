module.exports.default = ([data, contentHTML]) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${data.title}</title>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css"></link>
    <link rel='stylesheet' href='/stylesheets/main.css' />
  </head>
  <body>
    <div id="application-container">${contentHTML}</div>
    <script>window.__initialData = ${JSON.stringify(data)};</script>
    <script src="/javascripts/main.js"></script>
  </body>
</html>`;
};
