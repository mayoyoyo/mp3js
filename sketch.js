var song;
var fft;
var button;
var w;

function preload() {
    song = loadSound('img/song.mp3');
}

function playButton() {
    if (song.isPlaying()) {
        song.pause();
    } else {
        song.play();
    }
}

function setup() {
    createCanvas(512, 512);
    colorMode(HSL);
    angleMode(DEGREES);
    button = createButton('play/pause');
    button.mousePressed(playButton);
    song.play();
    fft = new p5.FFT(0.8, 64);
    w = width / 64;
}

function draw() {
    background(0);
    var spectrum = fft.analyze();

    noStroke();
    for (var i = 0; i < spectrum.length; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, height, 0);
        fill(i * 240 / spectrum.length, 100, 50);
        rect(i * w, y, w - 4, height - y);
    }
    stroke(255);

}