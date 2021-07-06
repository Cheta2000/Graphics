// kod vertex shadera
// atrubuty wierzcholki ksztaltu oraz tekstury
// varying miejsce tesktury
var vertexShaderCode = [
    "precision mediump float;",
    "attribute vec3 vertexPosition;",
    "attribute vec2 vertTextCoords;",
    "varying vec2 textureCoordinates;",
    "uniform vec3 vertexTransform;",
    "void main(){",
    "gl_PointSize=16.0;",
    "textureCoordinates=vertTextCoords;",
    "gl_Position=vec4(vertexPosition,1.0)+vec4(vertexTransform,0.0);",
    "}"
].join("\n");

// kod fragment shadera
var fragmentShaderCode = [
    "precision mediump float;",
    "uniform sampler2D texture;",
    "varying vec2 textureCoordinates;",
    "void main(){",
    "gl_FragColor=texture2D(texture,textureCoordinates);",
    "}"
].join("\n");


var canvas = document.getElementById("myCanvas");
var gl = canvas.getContext("webgl");
var result = document.getElementById("score");
var data = [];
var animation = {};
var objectLine1;
var objectLine2;
var objectMove;
var positionAttribLocation;
var textureAttribLocation;
var sampler;
// bufor dla tekstury
var textureBuffer;
var transform;
var program;


onload = function() {
    onkeydown = keyDownCallback;
    boardInit();
    glInit();
    textureInit();
    drawObjects();
}



function textureInit() {
    // tesktura ma takie wierzcholki
    var textVert = [
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ];
    // tworzymy bufor tekstury
    textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textVert), gl.STATIC_DRAW);
}

function createTexture(url) {
    // tworzymy teksture
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // wksazujemy jej parametry
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // podlaczamy obrazek
    var img = new Image();
    img.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }
    img.src = url;
    return texture;

}


// zamiast dwoch trojkatow to tworzenia prostokata, korzystam teraz z triangle fan zeby tesktura dzialala
// to samo zamiast punktu
function boardInit() {
    object1 = {};
    object1.vertices = [-1.0, 1.0, 0.7, -1.0, -1.0, 0.7, -0.5, -1.0, 0.7, -0.5, 1.0, 0.7];
    object1.bufferId = gl.createBuffer();
    // tworzymy tesktury z odpowiednim obrazkiem
    object1.texture = createTexture("water.png");
    object1.transform = [0, 0, 0];
    object1.drawMode = gl.TRIANGLE_FAN;
    gl.bindBuffer(gl.ARRAY_BUFFER, object1.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object1.vertices), gl.STATIC_DRAW);
    data.push(object1);
    object2 = {};
    object2.vertices = [-0.5, 1.0, 0.7, -0.5, -1.0, 0.7, 0.5, -1.0, 0.7, 0.5, 1.0, 0.7];
    object2.bufferId = gl.createBuffer();
    object2.texture = createTexture("grass.png");
    object2.transform = [0, 0, 0];
    object2.drawMode = gl.TRIANGLE_FAN;
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
    object4.transform = [0, 0, 0];
    object4.drawMode = gl.LINES;
    gl.bindBuffer(gl.ARRAY_BUFFER, object4.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object4.vertices), gl.STATIC_DRAW);
    data.push(object4);

    object5 = {};
    object5.vertices = [-1.0, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0, -1.0, 0.5, -1.0, -1.0, 0.5, -1.0, 1.0, 0.5];
    object5.bufferId = gl.createBuffer();
    object5.transform = [0, 0, 0];
    object5.drawMode = gl.LINE_STRIP;
    gl.bindBuffer(gl.ARRAY_BUFFER, object5.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object5.vertices), gl.STATIC_DRAW);
    data.push(object5);

    objectLine1 = {};
    objectLine1.vertices = [-0.9, -0.1, 0.0, -0.9, 0.1, 0.0]
    objectLine1.bufferId = gl.createBuffer();
    objectLine1.texture = createTexture("orange.jpg");
    objectLine1.transform = [0, 0, 0];
    objectLine1.drawMode = gl.LINES;
    gl.bindBuffer(gl.ARRAY_BUFFER, objectLine1.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectLine1.vertices), gl.STATIC_DRAW);
    data.push(objectLine1);

    objectLine2 = {...objectLine1 };
    objectLine2.transform = [1.8, 0, 0];
    objectLine2.texture = createTexture("magenta.jpg");
    gl.bindBuffer(gl.ARRAY_BUFFER, objectLine2.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectLine2.vertices), gl.STATIC_DRAW);
    data.push(objectLine2);


    objectMove = {};
    objectMove.speed = 0.0005;
    if (Math.random() >= 0.5) {
        objectMove.direction = [1, 0, 0];
    } else {
        objectMove.direction = [-1, 0, 0];
    }
    objectMove.vertices = [-0.025, 0.025, 0.0, -0.025, -0.025, 0.0, 0.025, -0.025, 0.0, 0.025, 0.025, 0.0];
    objectMove.bufferId = gl.createBuffer();
    objectMove.texture = createTexture("wood.jpg");
    objectMove.transform = [0, 0, 0];
    objectMove.color = [1.0, 0.0, 0.0];
    objectMove.drawMode = gl.TRIANGLE_FAN;
    gl.bindBuffer(gl.ARRAY_BUFFER, objectMove.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectMove.vertices), gl.STATIC_DRAW);
    data.push(objectMove);


    animation.requestId = 0;
}

function glInit() {

    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // tworzymy shadery
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // laczymy shadery z kodami i kompilujemy
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

    // tworzymy program
    program = gl.createProgram();
    // podlaczamy shadery
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // linkujemy program
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERROR linking program!", gl.getProgramInfoLog(program));
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error("ERROR validating program!", gl.getProgramInfoLog(program));
    }

    // wyciagamy z kodu vertex shadera atrybuty
    positionAttribLocation = gl.getAttribLocation(program, "vertexPosition");
    textureAttribLocation = gl.getAttribLocation(program, "vertTextCoords");
    transform = gl.getUniformLocation(program, "vertexTransform");
    sampler = gl.getUniformLocation(program, "texture");
}


var drawObjects = function() {
    gl.useProgram(program);
    gl.lineWidth(10);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(textureAttribLocation);


    for (let i = 0; i < data.length; i++) {
        obj = data[i];

        // aktywujemy teskture aby jej uzyc
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(sampler, 0);
        gl.bindTexture(gl.TEXTURE_2D, obj.texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferId);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0, 0);

        // korzystamy z bufora tekstury
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.vertexAttribPointer(textureAttribLocation, 2, gl.FLOAT, 2 * Float32Array.BYTES_PER_ELEMENT, 0, 0);

        gl.uniform3fv(transform, obj.transform);
        gl.drawArrays(obj.drawMode, 0, obj.vertices.length / 3);
    }
}

function randomDirection() {
    var y = Math.random() * 1.6 - 0.8;
    var x = Math.sqrt(1 - y ** 2);
    if (objectMove.direction[0] > 0) {
        x = -x;
    }
    objectMove.direction[0] = x;
    objectMove.direction[1] = y;
}

function checkCollision() {
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

function checkWalls() {
    if (objectMove.transform[1] >= 0.97 || objectMove.transform[1] <= -0.97) {
        return true;
    }
    return false;
}

function score() {
    result.innerHTML = left + ":" + right;
}

var animate = function(time) {
    var timeDelta = time - animation.lastTime;
    animation.lastTime = time;
    if (checkCollision()) {
        randomDirection();
    }
    if (checkWalls()) {
        objectMove.direction[1] = -objectMove.direction[1];
    }
    var x = objectMove.transform[0] + objectMove.direction[0] * objectMove.speed * timeDelta;
    var y = objectMove.transform[1] + objectMove.direction[1] * objectMove.speed * timeDelta;
    if (x >= 1.0 || x <= -1.0) {
        objectMove.transform = [0.0, 0.0, 0.0];
        objectLine1.transform = [0.0, 0.0, 0.0];
        objectLine2.transform = [1.8, 0.0, 0.0];
        if (x >= 1.0) {
            objectMove.direction = [1.0, 0.0, 0.0];
            left++;
        } else {
            objectMove.direction = [-1.0, 0.0, 0.0];
            right++;
        }
        score();
    } else {
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