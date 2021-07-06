// ladowanie naszej tekstury
function loadTexture(texture, gl, number) {
    // zanim zaladuja sie obrazki
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    // wybieramy obrazek
    const image = new Image();
    switch (number) {
        case 1:
            image.src = "bricks.jpeg";
            break;
        case 2:
            image.src = "stones.jpeg";
            break;
        case 3:
            image.src = "dk.jpg";
            break;
        case 4:
            image.src = "ilusion.png";
            break;
        case 5:
            image.src = "planets.png";
            break;
        default:
            image.src = "metal.jpg";
            break;

    }
    // gdy obrazek sie zaladuje podlaczamy go do tekstury
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    return texture;
}