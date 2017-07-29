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
  console.log(gp);
  gameLoop();
});


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

function gameLoop() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  if (!gamepads)
    return;
  var gp = gamepads[0];

  for (var b = 0; b < gp.buttons.length; b++) {
    if (gp.buttons[b].pressed) {
      console.log('Pressed ', button[b]);
      if (b <=3) {
        paint = colors[b];
      }
    }
  }

  if (!flags.saving) {
    if (gp.buttons[6].pressed) {
      flags.saving = true;

      postSound.play();
      ctx.canvas.toBlob((blob) => {
        let formdata = new FormData();
        formdata.append("pic", blob);
        fetch('/file-upload', {
          method: 'POST',
          body: formdata
        })
      }, 'image/png');
    }
  } else {
    if (!gp.buttons[6].pressed) {
      flags.saving = false;
    }
  }

  if (!flags.clearing) {
    if (gp.buttons[7].pressed) {
      flags.clearing = true;
      clear();
      startSound.play();
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
    console.log('right');
    pointer.x += pointer.v * 1;
    pointer.w -= pointer.v * 0.5;
  } else if (gp.axes[0] < -0.5) {
    console.log('left');
    pointer.x -= pointer.v * 1;
    pointer.w += pointer.v * 0.5;
  }

  if (gp.axes[1] > 0.5) {
    console.log('up');
    pointer.y += pointer.v * 1;
    pointer.h -= pointer.v * 0.5;
  } else if (gp.axes[1] < -0.5) {
    console.log('down');
    pointer.y -= pointer.v * 1;
    pointer.h += pointer.v * 0.5;
  }

  start = rAF(gameLoop);
};

var song, startSound, postSound, analyzer;

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
  noLoop();
}

function draw() {
  c = color(`rgba(${paint[0]}, ${paint[1]}, ${paint[2]}, .2)`);
  c2 = color(`rgba(${paint[0] - 30}, ${paint[1] - 30}, ${paint[2] - 30}, 1)`);
  fill(c);
  stroke(c2);

  var rms = analyzer.getLevel();

  rect(pointer.x, pointer.y, pointer.w + rms * 100, pointer.h + rms * 100);
}
