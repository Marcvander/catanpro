const express = require('express');
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');
//needed to load the .env file
require('dotenv').config();

const app = express();
app.use(
  history({
    index: '/',
  })
);
app.use(serveStatic(`${__dirname}/dist`));

const port = process.env.PORT || 80;
app.listen(port);

console.log('Listening on port ' + process.env.PORT || 80)
