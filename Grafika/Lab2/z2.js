// kod vertex shadera
var vertexShaderCode = [
    "precision mediump float;",
    "attribute vec3 vertexPosition;",
    "uniform vec3 vertexTransform;",
    "void main(){",
    "gl_Position=vec4(vertexPosition,1.0)+vec4(vertexTransform,0.0);",
    "}"
].join("\n");

// kod fragment shadera
var fragmentShaderCode = [
    "precision mediump float;",
    "uniform vec3 fragmentColor;",
    "void main(){",
    "gl_FragColor=vec4(fragmentColor,1.0);",
    "}"
].join("\n");

var canvas = document.getElementById("myCanvas");
var gl = canvas.getContext("webgl");
var sierpButton = document.getElementById("sierp");
var kochButton = document.getElementById("koch");
var input = document.getElementById("level");
// obiekt reprezentujacy aktualna pozycje
var position = {};
// kat
var round = 0;
// wierzcholki do rysowania
var vertices = [];
// stworzone ksztalty
var data = [];

gl.enable(gl.DEPTH_TEST);
gl.viewport(0, 0, canvas.width, canvas.height);

onload = function() {
    onkeydown = keyDownCallback;
}

// do generowania wierzcholkow korzystamy z zadania 3 z poprzedniej listy
function forward(distance) {
    position.x += distance * Math.cos(round);
    position.y += distance * Math.sin(round);
    vertices.push(position.x);
    vertices.push(position.y);
    vertices.push(position.z);
}

function left(angle) {
    round += angle * Math.PI / 180;
}

function right(angle) {
    round -= angle * Math.PI / 180;
}


var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vertexShaderCode);
gl.shaderSource(fragmentShader, fragmentShaderCode);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
}
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("ERROR compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
}


var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR linking program!", gl.getProgramInfoLog(program));
}
gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
}

var positionAttribLocation = gl.getAttribLocation(program, "vertexPosition");
var color = gl.getUniformLocation(program, "fragmentColor");
var transform = gl.getUniformLocation(program, "vertexTransform");

// tworzenie ksztaltu
function createObject(vertices) {
    object = {};
    // wierzcholki ksztaltu
    object.vertices = vertices;
    // kazdy ksztalt musi miec swoj bufor
    object.bufferId = gl.createBuffer();
    // kolor ksztaltu
    object.color = [Math.random(), Math.random(), Math.random()];
    // przesuniecie ksztaltu
    object.transform = [0, 0, 0];
    // bind bufora i ustawianie jego danych
    gl.bindBuffer(gl.ARRAY_BUFFER, object.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    data.push(object)
}

var drawObjects = function() {
    gl.useProgram(program);
    gl.lineWidth(3);
    gl.enableVertexAttribArray(positionAttribLocation);
    // petla po wsztskich ksztaltach
    for (let i = 0; i < data.length; i++) {
        obj = data[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferId);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0, 0);
        gl.uniform3fv(color, obj.color);
        gl.uniform3fv(transform, obj.transform);
        gl.drawArrays(gl.LINE_STRIP, 0, obj.vertices.length / 3);
    }
}

//rysujemy kocha i sierpinskiego w losowym miejscu i kolorze

function drawKoch(level) {
    position.x = Math.random() * 1.5 - 1;
    position.y = Math.random() * 1.5 - 0.5;
    position.z = Math.random() * 2 - 1;
    vertices = [position.x, position.y, position.z];
    kochFlake(level, 0.5);
    createObject(vertices);
    drawObjects();
}


function drawSierp(level) {
    position.x = Math.random() * 1.5 - 1;
    position.y = Math.random() * 1.5 - 1;
    position.z = Math.random() * 2 - 1;
    vertices = [position.x, position.y, position.z];
    sierp(level, 0.5);
    createObject(vertices);
    drawObjects();
}

function kochLine(level, size) {
    if (level == 1) {
        forward(size);
    } else {
        kochLine(level - 1, size / 3);
        left(60);
        kochLine(level - 1, size / 3);
        right(120);
        kochLine(level - 1, size / 3);
        left(60);
        kochLine(level - 1, size / 3);
    }
}

function kochFlake(level, size) {
    kochLine(level, size);
    right(120);
    kochLine(level, size);
    right(120);
    kochLine(level, size);
    right(120);
}

function triangle(size) {
    for (i = 0; i < 3; i++) {
        forward(size);
        left(120);
    }
}

function sierp(level, size) {
    if (level == 1) {
        triangle(size);
    } else {
        sierp(level - 1, size / 2);
        forward(size / 2);
        sierp(level - 1, size / 2);
        forward(-size / 2);
        left(60);
        forward(size / 2);
        right(60);
        sierp(level - 1, size / 2);
        left(60);
        forward(-size / 2);
        right(60);
    }
}


// poruszanie odbywa sie na zasadzie uniforma transformacji

function moveLeft() {
    obj = data[data.length - 1];
    obj.transform[0] -= 0.05;
    drawObjects();
}


function moveRight() {
    obj = data[data.length - 1];
    obj.transform[0] += 0.05;
    drawObjects();
}


function moveUp() {
    obj = data[data.length - 1];
    obj.transform[1] += 0.05;
    drawObjects();
}

function moveDown() {
    obj = data[data.length - 1];
    obj.transform[1] -= 0.05;
    drawObjects();
}

function moveDeep() {
    obj = data[data.length - 1];
    obj.transform[2] -= 0.02;
    drawObjects();
}

function moveClose() {
    obj = data[data.length - 1];
    obj.transform[2] += 0.02;
    drawObjects();
}


var keyDownCallback = function(e) {
    e.preventDefault();
    var code = e.which || e.keyCode;
    switch (code) {
        case 13:
            var level = input.value;
            if (level < 0) {
                alert("Invalid value");
            } else {
                if (sierpButton.checked) {
                    drawSierp(level);
                } else {
                    drawKoch(level);
                }
            }
            break;
        case 37:
            moveLeft();
            break;
        case 38:
            moveUp();
            break;
        case 39:
            moveRight();
            break;
        case 40:
            moveDown();
            break;
        case 83:
            moveClose();
            break;
        case 87:
            moveDeep();
            break;
    };
}