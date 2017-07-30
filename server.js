var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var fs = require('fs');
//var csurf = require('csurf');
//var cookieParser = require('cookie-parser');
var exphbs  = require('express-handlebars');
var Mastodon = require('mastodon-api');

const { exec } = require('child_process');
const { env } = require('process');
require('dotenv').config()

const serverUrl = env.INSTANCE
let at
let imageUrl

const host = '127.0.0.1';
const port = env.PORT || '3002';

Mastodon.createOAuthApp(`${serverUrl}/api/v1/apps`, 'Unkown')
  .then((data) => {

    cId = data.client_id
    cS = data.client_secret

    // mastodon-api does not seem to support a non-browser approach...
    exec(`curl -X POST -d "client_id=${cId}&client_secret=${cS}&grant_type=password&username=${env.USERNAME}&password=${env.PASSWORD}&scope=read%20write%20follow" -Ss https://awoo.space/oauth/token`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      at = JSON.parse(stdout);
      console.log('auth successful');
      return true;
    });

  }, (err) => { console.log('error', err) })

var app = express();
var upload = multer({ dest: 'uploads/' });
//var csrfProtection = csurf({ cookie: true });

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser);
app.use(express.static(__dirname + '/assets'));


app.get('/', function(req, res) {
  res.render('index', { mastodonAcc: `${env.INSTANCE}/${env.ACCOUNT}` });
});

app.post('/file-upload', upload.single('pic'), function(req, res, next) {
  console.log('file uploaded, prepping toot');

  const M = new Mastodon( {
    access_token: at.access_token,
    api_url: serverUrl + '/api/v1/'
  })

  M.post('media', { file: fs.createReadStream(req.file.path) })
    .then(resp => {
      const id = resp.data.id;
      M.post('statuses', { status: 'by unknown', media_ids: [id] })
        .then(resp => {
          console.log('tooted')
          debugger
          imageUrl = resp.url
        }, err => { console.log(err) })
    }, err => { console.log('err') });
  //  res.redirect('/');
  res.send(JSON.stringify({ image: imageUrl }))
});

app.listen(port, function() {
  console.log(`hey, server running at ${port}`);
});
