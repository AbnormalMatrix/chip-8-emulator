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

let mySprite = sprites.create(img`
    .413861.1621.63.fa2282216a318221622162216221612.a6
    ..d.1ff31ed.2ff31e7..83.4.1218..eeffffffffff3c.8.9
    .9.9.9.9.9.9.9f8fcfffffffffffffff8c.........f.f8fe
    ffff.f.7e7262424242424e4.4.efffffffffce...........
    .1.7.3.3.1..8.e.f.ff1.1.fc8c8484f41c1cfffef.8....1
    .7.f1f7ffffefcf.f.f.f878783cff3.2.e6e6e6a6a6e.f.df
    7f4.4.f9e9f9c.c.ff.7.f.ff8f8f8f.f.f.e1e3e2467e4242
    7e4e42f2dfff.3.39e9c9e.2.3ff.f.7.71f1f3f7ffffcf8fb
    .e.464.4.c6464.4.efbc.f8ff7f3f.f.7.3..8.c.e.f8f.c.
    8.......ff.8.8f91818f9f9.9.9ff......e.fcffffffff7f
    3f.f...........1.fff3f1f9f3f1f9f9f9.9.f...........
    8.f.feffffffff....8.f.f83...............f.f.......
    ........1ffff8c..........e.7.1....................
    ...............ffce........1.71e38.2.381c.7.18.c..
    .......8.............ef.8..1.6183.e.81.3.6.4.8.888
    8444442.....................4.....8.........8.8..8
    1111c6c4c4888888911...24.........83c1..4.........4
    .....1.11..8.8181.3.6.c.83.6.4....................
    c.38.7814.3.18.c.781c.6..7.e3c7.c.8...............
    ................e.7c.f.3....8.c.7.8..........1.f1f
    .c.............f.f.f..........8.f.7e1f.7....e.f87e
    .f............8.f.f..............17fffe...........
    .1.7.1....8......2..........c.c..........3fff.....
    ...1.71e78e.c.81c.6.3..8.4.2............7..8.....8
    f....1.6186.c1.3.6.c183884844442222212..........4.
    ..4...............6.8.8.....3122622123224644444848
    1.1..........4..2.28.1.....1.9........21111..6.c.8
    1.2.4.81.....................4..c.38.e83c.6.3.18.e
    .783...1.3.f3c7.c.......................1f......8.
    f.3c.f.3....8.7cf.c............3.f.f..............
    ff3f..........8.e.f83f.f1f.7.1..........e.f.7.....
    ..........fffe8............3.f7ef8..c.e.78.6.3.1..
    ....c.c............4fc.........71ef8e.8.....7.3818
    .c.6.3c1..........7..8.....8.....1.e38e.81.2.4.83.
    6.c.42622231111189........4.........4.....8.....8.
    ........4244841.1.1121222224...8..........2....44.
    ...1.....2.1......462223c183.7.e183.6.............
    ...........7..4.3..c.3814.2.1..8.cc.8......3.f3c..
    ....................e.7f.7......c.7.3c.f.3.1.3.f3f
    f8e.8............f.f............c.ff7f.3..........
    c.f...........c.f.f.1.............f.f.f8..........
    ...73ffcf.8...f.381e.7.1......c.c.................
    .......31ff8e........1.7.c.4.6.381e.3.........7..8
    .....8.....1.e7.c..1.6.c187.c.81.3311111.8888844..
    ..........4...4...2.8.....8.1.........8488.8.8.8.8
    1.1111.22424.8........1....81......1.......1....88
    c4c42.6.c.81.7.c18......................38.78.4.3.
    .c.683c.6.3.1.387.c.8......3......................
    ..8.f81f.3....8.c.7.3c.e.......71f7ef.............
    .f.f............8.fc7f.f.1........................
`, SpriteKind.Player)

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
    // Offset 0x00000000 to 0x000004D7
    0x61, 0x01, 0x62, 0x10, 0x63, 0x0F, 0xA2, 0x28, 0x22, 0x16, 0xA3, 0x18,
    0x22, 0x16, 0x22, 0x16, 0x22, 0x16, 0x22, 0x16, 0x12, 0x0A, 0x60, 0x00,
    0xD0, 0x1F, 0xF3, 0x1E, 0xD0, 0x2F, 0xF3, 0x1E, 0x70, 0x08, 0x30, 0x40,
    0x12, 0x18, 0x00, 0xEE, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x3C, 0x08, 0x09,
    0x09, 0x09, 0x09, 0x09, 0x09, 0x09, 0x09, 0xF8, 0xFC, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xF8, 0xC0, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xF8,
    0xFE, 0xFF, 0xFF, 0x0F, 0x07, 0xE7, 0x26, 0x24, 0x24, 0x24, 0x24, 0x24,
    0xE4, 0x04, 0x0E, 0xFF, 0xFF, 0xFF, 0xFF, 0xFC, 0xE0, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x01, 0x07, 0x03, 0x03, 0x01, 0x00, 0x80, 0xE0, 0xF0, 0xFF,
    0x10, 0x10, 0xFC, 0x8C, 0x84, 0x84, 0xF4, 0x1C, 0x1C, 0xFF, 0xFE, 0xF0,
    0x80, 0x00, 0x01, 0x07, 0x0F, 0x1F, 0x7F, 0xFF, 0xFE, 0xFC, 0xF0, 0xF0,
    0xF0, 0xF8, 0x78, 0x78, 0x3C, 0xFF, 0x30, 0x20, 0xE6, 0xE6, 0xE6, 0xA6,
    0xA6, 0xE0, 0xF0, 0xDF, 0x7F, 0x40, 0x40, 0xF9, 0xE9, 0xF9, 0xC0, 0xC0,
    0xFF, 0x07, 0x0F, 0x0F, 0xF8, 0xF8, 0xF8, 0xF0, 0xF0, 0xF0, 0xE1, 0xE3,
    0xE2, 0x46, 0x7E, 0x42, 0x42, 0x7E, 0x4E, 0x42, 0xF2, 0xDF, 0xFF, 0x03,
    0x03, 0x9E, 0x9C, 0x9E, 0x02, 0x03, 0xFF, 0x0F, 0x07, 0x07, 0x1F, 0x1F,
    0x3F, 0x7F, 0xFF, 0xFC, 0xF8, 0xFB, 0x0E, 0x04, 0x64, 0x04, 0x0C, 0x64,
    0x64, 0x04, 0x0E, 0xFB, 0xC0, 0xF8, 0xFF, 0x7F, 0x3F, 0x0F, 0x07, 0x03,
    0x00, 0x80, 0xC0, 0xE0, 0xF8, 0xF0, 0xC0, 0x80, 0x00, 0x00, 0x00, 0xFF,
    0x08, 0x08, 0xF9, 0x18, 0x18, 0xF9, 0xF9, 0x09, 0x09, 0xFF, 0x00, 0x00,
    0x00, 0xE0, 0xFC, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F, 0x3F, 0x0F, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x0F, 0xFF, 0x3F, 0x1F, 0x9F, 0x3F, 0x1F, 0x9F,
    0x9F, 0x90, 0x90, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xF0, 0xFE,
    0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x80, 0xF0, 0xF8, 0x30, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x1F, 0xFF, 0xF8, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x0E, 0x07,
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0F, 0xFC, 0xE0, 0x00, 0x00, 0x00,
    0x01, 0x07, 0x1E, 0x38, 0x02, 0x03, 0x81, 0xC0, 0x70, 0x18, 0x0C, 0x00,
    0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0E, 0xF0,
    0x80, 0x01, 0x06, 0x18, 0x30, 0xE0, 0x81, 0x03, 0x06, 0x04, 0x08, 0x08,
    0x88, 0x84, 0x44, 0x44, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x80,
    0x80, 0x08, 0x11, 0x11, 0xC6, 0xC4, 0xC4, 0x88, 0x88, 0x88, 0x91, 0x10,
    0x00, 0x24, 0x00, 0x00, 0x00, 0x00, 0x08, 0x3C, 0x10, 0x04, 0x00, 0x00,
    0x00, 0x00, 0x04, 0x00, 0x00, 0x01, 0x01, 0x10, 0x08, 0x08, 0x18, 0x10,
    0x30, 0x60, 0xC0, 0x83, 0x06, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0xC0, 0x38, 0x07, 0x81, 0x40, 0x30, 0x18, 0x0C,
    0x07, 0x81, 0xC0, 0x60, 0x07, 0x0E, 0x3C, 0x70, 0xC0, 0x80, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xE0, 0x7C, 0x0F, 0x03, 0x00, 0x00, 0x80, 0xC0, 0x70, 0x80, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x0F, 0x1F, 0x0C, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x0F, 0x0F, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xF0, 0x7E,
    0x1F, 0x07, 0x00, 0x00, 0xE0, 0xF8, 0x7E, 0x0F, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x80, 0xF0, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x7F, 0xFF, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x00,
    0x00, 0x80, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0xC0,
    0x00, 0x00, 0x00, 0x00, 0x03, 0xFF, 0xF0, 0x00, 0x00, 0x00, 0x01, 0x07,
    0x1E, 0x78, 0xE0, 0xC0, 0x81, 0xC0, 0x60, 0x30, 0x08, 0x04, 0x02, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x70, 0x08, 0x00, 0x00, 0x08, 0xF0, 0x00,
    0x01, 0x06, 0x18, 0x60, 0xC1, 0x03, 0x06, 0x0C, 0x18, 0x38, 0x84, 0x84,
    0x44, 0x42, 0x22, 0x22, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00,
    0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x80, 0x80, 0x00,
    0x00, 0x31, 0x22, 0x62, 0x21, 0x23, 0x22, 0x46, 0x44, 0x44, 0x48, 0x48,
    0x10, 0x10, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x20, 0x28, 0x01, 0x00,
    0x00, 0x01, 0x09, 0x00, 0x00, 0x00, 0x00, 0x21, 0x11, 0x10, 0x06, 0x0C,
    0x08, 0x10, 0x20, 0x40, 0x81, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x04, 0x00, 0xC0, 0x38, 0x0E, 0x83, 0xC0, 0x60, 0x30,
    0x18, 0x0E, 0x07, 0x83, 0x00, 0x01, 0x03, 0x0F, 0x3C, 0x70, 0xC0, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x00,
    0x00, 0x00, 0x80, 0xF0, 0x3C, 0x0F, 0x03, 0x00, 0x00, 0x80, 0x7C, 0xF0,
    0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x0F, 0x0F, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0xFF, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
    0xE0, 0xF8, 0x3F, 0x0F, 0x1F, 0x07, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xE0, 0xF0, 0x70, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFE,
    0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x0F, 0x7E, 0xF8, 0x00, 0xC0,
    0xE0, 0x78, 0x06, 0x03, 0x01, 0x00, 0x00, 0x00, 0xC0, 0xC0, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x04, 0xFC, 0x00, 0x00, 0x00, 0x00, 0x07, 0x1E, 0xF8,
    0xE0, 0x80, 0x00, 0x00, 0x70, 0x38, 0x18, 0x0C, 0x06, 0x03, 0xC1, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x70, 0x08, 0x00, 0x00, 0x08, 0x00, 0x00, 0x01,
    0x0E, 0x38, 0xE0, 0x81, 0x02, 0x04, 0x08, 0x30, 0x60, 0xC0, 0x42, 0x62,
    0x22, 0x31, 0x11, 0x11, 0x89, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00,
    0x00, 0x00, 0x40, 0x00, 0x00, 0x80, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00,
    0x00, 0x42, 0x44, 0x84, 0x10, 0x10, 0x11, 0x21, 0x22, 0x22, 0x24, 0x00,
    0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x04, 0x40, 0x00, 0x01,
    0x00, 0x00, 0x02, 0x01, 0x00, 0x00, 0x00, 0x46, 0x22, 0x23, 0xC1, 0x83,
    0x07, 0x0E, 0x18, 0x30, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x07, 0x00, 0x40, 0x30, 0x0C, 0x03, 0x81, 0x40,
    0x20, 0x10, 0x08, 0x0C, 0xC0, 0x80, 0x00, 0x00, 0x03, 0x0F, 0x3C, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE0, 0x7F,
    0x07, 0x00, 0x00, 0x00, 0xC0, 0x70, 0x3C, 0x0F, 0x03, 0x01, 0x03, 0x0F,
    0x3F, 0xF8, 0xE0, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0F, 0x0F, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0xFF, 0x7F, 0x03, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xC0, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0xF0, 0xF0,
    0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xF0, 0xF8, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x07, 0x3F, 0xFC, 0xF0, 0x80, 0x00, 0xF0, 0x38,
    0x1E, 0x07, 0x01, 0x00, 0x00, 0x00, 0xC0, 0xC0, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x1F, 0xF8, 0xE0, 0x00,
    0x00, 0x00, 0x01, 0x07, 0x0C, 0x04, 0x06, 0x03, 0x81, 0xE0, 0x30, 0x00,
    0x00, 0x00, 0x00, 0x70, 0x08, 0x00, 0x00, 0x08, 0x00, 0x00, 0x01, 0x0E,
    0x70, 0xC0, 0x01, 0x06, 0x0C, 0x18, 0x70, 0xC0, 0x81, 0x03, 0x31, 0x11,
    0x11, 0x08, 0x88, 0x88, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x00, 0x40, 0x00, 0x20, 0x80, 0x00, 0x00, 0x80, 0x10, 0x00, 0x00, 0x00,
    0x00, 0x84, 0x88, 0x08, 0x08, 0x08, 0x08, 0x10, 0x11, 0x11, 0x02, 0x24,
    0x24, 0x08, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x08, 0x10, 0x00, 0x00,
    0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x88, 0xC4, 0xC4, 0x20, 0x60,
    0xC0, 0x81, 0x07, 0x0C, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x38, 0x07, 0x80, 0x40, 0x30, 0x0C, 0x06, 0x83,
    0xC0, 0x60, 0x30, 0x10, 0x38, 0x70, 0xC0, 0x80, 0x00, 0x00, 0x03, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
    0xF8, 0x1F, 0x03, 0x00, 0x00, 0x80, 0xC0, 0x70, 0x3C, 0x0E, 0x00, 0x00,
    0x00, 0x07, 0x1F, 0x7E, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0F,
    0x0F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xFC, 0x7F, 0x0F, 0x01,
    0x00, 0x00, 0x00, 0x00
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
// timer.background(function() {
//     while (true) {
//         // delay for 1/60 of a second 
//         pause(16.67)
//         console.log("hi")
//         if (delayTimer > 0) {
//             delayTimer -= 1;
//         }
//         if (soundTimer > 0) {
//             soundTimer -= 1;
//         }
//     }
// })

// set the screen image to a blank image
let screenImage = image.create(64, 32);
screenImage.fillRect(0, 0, 64, 32, 15);

let rt = 0
game.onUpdateInterval(500, function() {
    console.log('hi')
})
game.pushScene()

forever(function() {
    scene.setBackgroundImage(screenImage);
})

let lastTime = game.runtime()
let cycleCount = 0
// main loop
timer.background(function() {
    while (true) {
        cycleCount += 1
        if (cycleCount == 1000) {
            pause(0)
            cycleCount = 0
            let newTime = game.runtime()
            if (newTime - lastTime > 16) {
                lastTime = newTime
                if (delayTimer > 0) {
                    delayTimer -= 1
                }
                if (soundTimer > 0) {
                    soundTimer -= 1
                }
            }
        }
        // if (game.runtime() - lastTime > 16) {
        //     lastTime = game.runtime()
        //     if (delayTimer > 0) {
        //         delayTimer -= 1
        //     }
        //     if (soundTimer > 0) {
        //         soundTimer -= 1
        //     }
        // }

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
                let xCoord = v[x];
                let yCoord = v[y];

                // Early out if sprite would be fully off-screen
                if (xCoord >= 64 || yCoord >= 32) return;

                // Set VF to 0
                v[0xF] = 0;

                // Draw sprite row by row
                for (let row = 0; row < n; row++) {
                    if (yCoord + row >= 32) break;

                    let spriteByte = memory[i + row];

                    for (let bit = 0; bit < 8; bit++) {
                        if (xCoord + bit >= 64) break;

                        let spritePixel = (spriteByte >> (7 - bit)) & 1;
                        if (spritePixel == 1) {
                            let px = xCoord + bit;
                            let py = yCoord + row;
                            let currentPixel = screenImage.getPixel(px, py)
                            if (currentPixel != 1) {
                                currentPixel = 0
                            } else {
                                currentPixel = 1
                            }
                            let newPixel = currentPixel ^ 1
                            if (currentPixel == 1 && newPixel == 0) {
                                v[0xf] = 1
                            }

                            if (newPixel) {
                                screenImage.setPixel(px, py, 1)
                            } else {
                                screenImage.setPixel(px, py, 15)
                            }
                            cycleCount = 999
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
                } else if (n4 == 0x7) {
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
                } else if (n4 == 0x6) {
                    // shift right
                    v[x] >> 1
                } else if (n4 == 0xE) {
                    // shift left
                    v[x] << 1
                }
                break;
            case 0xB:
                // jump with offset
                pc = nnn + v[0x0]
                break;
            case 0xC:
                // random
                v[x] = randint(0, 255) & nn
                break;
            case 0xE:
                // skip if key
                if (n3 == 0x9 && n4 == 0xE) {
                    // jump if the key is pressed
                    if (checkIfKeyPressed(x)) {
                        pc += 2
                    }
                } else if (n3 == 0xA && n4 == 0x1) {
                    // jump if the key is not pressed
                    if (!checkIfKeyPressed(x)) {
                        pc += 2
                    }
                }
                
                break;
            case 0xF:
                if (n3 == 0x0 && n4 == 0x7) {
                    v[x] = delayTimer
                } else if (n3 == 0x1 && n4 == 0x5) {
                    delayTimer = v[x]
                } else if (n3 == 0x1 && n4 == 0x8) {
                    soundTimer = v[x]
                } else if (n3 == 0x1 && n4 == 0xE) {
                    // add to index
                    i += v[x]
                    if (i > 0x0FFF) {
                        v[0xf] = 1
                    } else {
                        v[0xf] = 0
                    };
                } else if (n3 == 0x0 && n4 == 0xA) {
                    // get key
                    let pressedKey = getPressedKeys()
                    if (pressedKey) {
                        v[x] = pressedKey
                    } else {
                        pc -= 2
                    } 
                } else if (n3 == 0x2 && n4 == 0x9) {
                    // font character
                    i = fontOffset + (v[x] & 0x0F) * 5
                } else if ( n3 == 0x3 && n4 == 0x3) {
                    // binary coded decimal conversion
                    let hundreds = Math.floor(v[x] / 100)
                    let tens = Math.floor((v[x] % 100) / 10)
                    let ones = Math.floor(v[x] % 10)

                    memory[i] = hundreds
                    memory[i+1] = tens
                    memory[i+2] = ones
                } else if (n3 == 0x5 && n4 == 0x5) {
                    // write to memory
                    for (let j = 0; j <= x; j++) {
                        memory[i + j] = v[j];
                    }
                } else if (n3 == 0x6 && n4 == 0x5) {
                    // read from memory
                    for (let j = 0; j <= x; j++) {
                        v[j] = memory[i + j];
                    }
                }
                break;
        }       
    }
})

function checkIfKeyPressed(key: number) {
    switch (key) {
        case 0x0:
            return browserEvents.X.isPressed()
            break;
        case 0x1:
            return browserEvents.One.isPressed()
            break;
        case 0x2:
            return browserEvents.Two.isPressed()
            break;
        case 0x3:
            return browserEvents.Three.isPressed()
            break;
        case 0x4:
            if (browserEvents.Q.isPressed()) {
                console.log("Q!")
            }
            return browserEvents.Q.isPressed()
            break;
        case 0x5:
            return browserEvents.W.isPressed()
            break;
        case 0x6:
            return browserEvents.E.isPressed()
            break;
        case 0x7:
            return browserEvents.A.isPressed()
            break;
        case 0x8:
            return browserEvents.S.isPressed()
            break;
        case 0x9:
            return browserEvents.D.isPressed()
            break;
        case 0xA:
            return browserEvents.Z.isPressed()
            break;
        case 0xB:
            return browserEvents.C.isPressed()
            break;
        case 0xC:
            return browserEvents.Four.isPressed()
            break;
        case 0xD:
            return browserEvents.R.isPressed()
            break;
        case 0xE:
            return browserEvents.F.isPressed()
            break;
        case 0xF:
            return browserEvents.V.isPressed()
            break;

    }
    return false
}

function getPressedKeys() {
    if (browserEvents.X.isPressed()) { return 0x0; }
    if (browserEvents.One.isPressed()) { return 0x1; }
    if (browserEvents.Two.isPressed()) { return 0x2; }
    if (browserEvents.Three.isPressed()) { return 0x3; }
    if (browserEvents.Q.isPressed()) { return 0x4; }
    if (browserEvents.W.isPressed()) { return 0x5; }
    if (browserEvents.E.isPressed()) { return 0x6; }
    if (browserEvents.A.isPressed()) { return 0x7; }
    if (browserEvents.S.isPressed()) { return 0x8; }
    if (browserEvents.D.isPressed()) { return 0x9; }
    if (browserEvents.Z.isPressed()) { return 0xA; }
    if (browserEvents.C.isPressed()) { return 0xB; }
    if (browserEvents.Four.isPressed()) { return 0xC; }
    if (browserEvents.R.isPressed()) { return 0xD; }
    if (browserEvents.F.isPressed()) { return 0xE; }
    if (browserEvents.V.isPressed()) { return 0xF; }

    return null;
}
