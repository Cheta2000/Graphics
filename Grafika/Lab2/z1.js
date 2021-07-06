// kod vertex shadera
// atrybut wierzcholki
// atrybut kolory w wierzcholkach
// uniform przesuniecie
// varying przekazanie kolorow do fragment shadera

var vertexShaderCode = [
    "precision mediump float;",
    "attribute vec2 vertexPosition;",
    "attribute vec3 vertexColor;",
    "uniform vec3 vertexTranslation;",
    "varying vec3 extraColor;",
    "void main(){",
    "gl_PointSize=10.0;",
    "extraColor=vertexColor;",
    "gl_Position=vec4(vertexPosition,0.0,1.0)+vec4(vertexTranslation,0.0);",
    "}"
].join("\n");

// kod fragment shadera
// uniform kolor
// varying kolory
// kolor to suma kolorow(zrobione tak, do opcji extra)
var fragmentShaderCode = [
    "precision mediump float;",
    "uniform vec3 fragmentColor;",
    "varying vec3 extraColor;",
    "void main(){",
    "gl_FragColor=vec4(fragmentColor,0.0)+vec4(extraColor,0.0)+vec4(0.0,0.0,0.0,1.0);",
    "}"
].join("\n");

var canvas = document.getElementById("myCanvas");
var gl = canvas.getContext("webgl");

gl.enable(gl.DEPTH_TEST);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.lineWidth(10);

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
var program = gl.createProgram();
// podlaczamy shadery
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
// ustawiamy atrybuty,... na konretne pozycje
gl.bindAttribLocation(program, 2, "vertexPosition");
gl.bindAttribLocation(program, 1, "vertexTranslation");
gl.bindAttribLocation(program, 0, "fragmentColor");
gl.bindAttribLocation(program, 3, "extraColor");
// linkujemy program
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR linking program!", gl.getProgramInfoLog(program));
}
gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
}

// wyciagamy z kodu vertex shadera atrybuty i uniformy
var positionAttribLocation = gl.getAttribLocation(program, "vertexPosition");
var translation = gl.getUniformLocation(program, "vertexTranslation");
var color = gl.getUniformLocation(program, "fragmentColor");
var extraColor = gl.getAttribLocation(program, "vertexColor");

// wspolrzedne translacji
var translationCoords = [-0.5, -0.5, 0.5];

gl.useProgram(program);

// ustawiamy zmienna uniform
gl.uniform3fv(translation, translationCoords);


// tworzymy bufor
var vertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
// pointer wierzcholkow(kolejno: zrodlo, ile punktow sklada sie na calosc,typ danych,...,rozmiar wierzcholka w bajtach, odstep od wierzcholka)
gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
// uruchomienie atrybutu
gl.enableVertexAttribArray(positionAttribLocation);
// do opcji extra z kolorami
gl.vertexAttribPointer(extraColor, 3, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);


document.getElementById("points").onclick = function() {
    setVertex();
    setColor();
    gl.disableVertexAttribArray(extraColor);
    // rysyjemy
    gl.drawArrays(gl.POINTS, 0, 6);
};

document.getElementById("line_strip").onclick = function() {
    setVertex();
    setColor();
    gl.disableVertexAttribArray(extraColor);
    gl.drawArrays(gl.LINE_STRIP, 0, 6);
};
document.getElementById("line_loop").onclick = function() {
    setVertex();
    setColor();
    gl.disableVertexAttribArray(extraColor);
    gl.drawArrays(gl.LINE_LOOP, 0, 6);
};
document.getElementById("lines").onclick = function() {
    setVertex();
    setColor();
    gl.disableVertexAttribArray(extraColor);
    gl.drawArrays(gl.LINES, 0, 6);
};
document.getElementById("triangle_strip").onclick = function() {
    setVertex();
    setColor();
    gl.disableVertexAttribArray(extraColor);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
};
document.getElementById("triangle_fan").onclick = function() {
    setVertex();
    setColor();
    gl.disableVertexAttribArray(extraColor);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);
};

document.getElementById("triangles").onclick = function() {
    setVertex();
    setColor();
    gl.disableVertexAttribArray(extraColor);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

};

document.getElementById("extra").onclick = function() {
    setExtra();
    gl.enableVertexAttribArray(extraColor);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
};

// wypisywanie aktywnych atrybutow i uniformow
const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
for (let i = 0; i < numAttribs; ++i) {
    const info = gl.getActiveAttrib(program, i);
    console.log("name:", info.name, "type:", info.type, "size:", info.size);
}

const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
for (let i = 0; i < numUniforms; ++i) {
    const info = gl.getActiveUniform(program, i);
    console.log("name:", info.name, "type:", info.type, "size:", info.size);
}

function setVertex() {
    // ustawiamy losowe wierzcholki
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random() * 2 - 0.5
    ]), gl.STATIC_DRAW);

}

function setColor() {
    // ustawiamy losowy kolor
    gl.uniform3f(color,
        Math.random(), Math.random(), Math.random());
}

function setExtra() {
    // ustawiamy losowe wierzcholki i ich losowe kolory
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random(), Math.random(), Math.random(), Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random(), Math.random(), Math.random(), Math.random() * 2 - 0.5, Math.random() * 2 - 0.5, Math.random(), Math.random(), Math.random()
    ]), gl.STATIC_DRAW);
    gl.uniform3f(color,
        0, 0, 0);
}