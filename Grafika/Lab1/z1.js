// pole do rusowanie
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
// wymiary okna
var minX = 0;
var maxX = 1000;
var minY = 0;
var maxY = 1000;
// stosuenk canvasa do okna
var dx = canvas.width / (maxX - minX);
var dy = canvas.height / (maxY - minY);
// kod podany przez uzytkownika
var input;
// pozycja zolwia
var positionX;
var positionY;
// kat zolwia
var round;
// komendy zolwia
var commands;


// przy zaladowaniu rysujemy 3 wskazane ksztalty i ustawiamy zolwia na srodek odwroconego w gore
onload = function() {
    input = document.getElementById("code");
    round = 0;
    redRectangle();
    greenHexagon();
    blueOctagon();
    positionX = canvas.width / 2;
    positionY = canvas.height / 2;
}

// funkcja konwertujaca tekst wpisany przez uzytkownika na komendy
function convert() {
    // separator to spacja
    commands = input.value.split("\n");
    input.value = "";
    var i = 0;
    // zaczynamy rysunek 
    ctx.beginPath();
    // idziemy na pozycje
    ctx.moveTo(positionX, positionY);
    // czarna linia
    ctx.strokeStyle = "#000000";
    // dopoki sa komendy
    while (i < commands.length) {
        var com = commands[i].split(" ");
        // jesli jest argument komendy
        if (com.length == 2) {
            var arg = parseInt(com[1]);
        } else {
            alert("Missing argument");
            return;
        }
        // jesli argument jest prawidlowy
        if (!(Number.isNaN(arg))) {
            // sprawdzamy jaka to komenda
            if (com[0].toUpperCase() == "FD") {
                forward(arg);
            } else if (com[0].toUpperCase() == "LT") {
                left(arg);
            } else if (com[0].toUpperCase() == "RT") {
                right(arg);
            } else {
                alert("Unknown command: " + com[0]);
                return;
            }
            i++;
        } else {
            alert("Invalid value: " + com[1]);
            return;
        }
    }
    // rysujemy
    ctx.stroke();
}

// funkcja resetujaca
var reset = function() {
    // czyscimy canvas i ustawiamy poczatkowa pozycje zolwia
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    positionX = canvas.width / 2;
    positionY = canvas.height / 2;
    round = 0;
    ctx.beginPath();
    ctx.moveTo(positionX, positionY);
    ctx.strokeStyle = "#000000";
}

// poruszanie do przodu
var forward = function(distance) {
    // pozycje ustawiamy na podstawie kata
    positionX += Math.sin(round) * distance * dx;
    positionY -= Math.cos(round) * distance * dy;
    ctx.lineTo(positionX, positionY);
}

// skret w lewo
var left = function(angle) {
    // odejmujemy kat
    round -= angle * Math.PI / 180;
}

// skret w prawo
var right = function(angle) {
    // dodajemy kat
    round += angle * Math.PI / 180;
}

// czerwony prostokat
function redRectangle() {
    ctx.beginPath();
    positionX = 250;
    positionY = 250;
    ctx.moveTo(positionX, positionY);
    ctx.strokeStyle = "#FF0000";
    // 4 razy powtarzamy linie do przodu i zakret w prawo o 90 st
    for (i = 0; i < 4; i++) {
        forward(200);
        right(90);
    }
    ctx.stroke();
}

// zielony szesciokat
function greenHexagon() {
    ctx.beginPath();
    positionX = 600;
    positionY = 600;
    ctx.moveTo(positionX, positionY);
    ctx.strokeStyle = "#00FF00";
    // 6 razy powtarzamy linie do przodu i skret w prawo o 60 st
    for (i = 0; i < 6; i++) {
        forward(100);
        right(60);
    }
    ctx.stroke();
}

//niebieski osmiokat
function blueOctagon() {
    positionX = 100;
    positionY = 500;
    ctx.beginPath();
    ctx.moveTo(positionX, positionY);
    ctx.strokeStyle = "#0000FF";
    // 8 razy powtarzamy linie do przodu i skret w prawo o 45 st
    for (i = 0; i < 8; i++) {
        forward(100);
        right(45);
    }
    ctx.stroke();
}