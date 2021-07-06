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
      gl_FragColor = vec4(fragmentColor,1.0);
    }
`;


// fragment shader do rysowania siatki pikseli
var pixFragmentShaderSrc = "" +
    "precision mediump float;\n" +
    "void main()\n" +
    "{\n" +
    "    float d= floor( mod(gl_FragCoord.x+gl_FragCoord.y, 2.0) );\n" +
    "    if( d>0.5 ) discard;\n" +
    "    gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );\n" +
    "}\n";


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

    let draw = new Draw(gl);

    resizeCanvas(draw.gl.canvas);
    draw.drawScene();


    window.requestAnimationFrame(animate);

    //animacja
    function animate() {
        draw.chart.rotation[1] -= speed;
        draw.chart2.rotation[1] += speed;
        draw.drawScene();
        window.requestAnimationFrame(animate);
    }

}