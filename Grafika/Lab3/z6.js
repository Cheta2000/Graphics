// dosc typowe shadery

var vertexShader = `
attribute vec4 aPosition;
uniform mat4 uMatrix;
void main() {
    gl_Position = uMatrix * aPosition;
    gl_PointSize = 4.0;
}
`;

var fragmentShader = `
    precision mediump float;
    uniform vec3 fragmentColor;
    void main() {
      gl_FragColor = vec4(fragmentColor,0.7);
    }
`;

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }
    window.onkeydown = onKeyDown;
    var speed = 0.001;

    function onKeyDown(e) {
        e.preventDefault();
        var code = e.which || e.keyCode;
        switch (code) {
            case 40:
                speed += 0.001;
                break;
            case 38:
                speed -= 0.001;
                break;

        }
    }

    window.onkeydown = onKeyDown;

    let draw = new Draw(gl);

    resizeCanvas(draw.gl.canvas);
    draw.drawScene();

    // reakcje na klawisze
    function onKeyDown(e) {
        var code = e.which || e.keyCode;

        switch (code) {
            case 40:
                draw.chart.rotation[0] -= 0.05;
                draw.chart2.rotation[0] -= 0.05;
                break;
            case 38:
                draw.chart.rotation[0] += 0.05;
                draw.chart2.rotation[0] += 0.05;
                break;
            case 39:
                draw.chart.rotation[1] -= 0.05;
                draw.chart2.rotation[1] -= 0.05;
                break;
            case 37:
                draw.chart.rotation[1] += 0.05;
                draw.chart2.rotation[1] += 0.05;
                break;
            case 70:
                draw.chart.translation[2] += 50;
                draw.chart2.translation[2] += 50;
                break;
            case 71:
                draw.chart.translation[2] -= 50;
                draw.chart2.translation[2] -= 50;
                break;
            case 68:
                draw.chart.translation[0] += 50;
                draw.chart2.translation[0] += 50;
                break;
            case 65:
                draw.chart.translation[0] -= 50;
                draw.chart2.translation[0] -= 50;
                break;
            case 87:
                draw.chart.translation[1] += 50;
                draw.chart2.translation[1] += 50;
                break;
            case 83:
                draw.chart.translation[1] -= 50;
                draw.chart2.translation[1] -= 50;
                break;
        }
        draw.drawScene();
        requestAnimationFrame(onKeyDown);
    }




}