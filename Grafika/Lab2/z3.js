// kod vertex shadera
var vertexShaderCode = [
    "precision mediump float;",
    "attribute vec3 vertexPosition;",
    "uniform vec3 vertexTransform;",
    "void main(){",
    "gl_PointSize=16.0;",
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
var result = document.getElementById("score");
// punkty
var left = 0;
var right = 0;
// wszytskie ksztalty
var data = [];
var animation = {};
// linie i pilka- obiekty ruchome
var objectLine1 = {};
var objectLine2 = {};
var objectMove = {};
var positionAttribLocation;
var color;
var transform;
var program;

onload = function() {
    onkeydown = keyDownCallback;
    boardInit();
    glInit();
    drawObjects();
}

// tworzenie planszy
function boardInit() {
    object1 = {};
    // wierzcholki ksztaltu
    object1.vertices = [-1.0, 1.0, 0.7, -1.0, -1.0, 0.7, -0.5, -1.0, 0.7, -0.5, -1.0, 0.7, -0.5, 1.0, 0.7, -1.0, 1.0, 0.7];
    // wlasny bufor ksztaltu
    object1.bufferId = gl.createBuffer();
    // kolor
    object1.color = [0, 0, 0.5];
    // transformacja
    object1.transform = [0, 0, 0];
    // jakie ksztalty rysujemy dla tego obiektu
    object1.drawMode = gl.TRIANGLES;
    gl.bindBuffer(gl.ARRAY_BUFFER, object1.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object1.vertices), gl.STATIC_DRAW);
    data.push(object1);
    object2 = {};
    object2.vertices = [-0.5, 1.0, 0.7, -0.5, -1.0, 0.7, 0.5, -1.0, 0.7, 0.5, -1.0, 0.7, 0.5, 1.0, 0.7, -0.5, 1.0, 0.7];
    object2.bufferId = gl.createBuffer();
    object2.color = [0, 0.6, 0];
    object2.transform = [0, 0, 0];
    object2.drawMode = gl.TRIANGLES;
    gl.bindBuffer(gl.ARRAY_BUFFER, object2.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object2.vertices), gl.STATIC_DRAW);
    data.push(object2);
    object3 = {...object1 };
    object3.transform = [1.5, 0, 0];
    gl.bindBuffer(gl.ARRAY_BUFFER, object3.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object3.vertices), gl.STATIC_DRAW);
    data.push(object3);
    object4 = {};
    object4.vertices = [0.0, -1.0, 0.5, 0.0, 1.0, 0.7];
    object4.bufferId = gl.createBuffer();
    object4.color = [1.0, 1.0, 1.0];
    object4.transform = [0, 0, 0];
    object4.drawMode = gl.LINES;
    gl.bindBuffer(gl.ARRAY_BUFFER, object4.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object4.vertices), gl.STATIC_DRAW);
    data.push(object4);
    object5 = {};
    object5.vertices = [-1.0, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0, -1.0, 0.5, -1.0, -1.0, 0.5, -1.0, 1.0, 0.5];
    object5.bufferId = gl.createBuffer();
    object5.color = [1.0, 1.0, 0.0];
    object5.transform = [0, 0, 0];
    object5.drawMode = gl.LINE_STRIP;
    gl.bindBuffer(gl.ARRAY_BUFFER, object5.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object5.vertices), gl.STATIC_DRAW);
    data.push(object5);

    objectMove = {};
    // predkosc
    objectMove.speed = 0.0005;
    // losujemy poczatkowy kierunek(lewo,prawo)
    if (Math.random() >= 0.5) {
        objectMove.direction = [1, 0, 0];
    } else {
        objectMove.direction = [-1, 0, 0];
    }
    objectMove.vertices = [0.0, 0.0, 0.0]
    objectMove.bufferId = gl.createBuffer();
    objectMove.transform = [0, 0, 0];
    objectMove.color = [0.0, 0.0, 0.0];
    objectMove.drawMode = gl.POINTS;
    gl.bindBuffer(gl.ARRAY_BUFFER, objectMove.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectMove.vertices), gl.STATIC_DRAW);
    data.push(objectMove);

    objectLine1 = {};
    objectLine1.vertices = [-0.9, -0.1, 0.0, -0.9, 0.1, 0.0]
    objectLine1.bufferId = gl.createBuffer();
    objectLine1.color = [1.0, 0.0, 0];
    objectLine1.transform = [0, 0, 0];
    objectLine1.drawMode = gl.LINES;
    gl.bindBuffer(gl.ARRAY_BUFFER, objectLine1.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectLine1.vertices), gl.STATIC_DRAW);
    data.push(objectLine1);

    objectLine2 = {...objectLine1 };
    objectLine2.transform = [1.8, 0, 0];
    gl.bindBuffer(gl.ARRAY_BUFFER, objectLine2.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectLine2.vertices), gl.STATIC_DRAW);
    data.push(objectLine2);

    animation.requestId = 0;
}

function glInit() {

    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);

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

    program = gl.createProgram();
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

    positionAttribLocation = gl.getAttribLocation(program, "vertexPosition");
    color = gl.getUniformLocation(program, "fragmentColor");
    transform = gl.getUniformLocation(program, "vertexTransform");
}


var drawObjects = function() {
    gl.useProgram(program);
    gl.lineWidth(5);
    gl.enableVertexAttribArray(positionAttribLocation);
    for (let i = 0; i < data.length; i++) {
        obj = data[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferId);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0, 0);
        gl.uniform3fv(color, obj.color);
        gl.uniform3fv(transform, obj.transform);
        gl.drawArrays(obj.drawMode, 0, obj.vertices.length / 3);
    }
}


// przy obronie losujemy z pewnego zakresu jak odbije sie pilka
function randomDirection() {
    var y = Math.random() * 1.6 - 0.8;
    var x = Math.sqrt(1 - y ** 2);
    if (objectMove.direction[0] > 0) {
        x = -x;
    }
    objectMove.direction[0] = x;
    objectMove.direction[1] = y;
}


// sprawdzenie kolizji
function checkCollision() {
    // jesli pilka jest na x linie broniacej i jest miedzy jej wierzcholkami to jest obrona
    if (objectMove.transform[0] >= 0.87 && objectMove.transform[0] <= 0.88 && objectMove.direction[0] > 0) {
        if (objectMove.transform[1] <= objectLine2.vertices[4] + objectLine2.transform[1] && objectMove.transform[1] >= objectLine2.vertices[1] + objectLine2.transform[1]) {
            return true;
        }
    }
    if (objectMove.transform[0] <= -0.87 && objectMove.transform[0] >= -0.88 && objectMove.direction[0] < 0) {
        if (objectMove.transform[1] <= objectLine1.vertices[4] + objectLine1.transform[1] && objectMove.transform[1] >= objectLine1.vertices[1] + objectLine1.transform[1]) {
            return true;
        }
    }

    return false;

}

// kolizja ze sciana
function checkWalls() {
    if (objectMove.transform[1] >= 0.97 || objectMove.transform[1] <= -0.97) {
        return true;
    }
    return false;
}

function score() {
    result.innerHTML = left + ":" + right;
}

// animacja
var animate = function(time) {
    var timeDelta = time - animation.lastTime;
    animation.lastTime = time;
    // jesli byla kolizja, losujemy odbicie pilki
    if (checkCollision()) {
        randomDirection();
    }
    // jesli byla sciana, to pilka zmienia kierunek
    if (checkWalls()) {
        objectMove.direction[1] = -objectMove.direction[1];
    }
    // nowe wspolrzedne pilki
    var x = objectMove.transform[0] + objectMove.direction[0] * objectMove.speed * timeDelta;
    var y = objectMove.transform[1] + objectMove.direction[1] * objectMove.speed * timeDelta;
    // jesli padl gol
    if (x >= 1.0 || x <= -1.0) {
        // pilka wraca na srode, linie na swoje pozycje
        objectMove.transform = [0.0, 0.0, 0.0];
        objectLine1.transform = [0.0, 0.0, 0.0];
        objectLine2.transform = [1.8, 0.0, 0.0];
        // pilka leci do tego kto stracil gola
        if (x >= 1.0) {
            objectMove.direction = [1.0, 0.0, 0.0];
            left++;
        } else {
            objectMove.direction = [-1.0, 0.0, 0.0];
            right++;
        }
        score();
    }
    // jesli nie bylo gola ani zadnej kolizji, zmieniamy wspolrzedne pilki
    else {
        objectMove.transform[0] = x;
        objectMove.transform[1] = y;
    }

    drawObjects();

    animation.requestId = window.requestAnimationFrame(animate);
}

var animationStart = function() {
    animation.lastTime = window.performance.now();
    animation.requestId = window.requestAnimationFrame(animate);
}

var animationStop = function() {
    if (animation.requestId) {
        window.cancelAnimationFrame(animation.requestId);
    }
    animation.requestId = 0;
    objectMove.transform = [0.0, 0.0, 0.0];
    if (Math.random() >= 0.5) {
        objectMove.direction = [1, 0, 0];
    } else {
        objectMove.direction = [-1, 0, 0];
    }
    objectLine1.transform = [0.0, 0.0, 0.0];
    objectLine2.transform = [1.8, 0.0, 0.0];
    drawObjects();
}

// poruszanie podobne jak w zad 2
function moveUpR() {
    if (objectLine2.transform[1] >= 0.9) {
        return;
    }
    objectLine2.transform[1] += 0.02;
    drawObjects();
}

function moveDownR() {
    if (objectLine2.transform[1] <= -0.9) {
        return;
    }
    objectLine2.transform[1] -= 0.02;
    drawObjects();
}

function moveUpL() {
    if (objectLine1.transform[1] >= 0.9) {
        return;
    }
    objectLine1.transform[1] += 0.02;
    drawObjects();
}

function moveDownL() {
    if (objectLine1.transform[1] <= -0.9) {
        return;
    }
    objectLine1.transform[1] -= 0.02;
    drawObjects();
}

function restart() {
    left = 0;
    right = 0;
    if (animation.requestId == 0) {
        animationStart();
    } else {
        animationStop();
    }
    score();
}

var keyDownCallback = function(e) {
    e.preventDefault();
    var code = e.which || e.keyCode;
    switch (code) {
        case 32:
            restart();
            break;
        case 38:
            moveUpR();
            break;
        case 40:
            moveDownR();
            break;
        case 83:
            moveDownL();
            break;
        case 87:
            moveUpL();
            break;
    };
}