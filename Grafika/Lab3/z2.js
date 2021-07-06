// shadery

// zawiera macierz przeksztalcenia
var vertexShader = `
attribute vec4 aPosition;
uniform mat4 uMatrix;
void main() {
    gl_Position = uMatrix * aPosition;
    gl_PointSize = 4.0;
}
`;

// zawiera kolor
var fragmentShader = `
    precision mediump float;
    uniform vec3 fragmentColor;
    void main() {
      gl_FragColor = vec4(fragmentColor,1.0);
    }
`;

var fun1 = document.getElementById("fun1");
var fun2 = document.getElementById("fun2");
var fun3 = document.getElementById("fun3");
var triangles = document.getElementById("type");

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }
    // jaka funkcja i czy z punkty czy trojkaty
    var choose = 1;
    var type = false;

    let draw = new Draw(gl, choose, type);

    fun1.onclick = function() {
        choose = 1;
        draw = new Draw(gl, choose, type);
        draw.drawScene(type);
    }

    fun2.onclick = function() {
        choose = 2;
        draw = new Draw(gl, choose, type);
        draw.drawScene(type);
    }
    fun3.onclick = function() {
        choose = 3;
        draw = new Draw(gl, choose, type);
        draw.drawScene(type);
    }
    triangles.onclick = function() {
        if (triangles.checked) {
            type = true;
        } else {
            type = false;
        }
        draw = new Draw(gl, choose, type);
        draw.drawScene(type);
    }

    window.onkeydown = onKeyDown
    resizeCanvas(draw.gl.canvas);
    draw.drawScene(type);


    // reakcje na klawisze
    function onKeyDown(e) {
        var code = e.which || e.keyCode;

        switch (code) {
            case 40:
                draw.chart.rotation[0] -= 0.05;
                break;
            case 38:
                draw.chart.rotation[0] += 0.05;
                break;
            case 39:
                draw.chart.rotation[1] -= 0.05;
                break;
            case 37:
                draw.chart.rotation[1] += 0.05;
                break;
            case 70:
                draw.chart.translation[2] += 50;
                break;
            case 71:
                draw.chart.translation[2] -= 50;
                break;
            case 68:
                draw.chart.translation[0] += 50;
                break;
            case 65:
                draw.chart.translation[0] -= 50;
                break;
            case 87:
                draw.chart.translation[1] += 50;
                break;
            case 83:
                draw.chart.translation[1] -= 50;
                break;
        }
        draw.drawScene(type);
        requestAnimationFrame(onKeyDown);
    }
}