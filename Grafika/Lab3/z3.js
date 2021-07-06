//shadery

//zawiera macierz przeksztalcenia, macierz perspektywy i wektor normalny do plaszczyzny
//wyliczana jest takze glebokosc mgly
var vertexShader = `
attribute vec4 aPosition;
attribute vec3 aNormal;
uniform mat4 uMatrix;
uniform mat4 uPerspective;
varying float vFogDepth;
varying vec3 vNormal;
void main() {
    gl_Position = uPerspective * uMatrix * aPosition;
    gl_PointSize = 4.0;
    vFogDepth = -(uMatrix * aPosition).z;
    vNormal = aNormal;
}
`;

//fogAmount to moc mgly w danym miejscu
//ambient to po prostu wspolczynnik przez ktory mnozymy kolor otoczenia
//dot liczy iloczyn wektorowy miedzy wektorem normalnym a promieniem swietlnym, aby wyliczyc wplyw swiatla na miejsce
//gdyby iloczyn wekt byl mniejszy od 0 korzystamy z samego ambient, else dodajemy diffuse i ambient
//miksujemy kolor z biala mgla
var fragmentShader = `
    precision mediump float;
    uniform vec3 uReverseLightDirection;
    uniform vec3 fragmentColor;
    uniform float uAmbient;
    varying float vFogDepth;
    varying vec3 vNormal;
    void main() {
      float fogAmount = smoothstep(1000.0, 5000.0, vFogDepth);
      vec3 normal = normalize(vNormal);
      float light = dot(normal, uReverseLightDirection);
      gl_FragColor = vec4(fragmentColor,1.0);
      gl_FragColor.rgb *= max(min(light + uAmbient, 1.5), uAmbient);
      gl_FragColor = mix(gl_FragColor, vec4(1, 1, 1, 1), fogAmount);
    }
`;

var fun1 = document.getElementById("fun1");
var fun2 = document.getElementById("fun2");
var fun3 = document.getElementById("fun3");

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }
    let draw = new Draw(gl, 1);


    fun1.onclick = function() {
        draw = new Draw(gl, 1);
        draw.drawScene();

    }

    fun2.onclick = function() {
        draw = new Draw(gl, 2);
        draw.drawScene();
    }
    fun3.onclick = function() {
        draw = new Draw(gl, 3);
        draw.drawScene();
    }

    window.onkeydown = onKeyDown;
    resizeCanvas(draw.gl.canvas);
    draw.drawScene();

    let changed = true;

    function onKeyDown(e) {
        e.preventDefault();
        var code = e.which || e.keyCode;
        switch (code) {
            case 40:
                draw.chart.rotation[0] -= 0.05;
                changed = true;
                break;
            case 38:
                draw.chart.rotation[0] += 0.05;
                changed = true;
                break;
            case 39:
                draw.chart.rotation[1] -= 0.05;
                changed = true;
                break;
            case 37:
                draw.chart.rotation[1] += 0.05;
                changed = true;
                break;
            case 70:
                draw.chart.translation[2] += 50;
                changed = true;
                break;
            case 71:
                draw.chart.translation[2] -= 50;
                changed = true;
                break;
            case 68:
                draw.chart.translation[0] += 50;
                changed = true;
                break;
            case 65:
                draw.chart.translation[0] -= 50;
                changed = true;
                break;
            case 87:
                draw.chart.translation[1] += 50;
                changed = true;
                break;
            case 83:
                draw.chart.translation[1] -= 50;
                changed = true;
                break;
        }
        if (changed) {
            draw.drawScene();
            changed = false;
        }
        requestAnimationFrame(onKeyDown);
    }
}