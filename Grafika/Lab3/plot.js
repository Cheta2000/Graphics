// klasa wykresu

class Chart {
    // ustawiamy rozmiar wykresu, dokladnosc, jego punkty, color, przesuniecie i rotacje
    constructor(gl, type, checked) {
        this.size = 1000;
        this.space = 50;
        if (type == 1) {
            this.positions = this.generateChart([-5, 5], [-5, 5], (x, y) => Math.sin(x) * Math.cos(y), checked);
        } else if (type == 2) {
            this.positions = this.generateChart([-5, 5], [-5, 5], (x, y) => Math.asin(x * y), checked);
        } else {
            this.positions = this.generateChart([-5, 5], [-5, 5], (x, y) => x * y, checked);
        }
        this.positionBuffer = initBuffers(gl, this.positions);
        this.color = [1, 0, 0];
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

                if (triangles) {
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
                } else {
                    chartPoints.push(
                        x * this.size / this.space - this.size / 2,
                        y * this.size / this.space - this.size / 2,
                        value);
                }
            }
        }

        // skalowanie
        var scaleFactor = this.size / Math.abs(xRange[1] - xRange[0]);
        chartPoints = chartPoints.map((p, i) => i % 3 === 2 ? p * scaleFactor : p);

        return chartPoints;
    }
}


// klasa odpowiedzialna za tworzenie programu rysowanie itp
class Draw {
    // pobieramy atrybuty i uniformy z shaderow
    constructor(gl, type, checked) {
        this.gl = gl;
        this.program = initShaderProgram(this.gl, vertexShader, fragmentShader);

        this.uniforms = {
            uMatrix: gl.getUniformLocation(this.program, "uMatrix"),
            aColor: gl.getUniformLocation(this.program, "fragmentColor")
        };
        this.attribs = {
            aPosition: gl.getAttribLocation(this.program, "aPosition")
        };
        this.chart = new Chart(this.gl, type, checked);
        this.objectsToDraw = [this.chart];
    }

    // tworzymy program i rysyjemy
    drawScene(triangles) {
        resizeCanvas(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.program);

        this.objectsToDraw.forEach(object => {
            this.gl.enableVertexAttribArray(this.attribs.aPosition);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.positionBuffer);
            this.gl.vertexAttribPointer(this.attribs.aPosition, 3, this.gl.FLOAT, false, 0, 0);

            // tworzymy odpowiednia macierz w zaleznosci od kata rotacji translacji itp
            var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
            var fov = Math.PI / 4;
            var matrix = m4.perspective(fov, aspect, 1, 10000);
            matrix = m4.xRotate(matrix, object.rotation[0]);
            matrix = m4.yRotate(matrix, object.rotation[1]);
            matrix = m4.translate(matrix, object.translation[0], object.translation[1], object.translation[2]);
            // podlaczamy macierze i kolory
            this.gl.uniformMatrix4fv(this.uniforms.uMatrix, false, matrix);
            this.gl.uniform3fv(this.uniforms.aColor, object.color);
            // w zaleznosci od sposobu rysowania
            if (triangles) {
                this.gl.drawArrays(this.gl.TRIANGLES, 0, object.positions.length / 3);
            } else {
                this.gl.drawArrays(this.gl.POINTS, 0, object.positions.length / 3);
            }
        });
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