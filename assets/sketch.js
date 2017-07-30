// setup
var button = {
  0: 'red',
  1: 'yellow',
  2: 'blue',
  3: 'green',
  4: 'l1',
  5: 'r1',
  6: 'select',
  7: 'start'
}

let ctx;

var colors = {
  0: [255, 148, 164],
  1: [255, 237, 148],
  2: [148, 235, 255],
  3: [176, 255, 148]
}

var paintArea = {
  w: 600,
  h: 400
}

var paint = colors[Math.ceil(Math.random() * 4) -1];

var flags = {
  saving: false,
  clearing: false
}

var pointer = {
  w: 40,
  h: 40,
  x: 50,
  y: 50,
  v: 1.5
}
pointer.x = Math.random() * (paintArea.w - pointer.w) + pointer.w
pointer.y = Math.random() * (paintArea.h - pointer.h) + pointer.h;


var notify = function(message, url = '') {
  let note = document.createElement('div');
  note.innerHTML = message;
  note.classList.add('note');
  if (url !== '') {
    let link = document.createElement('a');
    link.setAttribute('href', url);
    link.innerHTML = 'Click to view Image'
    note.appendChild(link);
  }
  document.body.appendChild(note);
  setTimeout(() => { note.remove() }, 4000);
}

var clearCanvas = function () {
  flags.clearing = true;
  clear();
  notify('Background cleared!');
  startSound.play();
};

var publishImage = function () {
  flags.saving = true;
  let url = document.querySelector('#dom-url').getAttribute('href');
  notify('Image published!', url);
  postSound.play();
  ctx.canvas.toBlob((blob) => {
    let formdata = new FormData();
    formdata.append("pic", blob);
    fetch('/file-upload', {
      method: 'POST',
      body: formdata
    });
  }, 'image/png');
};


// fallback for when no gamepad is connected
window.addEventListener('keyup', (e) => {
  let key = e.key;
  if (key === '1' || key === '2' || key === '3' || key === '4') {
    let index = parseInt(key) - 1;
    paint = colors[index];
  }

  if (key === " " && !document.getElementById('intro-modal')) {
    clearCanvas();
  } else if (key === " " && document.getElementById('intro-modal')) {
    document.getElementById('intro-modal').remove();
  }
  if (key === "Enter" && !document.getElementById('intro-modal')) {
    publishImage();
  }
});

window.addEventListener('keydown', (e) => {
  let key = e.key;
  if (key === 'ArrowDown') {
    pointer.y += pointer.v * 2.5;
    pointer.h -= pointer.v * 0.5;
  }
  if (key === 'ArrowUp') {
    pointer.y -= pointer.v * 2.5;
    pointer.h += pointer.v * 0.5;
  }
  if (key === 'ArrowRight') {
    pointer.x += pointer.v * 2.5;
    pointer.w -= pointer.v * 0.5;
  }
  if (key === 'ArrowLeft') {
    pointer.x -= pointer.v * 2.5;
    pointer.w += pointer.v * 0.5;
  }
});

// gamepad setup
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
          window.requestAnimationFrame;

var rAFStop = window.mozCancelRequestAnimationFrame ||
  window.webkitCancelRequestAnimationFrame ||
  window.cancelRequestAnimationFrame;

var start;

window.addEventListener("gamepaddisconnected", function() {
  gamepadInfo.innerHTML = "Waiting for gamepad.";
  rAFStop(start);
});

window.addEventListener("gamepadconnected", function(e) {
  var gp = navigator.getGamepads()[e.gamepad.index];
  console.log("Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
  // console.log(gp);
  gameLoop();
});

function gameLoop() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  if (!gamepads)
    return;
  var gp = gamepads[0];

  for (var b = 0; b < gp.buttons.length; b++) {
    if (gp.buttons[b].pressed) {
      // console.log('Pressed ', button[b]);
      if (b <=3) {
        paint = colors[b];
      }
    }
  }

  if (!flags.saving) {
    if (gp.buttons[6].pressed) {
      publishImage();
    }
  } else {
    if (!gp.buttons[6].pressed) {
      flags.saving = false;
    }
  }

  if (!flags.clearing) {
    if (gp.buttons[7].pressed && !document.getElementById('intro-modal')) {
      clearCanvas();
    } else if (gp.buttons[7].pressed && document.getElementById('intro-modal')) {
      document.getElementById('intro-modal').remove();
    }
  } else {
    if (!gp.buttons[7].pressed) {
      flags.clearing = false;
    }
  }

  if (gp.buttons[6].pressed) {
    flags.saving = true;
  } else {
    flags.saving = false;
  }

  if (gp.axes[0] > 0.5) {
    // console.log('right');
    pointer.x += pointer.v * 1;
    pointer.w -= pointer.v * 0.5;
  } else if (gp.axes[0] < -0.5) {
    //console.log('left');
    pointer.x -= pointer.v * 1;
    pointer.w += pointer.v * 0.5;
  }

  if (gp.axes[1] > 0.5) {
    // console.log('up');
    pointer.y += pointer.v * 1;
    pointer.h -= pointer.v * 0.5;
  } else if (gp.axes[1] < -0.5) {
    // console.log('down');
    pointer.y -= pointer.v * 1;
    pointer.h += pointer.v * 0.5;
  }

  start = rAF(gameLoop);
};


// p5js

let song, startSound, postSound, analyzer, c, c2, rms;

function preload() {
  song = loadSound('bg.wav');
  startSound = loadSound('restart.wav');
  postSound = loadSound('post.wav');
}

function setup() {
  ctx = createCanvas(paintArea.w, paintArea.h);
  ctx.parent('sketch-holder');
  noCursor();
  song.loop();
  analyzer = new p5.Amplitude();
  analyzer.setInput(song);
  //noLoop();
}

function draw() {
  c = color(`rgba(${paint[0]}, ${paint[1]}, ${paint[2]}, .2)`);
  c2 = color(`rgba(${paint[0] - 30}, ${paint[1] - 30}, ${paint[2] - 30}, 1)`);
  fill(c);
  stroke(c2);
  rms = analyzer.getLevel();

  rect(pointer.x, pointer.y, pointer.w + rms * 50, pointer.h + rms * 50);
}
