var Mastodon = require('mastodon-api');
var fs = require('fs');
const { exec } = require('child_process');
const { env } = require('process');
require('dotenv').config()

const serverUrl = 'https://awoo.space'
let cId
let cS
let at


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
            console.log(at);

            const M = new Mastodon( {
              access_token: at.access_token,
              api_url: serverUrl + '/api/v1/'
            })
            console.log(M);
            M.post('media', { file: fs.createReadStream('uploads/c4ffb39d44ff1f97f7cfd88741fabc7f') })
             .then(resp => {
               const id = resp.data.id;
               console.log('image ready')
               M.post('statuses', { status: 'by unknown', media_ids: [id] })
                      .then(resp => { console.log('posted')},
                            err => { console.log(err) })
             }, err => { console.log('err') });
          });
        }, (err) => { console.log('error', err) })
