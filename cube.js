const sleep = require('util').promisify(setTimeout);

let A = 0, B = 0, C = 0;
let cubeWidth = 15;
let width = 80, height = 15;
let zBuffer = new Array(80 * 15);
let buffer = new Array(80 * 15).fill(' ');
let distanceFromCam = 100;
let horizontalOffset;
let K1 = 15;
let incrementSpeed = 0.6;
let x, y, z;
let ooz;
let xp, yp;
let idx;

function calculateX(i, j, k) {
    let sinA = Math.sin(A), cosA = Math.cos(A);
    let sinB = Math.sin(B), cosB = Math.cos(B);
    let sinC = Math.sin(C), cosC = Math.cos(C);
    return j * sinA * sinB * cosC - k * cosA * sinB * cosC +
        j * cosA * sinC + k * sinA * sinC + i * cosB * cosC;
}

function calculateY(i, j, k) {
    let sinA = Math.sin(A), cosA = Math.cos(A);
    let sinB = Math.sin(B), cosB = Math.cos(B);
    let sinC = Math.sin(C), cosC = Math.cos(C);
    return j * cosA * cosC + k * sinA * cosC -
        j * sinA * sinB * sinC + k * cosA * sinB * sinC -
        i * cosB * sinC;
}

function calculateZ(i, j, k) {
    let sinA = Math.sin(A), cosA = Math.cos(A);
    let sinB = Math.sin(B), cosB = Math.cos(B);
    return k * cosA * cosB - j * sinA * cosB + i * sinB;
}

function calculateForSurface(cubeX, cubeY, cubeZ, ch) {
    x = calculateX(cubeX, cubeY, cubeZ);
    y = calculateY(cubeX, cubeY, cubeZ);
    z = calculateZ(cubeX, cubeY, cubeZ) + distanceFromCam;

    ooz = 1 / z;

    xp = Math.floor(width / 2 + horizontalOffset + K1 * ooz * x * 2);
    yp = Math.floor(height / 2 + K1 * ooz * y);

    idx = xp + yp * width;
    if (idx >= 0 && idx < width * height) {
        if (ooz > zBuffer[idx]) {
            zBuffer[idx] = ooz;
            buffer[idx] = ch;
        }
    }
}
let frames = [];

async function main() {
    // Генерация всех кадров
    for (let t = 0; t < 100; t += 0.05) {
        A = B = t;
        C = t * 0.2;
        buffer.fill(' ');
        zBuffer.fill(0);
        cubeWidth = 15;
        horizontalOffset = -2 * cubeWidth;
        for (let cubeX = -cubeWidth; cubeX < cubeWidth; cubeX += incrementSpeed) {
            for (let cubeY = -cubeWidth; cubeY < cubeWidth; cubeY += incrementSpeed) {
                calculateForSurface(cubeX, cubeY, -cubeWidth, '@');
                calculateForSurface(cubeWidth, cubeY, cubeX, '$');
                calculateForSurface(-cubeWidth, cubeY, -cubeX, '~');
                calculateForSurface(-cubeX, cubeY, cubeWidth, '#');
                calculateForSurface(cubeX, -cubeWidth, -cubeY, ';');
                calculateForSurface(cubeX, cubeWidth, cubeY, '+');
            }
        }
        frames.push(buffer.slice()); // Копирование текущего буфера в массив кадров
    }

    // Вывод всех кадров
    for (let frame of frames) {
        let output = '';
        for (let k = 0; k < width * height; k++) {
            output += k % width ? frame[k] : '\n';
        }
        console.clear();
        process.stdout.write(output);
        await sleep(16);
    }

}

main();

