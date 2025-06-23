// set the game's resolution to 64x32
namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 64;
    export const ARCADE_SCREEN_HEIGHT = 32;
}

// stack - since this is javascript it will just be a list of numbers
let stack: number[] = []

// general purpose registers v0-vf
let v: number[] = [];


// 4096 bytes (4kb) of memory
let memory: number[] = [];
for (let j = 0; j < 4096; j++) {
    memory[j] = 0;
}

// program counter
let pc = 0
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
	0xBF, 0x00, 0xFB, 0x00, 0xF3, 0x00, 0xE3, 0x00, 0x43, 0xE0, 0x00, 0xE0,
	0x00, 0x80, 0x00, 0x80, 0x00, 0x80, 0x00, 0x80, 0x00, 0xE0, 0x00, 0xE0
];

// load the data into memory
for (let j = 0; j < data.length; j++) {
    memory[j] = data[j];
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
screenImage.fillRect(0, 0, 64, 32, 0);

game.onUpdate(function() {
    scene.setBackgroundImage(screenImage);
})

// main loop
timer.background(function() {
    while (true) {
        // fetch
        let currentIntructionA = memory[pc];
        let currentInstructionB = memory[pc+1];
        let currentInstruction = currentIntructionA << 8 | currentInstructionB;

        pc += 2

        // decode
        // the opcode is the first 4 bytes (nybble)
        let opcode = (currentInstruction >> 12) & 0xF;
        let n2 = (currentInstruction >> 8) & 0xF;
        let n3 = (currentInstruction >> 4) & 0xF;
        let n4 = currentInstruction &0xf;

        let x = n2;
        let y = n3;
        let n = n4;
        let nn = (n3 << 4) | n4;
        let nnn = ((n2 << 8) | (n3 << 4) | n4);
        // execute

        switch (opcode) {
            case 0x0 :
                if (currentInstruction === 0x00E0) {
                    // clear screen
                    screenImage.fillRect(0, 0, 64, 32, 0);
                }
                break;
            case 0x1 :
                // jump to nnn
                pc = nnn;
                break;
            case 0x6 :
                // set vx to nn
                v[x] = nn;
                break;
            case 0x7 :
                // add nn to vx
                v[x] = v[x] + nn
                break;
            case 0xA :
                // set index register to nnn
                i = nnn;
                break;
            case 0xD :
                // draw to the screen at vx, vy with value n
                let xCoord = v[x] & 63;
                let yCoord = v[y] & 31;
                v[0xF] = 0;
                for (let row = 0; row < n; row++) {
                    // Get the byte of sprite data for the current row from memory[I + row]
                    let spriteDataByte = memory[i + row];

                    // Calculate the actual Y coordinate for this row, with wrapping
                    // This is the *current* Y position for drawing
                    let currentY = (xCoord + row) % 32; // Wrap around the 32-pixel height

                    // Loop through each bit (pixel) in the current sprite data byte (8 bits wide)
                    for (let bitPosition = 0; bitPosition < 8; bitPosition++) {
                        // Calculate the actual X coordinate for this pixel, with wrapping
                        // This is the *current* X position for drawing
                        let currentX = (yCoord + bitPosition) % 64; // Wrap around the 64-pixel width

                        // Get the value of the current bit (0 or 1)
                        // We read bits from left to right (most significant bit first)
                        const spritePixelIsSet = (spriteDataByte >> (7 - bitPosition)) & 1;

                        // Get the current pixel state on the display
                        const screenPixelIsSet = screenImage.getPixel(currentX, currentY); // Assuming 0 for off, 1 for on

                        // Chip-8 uses XOR drawing:
                        // If the sprite pixel is 1:
                        if (spritePixelIsSet) {
                            // If the screen pixel is also 1 (collision), turn it off
                            if (screenPixelIsSet) {
                                screenImage.setPixel(currentX, currentY, 0); // Turn pixel OFF
                                v[0xF] = 1; // Set collision flag
                            } else {
                                // If the screen pixel is 0, turn it on
                                screenImage.setPixel(currentX, currentY, 1); // Turn pixel ON
                            }
                        }
                        // If spritePixelIsSet is 0, do nothing (pixel remains as it is)
                    }
                }

            break;
        }
    }
})