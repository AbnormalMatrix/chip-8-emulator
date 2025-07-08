// set the game's resolution to 64x32
namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 64;
    export const ARCADE_SCREEN_HEIGHT = 32;
}

// stack - since this is javascript it will just be a list of numbers
let stack: number[] = []

// general purpose registers v0-vf
let v: number[] = [];
for (let j = 0; j < 16; j++) {
    v[j] = 0
}

// 4096 bytes (4kb) of memory
let memory: number[] = [];
for (let j = 0; j < 4096; j++) {
    memory[j] = 0;
}

// program counter
let pc = 0x200
// index register
let i = 0

// load the default font at hex 050 (dec 80)
let fontBytes = [0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];
let fontOffset = 0x50;
for (let j = 0; j < fontBytes.length; j++) {
    memory[fontOffset + j] = fontBytes[j];
}

const data: number[] = [
    // Offset 0x00000000 to 0x00000083
    0x00, 0xE0, 0xA2, 0x2A, 0x60, 0x0C, 0x61, 0x08, 0xD0, 0x1F, 0x70, 0x09,
    0xA2, 0x39, 0xD0, 0x1F, 0xA2, 0x48, 0x70, 0x08, 0xD0, 0x1F, 0x70, 0x04,
    0xA2, 0x57, 0xD0, 0x1F, 0x70, 0x08, 0xA2, 0x66, 0xD0, 0x1F, 0x70, 0x08,
    0xA2, 0x75, 0xD0, 0x1F, 0x12, 0x28, 0xFF, 0x00, 0xFF, 0x00, 0x3C, 0x00,
    0x3C, 0x00, 0x3C, 0x00, 0x3C, 0x00, 0xFF, 0x00, 0xFF, 0xFF, 0x00, 0xFF,
    0x00, 0x38, 0x00, 0x3F, 0x00, 0x3F, 0x00, 0x38, 0x00, 0xFF, 0x00, 0xFF,
    0x80, 0x00, 0xE0, 0x00, 0xE0, 0x00, 0x80, 0x00, 0x80, 0x00, 0xE0, 0x00,
    0xE0, 0x00, 0x80, 0xF8, 0x00, 0xFC, 0x00, 0x3E, 0x00, 0x3F, 0x00, 0x3B,
    0x00, 0x39, 0x00, 0xF8, 0x00, 0xF8, 0x03, 0x00, 0x07, 0x00, 0x0F, 0x00,
    0xBF, 0x00, 0xFB, 0x00, 0xF3, 0x00, 0xE3, 0x00, 0x43, 0xE5, 0x05, 0xE2,
    0x00, 0x85, 0x07, 0x81, 0x01, 0x80, 0x02, 0x80, 0x07, 0xE1, 0x06, 0xE7
];


const programOffset = 0x200;
// load the data into memory
for (let j = 0; j < data.length; j++) {
    memory[programOffset + j] = data[j];
}

// timer registers
let delayTimer = 0;
let soundTimer = 0;

// timer loop
timer.background(function() {
    while (true) {
        // delay for 1/60 of a second 
        pause(16.67)
        if (delayTimer > 0) {
            delayTimer -= 1;
        }
        if (soundTimer > 0) {
            soundTimer -= 1;
        }
    }
})

// set the screen image to a blank image
let screenImage = image.create(64, 32);
screenImage.fillRect(0, 0, 64, 32, 15);


forever(function() {
    scene.setBackgroundImage(screenImage);

})
// main loop
timer.background(function() {
    while (true) {
        // fetch
        let currentIntructionA = memory[pc];
        let currentInstructionB = memory[pc + 1];
        let currentInstruction = currentIntructionA << 8 | currentInstructionB;

        pc += 2

        // decode
        // the opcode is the first 4 bytes (nybble)
        let opcode = (currentInstruction >> 12) & 0xF;
        let n2 = (currentInstruction >> 8) & 0xF;
        let n3 = (currentInstruction >> 4) & 0xF;
        let n4 = currentInstruction & 0xf;

        let x = n2;
        let y = n3;
        let n = n4;
        let nn = (n3 << 4) | n4;
        let nnn = ((n2 << 8) | (n3 << 4) | n4);
        // execute

        switch (opcode) {
            case 0x0:
                if (currentInstruction === 0x00E0) {
                    // clear screen
                    screenImage.fillRect(0, 0, 64, 32, 15);
                    pause(1)
                } else if (currentInstruction == 0x00EE) {
                    // return from subroutine
                    // set pc to pop from stack
                    pc = stack.pop();
                }
                break;
            case 0x1:
                // jump to nnn
                pc = nnn;
                break;
            case 0x6:
                // set vx to nn
                v[x] = nn;
                break;
            case 0x7:
                // add nn to vx
                v[x] = v[x] + nn
                break;
            case 0xA:
                // set index register to nnn
                i = nnn;
                break;
            case 0xD:
                // draw to the screen at vx, vy with value n pixel tall sprite
                let xCoord = v[x] & 63;
                let yCoord = v[y] & 31;
                // set vf to 0
                v[0xf] = 0;

                // for n rows
                for (let row = 0; row < n; row++) {
                    if (yCoord + row >= 32) {
                        break
                    }
                    let spriteByte = memory[i + row]
                    for (let bit = 0; bit < 8; bit++) {
                        if (xCoord + bit >= 64) {
                            break
                        }
                        let spritePixel = (spriteByte >> (7 - bit)) & 1
                        if (spritePixel == 1) {
                            if (screenImage.getPixel(xCoord + bit, yCoord + row) == 1) {
                                screenImage.setPixel(xCoord + bit, yCoord + row, 15)
                                v[0xf] = 1
                            } else {
                                screenImage.setPixel(xCoord + bit, yCoord + row, 1)
                            }
                            pause(1)
                        }
                    }
                }

                break;
            case 0x2:
                // subroutine
                // add pc to stack then set pc to nnn
                stack.push(pc);
                pc = nnn;
                break;
            case 0x3:
                // skip conditionally
                // skip 1 instruction if vx == nn
                if (v[x] == nn) {
                    pc += 2;
                }
                break;
            case 0x4:
                // skip conditionally
                // skip 1 instruction if vx != nn
                if (v[x] != nn) {
                    pc += 2;
                }
                break;
            case 0x5:
                // skip conditionally
                // skip 1 instruction if vx == vy
                if (v[x] == v[y]) {
                    pc += 2;
                }
                break;
            case 0x9:
                // skip conditionally
                // skip 1 instruction if vx != vy
                if (v[x] != v[y]) {
                    pc += 2;
                }
                break;
            case 0x8:
                if (n4 == 0x0) {
                    // set vx to vy
                    v[x] = v[y]
                } else if (n4 == 0x1) {
                    // binary or
                    // set vx to the OR of vx and vy
                    v[x] = v[x] | v[y]
                } else if (n4 == 0x2) {
                    // binary and
                    // set vx to the AND of vx and vy
                    v[x] = v[x] & v[y]
                } else if (n4 == 0x3) {
                    // binary xor
                    // set vx to the XOR of vx and vy
                    v[x] = v[x] ^ v[y]
                } else if (n4 == 0x4) {
                    // add
                    // set vx to vx + vy
                    let result = v[x] + v[y]
                    if (result > 255) {
                        v[0xf] = 1
                    } else {
                        v[0xf] = 0
                    }
                    v[x] = result & 0xFF
                } else if (n4 == 0x5) {
                    // subtract
                    // set vx to vx - vy
                    let result = v[x] - v[y]
                    if (result < 0) { // handle underflow
                        v[x] = result & 0xFF
                        v[0xf] = 0
                    } else {
                        v[x] = result
                        v[0xf] = 1
                    }
                } else if (n4 == 0x6) {
                    // subtract
                    // set vx to vy - vx
                    let result = v[y] - v[x]
                    if (result < 0) { // handle underflow
                        v[x] = result & 0xFF
                        v[0xf] = 0
                    } else {
                        v[x] = result
                        v[0xf] = 1
                    }
                }
                break;
        }       
    }
})