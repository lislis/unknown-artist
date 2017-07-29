# Unknown artist

> made for and at Slavic Game Jam 2017

> Theme: unknown

## What?

This project has two logical parts:
1) **Draw a coloful image to happy music**
This was inspired by the gloomy doom talks shortly before the theme was announced.
I usually make games with less happy themes so I thought making someting coloful and relaxing would be nice. I used p5.js for that.
I played around with an USB gamepad to toy around with the Web Gamepad API for drawing. That was interesting!

2) **Publish the image on social media**
First I had the created image only available as download. But what is art if nobody sees it? After Twitter blocking my test account I decided to use Mastodon as social media platform. I wrote a node server that takes the created from the canvas and posts (or toots as they say in Mastodon land) it to an account.
The account is called unkown and shows images created by unknown individuals.


## Running it locally

To have your own unknown artist you need an account on one of the many Mastodon servers and then:

- Clone this repo and cd into it

- `$ mv .env-sample .env` and put it your Mastodon account data

- run `$ npm install`

- `$ npm start`

There you go!


## Credits

Sounds by [Mativve](https://freesound.org/people/Mativve/packs/22004/) under [Attribution License](https://creativecommons.org/licenses/by/3.0/)
