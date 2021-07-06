class Chart {
    // ustawiamy rozmiar wykresu, dokladnosc, jego punkty i wektory normalne, color, przesuniecie i rotacje
    constructor(gl, type) {
            this.gl = gl;
            this.size = 1000;
            this.space = 500;
            if (type == 1) {
                this.generateChart([-5, 5], [-5, 5], (x, y) => Math.sin(x) * Math.cos(y));
            } else if (type == 2) {
                this.generateChart([-5, 5], [-5, 5], (x, y) => Math.asin(x * y));
            } else {
                this.generateChart([-5, 5], [-5, 5], (x, y) => x * y);
            }
            this.positionBuffer = initBuffers(this.gl, this.positions);
            this.normalsBuffer = initBuffers(this.gl, this.normals);
            this.color = [1, 0, 0];
            this.translation = [0, 0, -2000];
            this.rotation = [0, 0, 0];
        }
        // funkcja liczaca wektory normalne do wierzcholkow trojkata
    triangleNormal(triangle, swap = false) {
        var U = [triangle[3] - triangle[0], triangle[4] - triangle[1], triangle[5] - triangle[2]];
        var V = [triangle[6] - triangle[0], triangle[7] - triangle[1], triangle[8] - triangle[2]];

        if (swap) {
            [U, V] = [V, U];
        }

        return [
            U[1] * V[2] - U[2] * V[1],
            U[2] * V[0] - U[0] * V[2],
            U[0] * V[1] - U[1] * V[0]
        ];
    }

    generateChart(xRange, yRange, func) {
        this.positions = [];
        this.normals = [];

        var scaleFactor = this.size / Math.abs(xRange[1] - xRange[0]);

        for (var x = 0; x < this.space; x++) {
            for (var y = 0; y < this.space; y++) {
                var value = func(
                    xRange[0] + x * (xRange[1] - xRange[0]) / this.space,
                    yRange[0] + y * (yRange[1] - yRange[0]) / this.space
                ) * scaleFactor;

                var nextY = null;
                var nextX = null;
                var nextYX = null;
                if (y !== this.space - 1) {
                    nextY = func(
                        xRange[0] + x * (xRange[1] - xRange[0]) / this.space,
                        yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.space
                    ) * scaleFactor;
                }
                if (x !== this.space - 1) {
                    nextX = func(
                        xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.space,
                        yRange[0] + y * (yRange[1] - yRange[0]) / this.space
                    ) * scaleFactor;
                }
                if (x !== this.space - 1 && y !== this.space - 1) {
                    nextYX = func(
                        xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.space,
                        yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.space
                    ) * scaleFactor;
                }

                if (nextX !== null && nextY !== null && nextYX !== null) {
                    var firstTriangle = [
                        x * this.size / this.space - this.size / 2,
                        y * this.size / this.space - this.size / 2,
                        value,
                        (x + 1) * this.size / this.space - this.size / 2,
                        y * this.size / this.space - this.size / 2,
                        nextX,
                        x * this.size / this.space - this.size / 2,
                        (y + 1) * this.size / this.space - this.size / 2,
                        nextY
                    ];

                    var secondTriangle = [
                        (x + 1) * this.size / this.space - this.size / 2,
                        (y + 1) * this.size / this.space - this.size / 2,
                        nextYX,
                        (x + 1) * this.size / this.space - this.size / 2,
                        y * this.size / this.space - this.size / 2,
                        nextX,
                        x * this.size / this.space - this.size / 2,
                        (y + 1) * this.size / this.space - this.size / 2,
                        nextY
                    ];

                    this.positions.push(...firstTriangle, ...secondTriangle);
                    this.normals.push(
                        ...this.triangleNormal(firstTriangle),
                        ...this.triangleNormal(firstTriangle),
                        ...this.triangleNormal(firstTriangle),
                        ...this.triangleNormal(secondTriangle, true),
                        ...this.triangleNormal(secondTriangle, true),
                        ...this.triangleNormal(secondTriangle, true));
                }
            }
        }
    }
}


class Draw {
    constructor(gl, type) {
        this.gl = gl;
        this.program = initShaderProgram(this.gl, vertexShader, fragmentShader);

        this.uniforms = {
            uMatrix: gl.getUniformLocation(this.program, "uMatrix"),
            uColor: gl.getUniformLocation(this.program, "fragmentColor"),
            uPerspective: gl.getUniformLocation(this.program, "uPerspective"),
            uAmbient: gl.getUniformLocation(this.program, "uAmbient"),
            uReverseLightDirection: gl.getUniformLocation(this.program, "uReverseLightDirection")
        };
        this.attribs = {
            aPosition: gl.getAttribLocation(this.program, "aPosition"),
            aNormal: gl.getAttribLocation(this.program, "aNormal")
        };

        this.chart = new Chart(this.gl, type);
        this.objectsToDraw = [this.chart];
    }

    drawScene() {
        resizeCanvas(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.program);

        this.objectsToDraw.forEach(object => {
            this.gl.enableVertexAttribArray(this.attribs.aPosition);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.positionBuffer);
            // wierzcholki trojkatow
            this.gl.vertexAttribPointer(this.attribs.aPosition, 3, this.gl.FLOAT, false, 0, 0);

            this.gl.enableVertexAttribArray(this.attribs.aNormal);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.normalsBuffer);
            // wektory normalne trojkatow
            this.gl.vertexAttribPointer(this.attribs.aNormal, 3, this.gl.FLOAT, false, 0, 0);

            var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
            var fov = Math.PI / 4;

            var perspective = m4.perspective(fov, aspect, 1, 5000);

            var matrix = m4.identity();
            matrix = m4.xRotation(object.rotation[0]);
            matrix = m4.yRotate(matrix, object.rotation[1]);
            matrix = m4.translate(matrix, object.translation[0], object.translation[1], object.translation[2]);

            this.gl.uniformMatrix4fv(this.uniforms.uPerspective, false, perspective);
            this.gl.uniformMatrix4fv(this.uniforms.uMatrix, false, matrix);
            // ambient,kolor, promien swiatla
            this.gl.uniform1f(this.uniforms.uAmbient, 0.5);
            this.gl.uniform3fv(this.uniforms.uColor, object.color);
            this.gl.uniform3fv(this.uniforms.uReverseLightDirection, m4.normalize([0.5, 0.7, 1]));

            this.gl.drawArrays(this.gl.TRIANGLES, 0, object.positions.length / 3);
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

function resizeCanvas(canvas) {
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}