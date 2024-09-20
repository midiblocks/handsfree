# 24-05-17 This project has been archived

I hope that the original author of this package, Oz, is doing well. But given that Handsfree seemed to have been abandonned, I have restored this repository and the associated NPM package in case anybody is still using it. The project is still essentially in an archived state, but I can try to address any issues moving forward.

<hr>

<div align="center">
  <p><a href="https://handsfree.js.org"><img src="https://media2.giphy.com/media/BBcnSU1IJ5tpQbwXDI/giphy.gif" alt="handsfree.js.org" title="handsfree.js.org"></a></p>
  <p>Quickly integrate face, hand, and/or pose tracking to your frontend projects in a snap ✨👌</p>
  <p>
    <img class="mr-1" src="https://img.shields.io/github/tag/handsfreejs/handsfree.svg"> <img class="mr-1" src="https://img.shields.io/github/last-commit/handsfreejs/handsfree.svg">
    <img src="https://img.shields.io/github/repo-size/handsfreejs/handsfree.svg">
  </p>
  <p>
    <img class="mr-1" src="https://img.shields.io/github/issues-raw/handsfreejs/handsfree.svg"> <img src="https://img.shields.io/github/issues-pr-raw/handsfreejs/handsfree.svg">
  </p>
  <p>Powered by:</p>
  <p>
    <a href="https://mediapipe.dev"><img src="https://i.imgur.com/VGSWYrC.png" height=30></a>
    &nbsp;&nbsp;&nbsp;
    <a href="https://github.com/tensorflow/tfjs-models/"><img src='https://i.imgur.com/Z5PUig3.png' height=30></a>
    &nbsp;&nbsp;&nbsp; 
    <a href="https://github.com/jeeliz/jeelizWeboji"><img width=100 src="https://jeeliz.com/wp-content/uploads/2018/01/LOGO_JEELIZ_BLUE.png"></a>
</div>


<br>
<br>
<br>
<hr>
<br>
<br>
<br>

<h1 style="color: red">💻 Project Documentation</h1>
I'm still experimenting with various ways to create documentation. The docs can be found:

- https://handsfree.js.org  - This is the documentation that runs locally, and is the oldest docs
- https://handsfree.dev - This is the newer site hosted on WordPress, and includes the start of the Handsfree Plugin Repository
- https://codemedium.com/b1f09b783c034644acc1c873f347d6da - This is the Notion version of the documentation

Sorry for the confusion! I'll likely be settling on Notion but am still trying to find the best docs. Thanks!

<br>
<br>
<br>
<hr>
<br>
<br>
<br>

# Contents
This repo is broken into 3 main parts: The actual library itself found in `/src/`, the documentation for it in `/docs/`, and the Handsfree Browser Extension in `/extension/`.

- Handsfree.js
  - [Quickstart with CDN](#installing-from-cdn) (fastest way to get started)
  - [Quickstart with NPM](#installing-from-npm) (requires server or bundler)
- [Development guide](#local-development)
- [Handsfree Browser Extension](#the-handsfree-browser-extension)

<br>
<br>
<br>
<hr>
<br>
<br>
<br>

# Quickstart
## Installing from CDN

> Note: models loaded from the CDN may load slower on the initial page load, but should load much faster once cached by the browser.

This option is great if you don't have or need a server, or if you're prototyping on a [site like CodePen](https://codepen.io/MIDIBlocks/pen/mdrwYzM). You can also [just download this repo](https://github.com/MIDIBlocks/handsfree/archive/master.zip) and work with one of the `/boilerplate/`.

```html
<head>
  <!-- Include Handsfree.js -->
  <link rel="stylesheet" href="https://unpkg.com/handsfree@8.5.1/build/lib/assets/handsfree.css" />
  <script src="https://unpkg.com/handsfree@8.5.1/build/lib/handsfree.js"></script>
</head>

<body>
  <!-- Your code must be inside body as it applies classes to it -->
  <script>
    // Let's use handtracking and show the webcam feed with wireframes
    const handsfree = new Handsfree({showDebug: true, hands: true})
    handsfree.start()

    // Create a plugin named "logger" to show data on every frame
    handsfree.use('logger', data => {
      console.log(data.hands)
    })
  </script>
</body>
```

## Installing from NPM

```bash 
# From your projects root
npm i handsfree
```

```js
// Inside your app
import Handsfree from 'handsfree'

// Let's use handtracking and enable the plugins tagged with "browser"
const handsfree = new Handsfree({showDebug: true, hands: true})
handsfree.enablePlugins('browser')
handsfree.start()
```

## Hosting the models yourself

The above will load models, some over 10Mb, from the [Unpkg CDN](https://unpkg.com/browse/handsfree@8.5.1/build/lib/assets). If you'd rather host these yourself (for example, to use offline) then you can eject the models from the npm package into your project's public folder:

```bash
# Move the models into your project's public directory
# - change PUBLIC below to where you keep your project's assets

# ON WINDOWS
xcopy /e node_modules\handsfree\build\lib PUBLIC
# EVERYWHERE ELSE
cp -r node_modules/handsfree/build/lib/* PUBLIC
```

```js
import Handsfree from 'handsfree'

const handsfree = new Handsfree({
  hands: true,
  // Set this to your where you moved the models into
  assetsPath: '/PUBLIC/assets',
})
handsfree.enablePlugins('browser')
handsfree.start()
```

<br>
<br>
<br>
<hr>
<br>
<br>
<br>

# Example Workflow

The following aims to give you a quick overview of how things work. The key takeaway is that everything is centered around hooks/plugins, which are basically named callbacks which are run on every frame and can be toggled on and off.

## Quickstart Workflow

The following workflow demonstrates how to use all features of Handsfree.js. Check out the [Guides](/guides/) and [References](/ref/) to dive deeper, and feel free to post on the [Google Groups](https://groups.google.com/g/handsfreejs) or [Discord](https://discord.gg/JeevWjTEdu) if you get stuck!

```js
// Let's enable face tracking with the default Face Pointer
const handsfree = new Handsfree({weboji: true})
handsfree.enablePlugins('browser')

// Now let's start things up
handsfree.start()

// Let's create a plugin called "logger"
// - Plugins run on every frame and is how you "plug in" to the main loop
// - "this" context is the plugin itself. In this case, handsfree.plugin.logger
handsfree.use('logger', data => {
  console.log(data.weboji.morphs, data.weboji.rotation, data.weboji.pointer, data, this)
})

// Let's switch to hand tracking now. To demonstrate that you can do this live,
// let's create a plugin that switches to hand tracking when both eyebrows go up
handsfree.use('handTrackingSwitcher', {weboji} => {
  if (weboji.state.browsUp) {
    // Disable this plugin
    // Same as handsfree.plugin.handTrackingSwitcher.disable()
    this.disable()

    // Turn off face tracking and enable hand tracking
    handsfree.update({
      weboji: false,
      hands: true
    })
  }
})

// You can enable and disable any combination of models and plugins
handsfree.update({
  // Disable weboji which is currently running
  weboji: false,
  // Start the pose model
  pose: true,

  // This is also how you configure (or pre-configure) a bunch of plugins at once
  plugin: {
    fingerPointer: {enabled: false},
    faceScroll: {
      vertScroll: {
        scrollSpeed: 0.01
      }
    }
  }
})

// Disable all plugins
handsfree.disablePlugins()
// Enable only the plugins for making music (not actually implemented yet)
handsfree.enablePlugins('music')

// Overwrite our logger to display the original model APIs
handsfree.plugin.logger.onFrame = (data) => {
  console.log(handsfree.model.pose?.api, handsfree.model.weboji?.api, handsfree.model.pose?.api)
}
```

<br>
<br>
<br>
<hr>
<br>
<br>
<br>

# Examples

## Face Tracking Examples
<table>
  <tr>
    <td>
      <p><strong>Face Pointers</strong></p>
      <p><img src="https://media4.giphy.com/media/Iv2aSMS0QTy2P5JNCX/giphy.gif"></p>
    </td>
    <td>
      <p><strong>Motion Parallax Display</strong></p>
      <p><img src="https://media4.giphy.com/media/8sCpFH9JCws8iWsaoj/giphy.gif"></p>
    </td>
  </tr>
  <tr>
    <td>
      <p><strong>Puppeteering Industrial Robots</strong></p>
      <p><img src="https://media4.giphy.com/media/1XE2rnMPk6BFu8VQRr/giphy.gif"></p>
    </td>
    <td>
      <p><strong>Playing desktop games with face clicks</strong></p>
      <p><img src="https://media4.giphy.com/media/YATR9GZSSHKeNw3fht/giphy.gif"></p>
    </td>
  </tr>
</table>

<hr>

## Hand Tracking Examples
<table>
  <tr>
    <td>
      <p><strong>Hand Pointers</strong></p>
      <p><img src="https://media4.giphy.com/media/FxLUuTSxXjJPx8K9L4/giphy.gif"></p>
    </td>
    <td>
      <p><strong>Use with Three.js</strong></p>
      <p><img src="https://media4.giphy.com/media/brC1Ow2v62htVmpfLh/giphy.gif"></p>
    </td>
  </tr>
  <tr>
    <td>
      <p><strong>Playing desktop games with pinch clicks</strong></p>
      <p><img src="https://media4.giphy.com/media/pdDOkUpnRbzMk8r0L4/giphy.gif"></p>
    </td>
    <td>
      <p><strong>Laser pointers but with your finger</strong></p>
      <p><img src="https://media4.giphy.com/media/2vcbWI2ZAPeGvJVpII/giphy.gif"></p>
    </td>
  </tr>
</table>

---

## Pose Estimation Examples
<table>
  <tr>
    <td width="50%">
      <p><strong>Flappy Pose - Flappy Bird but where you have to flap your arms</strong></p>
      <p><img src="https://media4.giphy.com/media/hwNj7nfkDljmlnaNRA/giphy.gif"></p>
    </td>
    <td></td>
  </tr>
</table>

<br>
<br>
<br>
<hr>
<br>
<br>
<br>


# Local Development

If you'd like to contribute to the library or documentation then the following will get you going:

- Install [NodeJS](https://nodejs.org/en/download/) and [git](https://git-scm.com/downloads)
- Clone this repository: `git clone https://github.com/handsfreejs/handsfree`
- Install dependencies by running `npm i` in a terminal from the project's root
- Start development on `localhost:8080` by running `npm start`
- Hit CTRL+C from the terminal to close the server

Once you've run the above, you can just use `npm start`. If you pull the latest code, remember to run `npm i` to get any new dependencies (this shouldn't happen often).

## Command line scripts
```bash
# Start local development on localhost:8080
npm start 

# Builds the library, documentation, and extension
npm run build

# Build only the library /dist/lib/
npm run build:lib

# Build only the documentation at /dist/docs/
npm run build:docs

# Build only the extension at /dist/extension
npm run build:extension

# Publish library to NPM
npm login
npm publish

# Deploy documentation to handsfree.js.org
deploy.sh
```

## Dev Notes
- See [vuepress-component-font-awesome](https://github.com/HiYue/vuepress-component-font-awesome#generate-specified-icons-only) for adding new icons to the documentation. Remember to run `npm run fa:build` when adding new font icons so that they are copied over into the `docs/.vuepress/components/FA`  folder
- You may occasionally need to restart server when adding new files to the `/docs`, this is true when changing `/docs/.vuepress.config.js` as well

<br>
<br>
<br>
<hr>
<br>
<br>
<br>

# The Handsfree Browser Extension

The Browser Extension is a designed to help you browse the web handsfree through face and/or hand gestures. The goal is to develop a "[Userscript Manager](https://en.wikipedia.org/wiki/Userscript_manager)" like [Tampermonkey](https://www.tampermonkey.net/), but for handsfree-ifying web pages, games, apps, WebXR and really any other type of content found the web.

## How it works

![](https://i.imgur.com/VKFeZpB.jpg)

- When you first install the extension, `/src/background/handsfree.js` checks if you've approved the webcam. If not, then it'll open the options page in `src/options/stream-capture.html`
- The popup panel has a "Start/Stop Webcam" button that communicates with the background script to start the webcam: `/src/popup/index.html`
- The background page is where the models are stored and run. This keeps everything isolated and only asks for webcam permission once (vs on every domain): `/src/background/handsfree.js`
- The background page also uses the "Picture in Picture" API to "pop the webcam" out of the browser. It renders the webcam feed and debug canvases into a single canvas, and uses that as the `srcObject` to a separate video element which is the PiP'ed

## How to install

### Google Chrome

Install as an unpacked chrome extension.

1. Visit `chrome://extensions`
2. Enable <kbd>Developer Mode</kbd> on the top right
3. Then click <kbd>Load unpacked</kbd> and select this project's root folder

![](https://i.imgur.com/jXmhYnb.png)

## Handsfree Browsing

By default, each page will get a "Face Pointer" or a set of "Palm Pointers" for you to browse pages handsfree.

![A person controlling a virtual mouse pointer by tilting their head around](https://media3.giphy.com/media/Iv2aSMS0QTy2P5JNCX/giphy.gif)
![A person scrolling a page by pinching their index and thumb together and raising or lowering their pinched hand](https://media3.giphy.com/media/BSkodGjuwBPAEwxjGv/giphy.gif)

However, in addition to the pointers you can add custom handsfree interactions. For example, here's a demonstration of handsfree-ifying different things:

![Creating generative art with hand gestures](https://media4.giphy.com/media/YB5GHxDKDFti74Jzz9/giphy.gif)
![A person pinching the air to "pinch" a blob. Moving a pinched blob causes it to sing in a different pitch](https://media1.giphy.com/media/k1JWC1insGrfX1CSNu/giphy.gif)

<br>
<br>
<br>
<hr>
<br>
<br>
<br>

<div align="center">
  <h2>Explore the interactive docs at: <a href="https://handsfree.js.org">Handsfree.js.org</a></h2>
  <p>Or try it right away with the serverless boilerplates in <code>/boilerplate/</code>!</p>
</div>

<br>
<br>
<br>
<hr>
<br>
<br>
<br>

# License & Attributions

## License: Apache 2.0

The Handsfree.js core is available for free and commercial use under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0.html). Each of the models are also available for free and commercial use under Apache 2.0:

- [Jeeliz Weboji](https://github.com/jeeliz/jeelizWeboji) (Apache 2.0)
- [MediaPipe Models](https://google.github.io/mediapipe/solutions/solutions) (Apache 2.0)
- [TensorFlow.js Models](https://github.com/tensorflow/tfjs-models) (Apache 2.0)

## Attributions
I'd like to also thank the following people and projects:
- [98.css by @jdan](https://github.com/jdan/98.css) (MIT) - Used as boilerplate for documentation theme
- [handpose-facemesh-demos by [@LingDong-]](https://github.com/LingDong-/handpose-facemesh-demos) - Used as a boilerplate for the Handpose Three.js setup

<br>
<br>
<br>

---

<br>
<br>
<br>

# Special Thanks

- [@Golan](https://twitter.com/golan) and the [The STUDIO for Creative Inquiry](http://studioforcreativeinquiry.org/) for hosting me for a residency during 2019 and for helping me approach projects in a more expressive way. Also for inviting me back for a multi-month residency in Spring 2021!
- [@AnilDash](https://twitter.com/anildash) for supporting the project during Winter 2018 out of the blue and the opportunities to share my project on [Glitch.com](https://glitch.com/@ozramos)
- [The School of AI](https://twitter.com/SchoolOfAIOffic) for the [2018 Fellowship](https://www.youtube.com/watch?v=CJDpF4xUieY&t=58) in support of this project
- [@jessscon](https://twitter.com/jessscon) and [Google PAIR](https://research.google/teams/brain/pair/) for the very early support that made starting this project possible
- Everyone who's previously supported the project through GitHub Sponsors, Patreon, GoFundMe, and through [Twitter](https://twitter.com/midiblocks) and everywhere else over the years
