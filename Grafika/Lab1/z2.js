var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var minX = 0;
var maxX = 1000;
var minY = 0;
var maxY = 1000;
var dx = canvas.width / (maxX - minX);
var dy = canvas.height / (maxY - minY);
// przyciski odpowiadajace co rysujemy
var sierpButton;
var kochButton;
// w inpucie podajemy ktorego stopnia ma byc krzywa
var input;
var positionX;
var positionY;
var round;
// rozmiar startowy rysowanej krzywej
var startSize;

onload = function() {
    sierpButton = document.getElementById("sierp");
    kochButton = document.getElementById("koch");
    input = document.getElementById("level");
    round = Math.PI / 2;
    startSize = 700;
    // dodanie sluchacza klawiatury
    onkeydown = keyDownCallback;
    reset(1);
}

// parametr w resecie mowi gdzie ustawiamy zolwia po resecie
var reset = function(type) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (type == 1) {
        positionX = canvas.width / 7;
        positionY = canvas.height / 3.5;
    } else {
        positionX = canvas.width / 7;
        positionY = canvas.height / 1.3;
    }
    round = Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(positionX, positionY);
    ctx.strokeStyle = "#000000";
}

var forward = function(distance) {
    positionX += Math.sin(round) * distance * dx;
    positionY -= Math.cos(round) * distance * dy;
    ctx.lineTo(positionX, positionY);
}

var left = function(angle) {
    round -= angle * Math.PI / 180;
}

var right = function(angle) {
    round += angle * Math.PI / 180;
}

// sluchasz klawiatury
var keyDownCallback = function(e) {
    // blokujemy domyslne funkcje kliknietego klawisza
    e.preventDefault();
    // pobieramy kod przycisku
    var code = e.which || e.keyCode;
    // sprawdzamy jaki to pczycisk
    switch (code) {
        // enter
        case 13:
            // odpowiednio pobieramy dana
            var level = input.value;
            if (level < 0) {
                alert("Invalid value");
            } else {
                if (sierpButton.checked) {
                    reset(0);
                    sierp(level, startSize);
                } else {
                    reset(1);
                    kochFlake(level, startSize);
                }
            }
            break;
    };
}

// rysowanie trojkata
function triangle(size) {
    // 3 razy powtarzamy linie do przodu i zakret w lewo o 120 st
    for (i = 0; i < 3; i++) {
        forward(size);
        left(120);
    }
    ctx.stroke();
}

// trojkat sierpinskiego
function sierp(level, size) {
    // jesli rysujemy poziom 1 to tysujemy trojkat
    if (level == 1) {
        triangle(size);
    } else {
        // rysujemy trojkat poziom mniekszy i dwa razy mniejszy
        sierp(level - 1, size / 2);
        // zmianiamy odpowiednio pozycje i robimy to samo
        forward(size / 2);
        sierp(level - 1, size / 2);
        forward(-size / 2);
        left(60);
        forward(size / 2);
        right(60);
        sierp(level - 1, size / 2);
        left(60);
        forward(-size / 2);
        right(60);
    }
}

// linia kocha
function kochLine(level, size) {
    // jesli rysujemy poziom 1 to rusyuemy linie
    if (level == 1) {
        forward(size);
        ctx.stroke();
    } else {
        // rysujemy linie poziom mniejsza i 3 razy krotsza
        kochLine(level - 1, size / 3);
        // odpowiednio sie obracamy i rysujemy to samo
        left(60);
        kochLine(level - 1, size / 3);
        right(120);
        kochLine(level - 1, size / 3);
        left(60);
        kochLine(level - 1, size / 3);
    }
}

// platek kocha
function kochFlake(level, size) {
    // 3 razy powtarzamy linie kocha i obrot w prawo o 120 st
    for (i = 0; i < 3; i++) {
        kochLine(level, size);
        right(120);
    }
}