// klasa wykresu

class Chart {
    // ustawiamy rozmiar wykresu, dokladnosc, jego punkty, color, przesuniecie i rotacje
    constructor(gl, type) {
        this.size = 1000;
        this.space = 50;
        if (type == 1) {
            this.positions = this.generateChart([-5, 5], [-5, 5], (x, y) => Math.sin(x) * Math.cos(y));
            this.color = [1, 0, 0];
        } else {
            this.positions = this.generateChart([-5, 5], [-5, 5], (x, y) => Math.asin(x * y));
            this.color = [0, 1, 0];
        }
        this.positionBuffer = initBuffers(gl, this.positions);
        this.translation = [0, 0, -2000];
        this.rotation = [0, 0, 0];
    }

    // generowanie punktow wykresu w zaleznosci od wybranej funkcji i zakresu
    generateChart(xRange, yRange, func, triangles) {
        var chartPoints = [];
        for (var x = 0; x < this.space; x++) {
            for (var y = 0; y < this.space; y++) {
                var value = func(
                    xRange[0] + x * (xRange[1] - xRange[0]) / this.space,
                    yRange[0] + y * (yRange[1] - yRange[0]) / this.space
                );

                var nextY = null;
                var nextX = null;
                var nextYX = null;
                if (y !== this.space - 1) {
                    nextY = func(
                        xRange[0] + x * (xRange[1] - xRange[0]) / this.space,
                        yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.space
                    );
                }
                if (x !== this.space - 1) {
                    nextX = func(
                        xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.space,
                        yRange[0] + y * (yRange[1] - yRange[0]) / this.space
                    );
                }
                if (x !== this.space - 1 && y !== this.space - 1) {
                    nextYX = func(
                        xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.space,
                        yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.space
                    );
                }

                if (nextX !== null && nextY !== null && nextYX !== null) {
                    // dodajemy odpowiednie punkty
                    chartPoints.push(
                        x * this.size / this.space - this.size / 2,
                        y * this.size / this.space - this.size / 2,
                        value,
                        (x + 1) * this.size / this.space - this.size / 2,
                        y * this.size / this.space - this.size / 2,
                        nextX,
                        x * this.size / this.space - this.size / 2,
                        (y + 1) * this.size / this.space - this.size / 2,
                        nextY,
                        (x + 1) * this.size / this.space - this.size / 2,
                        (y + 1) * this.size / this.space - this.size / 2,
                        nextYX,
                        (x + 1) * this.size / this.space - this.size / 2,
                        y * this.size / this.space - this.size / 2,
                        nextX,
                        x * this.size / this.space - this.size / 2,
                        (y + 1) * this.size / this.space - this.size / 2,
                        nextY
                    );
                }
            }
        }


        // skalowanie
        var scaleFactor = this.size / Math.abs(xRange[1] - xRange[0]);
        chartPoints = chartPoints.map((p, i) => i % 3 === 2 ? p * scaleFactor : p);

        return chartPoints;
    }
}

// piksele
class Pixels {
    constructor(gl) {
        this.gl = gl;
        this.positions = [-1, -1, -1, 1,
            1, 1,
            1, -1
        ];
        this.bufferId = initBuffers(gl, this.positions);
    }
}


// klasa odpowiedzialna za tworzenie programu rysowanie itp
class Draw {
    // pobieramy atrybuty i uniformy z shaderow
    constructor(gl) {
        this.gl = gl;
        // mamy dwa programy do rysowania
        this.program = initShaderProgram(this.gl, vertexShader, fragmentShader);
        this.program2 = initShaderProgram(this.gl, vertexShader, pixFragmentShaderSrc);

        this.uniforms = {
            uMatrix: gl.getUniformLocation(this.program, "uMatrix"),
            aColor: gl.getUniformLocation(this.program, "fragmentColor"),
            uMatrix2: gl.getUniformLocation(this.program2, "uMatrix")
        };
        this.attribs = {
            aPosition: gl.getAttribLocation(this.program, "aPosition"),
            aPosition2: gl.getAttribLocation(this.program2, "aPosition")
        };
        this.chart = new Chart(this.gl, 1);
        this.chart2 = new Chart(this.gl, 2);
        this.pixel = new Pixels(this.gl);
    }


    // tworzymy program i rysyjemy
    drawScene() {
        resizeCanvas(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);



        this.gl.disable(this.gl.BLEND);
        this.gl.useProgram(this.program2);
        this.gl.enableVertexAttribArray(this.attribs.aPosition2);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pixel.bufferId);
        this.gl.vertexAttribPointer(this.attribs.aPosition2, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.uniformMatrix4fv(this.uniforms.uMatrix2, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_COLOR, this.gl.ONE);
        this.gl.blendEquation(this.gl.FUNC_ADD);



        this.gl.useProgram(this.program);


        // rysujemy pierwsza funkcje
        this.gl.enableVertexAttribArray(this.attribs.aPosition);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.chart.positionBuffer);
        this.gl.vertexAttribPointer(this.attribs.aPosition, 3, this.gl.FLOAT, false, 0, 0);
        var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        var fov = Math.PI / 4;
        var matrix = m4.perspective(fov, aspect, 1, 10000);
        matrix = m4.xRotate(matrix, this.chart.rotation[0]);
        matrix = m4.yRotate(matrix, this.chart.rotation[1]);
        matrix = m4.translate(matrix, this.chart.translation[0], this.chart.translation[1], this.chart.translation[2]);
        // podlaczamy macierze i kolory
        this.gl.uniformMatrix4fv(this.uniforms.uMatrix, false, matrix);
        this.gl.uniform3fv(this.uniforms.aColor, this.chart.color);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.chart.positions.length / 3);

        this.gl.blendFunc(this.gl.SRC_COLOR, this.gl.ONE);
        this.gl.blendEquation(this.gl.FUNC_ADD);






        this.gl.useProgram(this.program);
        // rysujemy druga funkcje
        this.gl.enableVertexAttribArray(this.attribs.aPosition);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.chart2.positionBuffer);
        this.gl.vertexAttribPointer(this.attribs.aPosition, 3, this.gl.FLOAT, false, 0, 0);
        var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        var fov = Math.PI / 4;
        var matrix = m4.perspective(fov, aspect, 1, 10000);
        matrix = m4.xRotate(matrix, this.chart2.rotation[0]);
        matrix = m4.yRotate(matrix, this.chart2.rotation[1]);
        matrix = m4.translate(matrix, this.chart2.translation[0], this.chart2.translation[1], this.chart2.translation[2]);
        // podlaczamy macierze i kolory
        this.gl.uniformMatrix4fv(this.uniforms.uMatrix, false, matrix);
        this.gl.uniform3fv(this.uniforms.aColor, this.chart2.color);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.chart2.positions.length / 3);



    }
}

// funkcje do tworzenia programu
function initBuffers(gl, positions) {
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}

function loadShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.devareShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl, vertexShader, fragmentShader) {
    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShader);
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        return null;
    }

    return shaderProgram;
}

// przy zmianie rozmiaru canvasa
function resizeCanvas(canvas) {
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}