// svg
var svg = document.getElementById("svg");
// lamana
var poly;
var sierpButton;
var kochButton;
// punkty lamanej
var points;
var input;
var round;
// gdzie jestesmy aktualnie
var actualX;
var actualY;
// gdzie zaczynamy
var startX;
var startY;
var size;


onload = function() {
    poly = document.getElementById("poly");
    sierpButton = document.getElementById("sierp");
    kochButton = document.getElementById("koch");
    input = document.getElementById("level");
    size = 400;
    startX = 400;
    startY = 400;
    actualX = startX;
    actualY = startY;
    // pierwszy punkt to punkt startowy
    points = actualX + "," + actualY;
    counter = 0;
    round = 0;
    onkeydown = keyDownCallback;
}

var reset = function() {
    actualX = startX;
    actualY = startY;
    points = actualX + "," + actualY;
    poly.setAttribute("points", points);
}

var keyDownCallback = function(e) {
    e.preventDefault();
    var code = e.which || e.keyCode;
    switch (code) {
        case 13:
            var level = input.value;
            if (level < 0) {
                alert("Invalid value");
            } else {
                if (sierpButton.checked) {
                    reset();
                    sierp(level, startX, startY, startX + size, startY, startX / 2 + size, startY - size * Math.sqrt(3) / 2, startX, startY);
                } else {
                    reset();
                    kochFlake(level, size);
                }
            }
            break;
    };
}

var polyline = function(x0, y0, x1, y1, x2, y2, x3, y3) {
    // dodajemy odpowiednie punkty do krzywej
    points += " " + x0 + "," + y0 + " " + x1 + "," + y1 + " " +
        x2 + "," + y2 + " " + x3 + "," + y3;
    poly.setAttribute("points", points);
}

// wyznaczanie wspolrzednych sroka odcinka miedzy dwoma punktami
var middle = function(x, y) {
    return (x + y) / 2;
}

// funkcja dodajca jeden konkretny punkt do krzywej
var goto = function(x0, y0) {
    points += " " + x0 + "," + y0;
    poly.setAttribute("points", points);
}

// funkcje z zolwia zamienione na svg
function forward(distance) {
    actualX += distance * Math.cos(round);
    actualY -= distance * Math.sin(round);
    points += " " + actualX + "," + actualY;
    poly.setAttribute("points", points);
}

function left(angle) {
    round += angle * Math.PI / 180;
}

function right(angle) {
    round -= angle * Math.PI / 180;
}

// trojkat sierpinskiego
function sierp(level, x0, y0, x1, y1, x2, y2, x3, y3) {
    // jesli poziom 1 to rysujemy trojkat
    if (level == 1) {
        polyline(x0, y0, x1, y1, x2, y2, x3, y3);
    } else {
        // rysujemy 3 trojkaty poziomu o 1 mniejszego o odpowiednich wspolrzednych
        sierp(level - 1, x0, y0, middle(x0, x1), middle(y0, y1), middle(x0, x2), middle(y0, y2), x0, y0);
        sierp(level - 1, x1, y1, middle(x0, x1), middle(y0, y1), middle(x1, x2), middle(y1, y2), x1, y1);
        sierp(level - 1, x2, y2, middle(x1, x2), middle(y1, y2), middle(x0, x2), middle(y0, y2), x2, y2);
        goto(x0, y0);
    }
}

// rysowanie kocha dziala tak samo jak na canvasie ale ze zmienionymi metodami zolwia
function kochLine(level, size) {
    if (level == 1) {
        forward(size);
    } else {
        kochLine(level - 1, size / 3);
        left(60);
        kochLine(level - 1, size / 3);
        right(120);
        kochLine(level - 1, size / 3);
        left(60);
        kochLine(level - 1, size / 3);
    }
}

function kochFlake(level, size) {
    kochLine(level, size);
    right(120);
    kochLine(level, size);
    right(120);
    kochLine(level, size);
    right(120);
}