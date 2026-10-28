// The arena, drawn as a map. Each character is one column of blocks:
//   # wall (3 high)   X tower (4)   x block (2)   o low block (1)   . floor   P player start
const MAP = [
  "####################",
  "#..................#",
  "#..oo....XX....oo..#",
  "#..o..............o#",
  "#.......x..x.......#",
  "#..X....x..x....X..#",
  "#.....o......o.....#",
  "#..xx..........xx..#",
  "#........oo........#",
  "#...X....oo....X...#",
  "#..................#",
  "#..xx...x..x...xx..#",
  "#.....o......o.....#",
  "#..X............X..#",
  "#.......xxxx.......#",
  "#..o............o..#",
  "#..oo....XX....oo..#",
  "#..................#",
  "#........P.........#",
  "####################",
];

const HEIGHTS = { "#": 3, X: 4, x: 2, o: 1 };

export const CELL = 2; // block width and depth in world units

// Block faces are 3:4 (width:height), matching Instagram's current grid.
// Set to 1 for cubes. Images are cropped to this shape in ShooterStage.js.
export const BLOCK_ASPECT = 3 / 4;
export const BLOCK_HEIGHT = CELL / BLOCK_ASPECT;

export const columnKey = (cx, cz) => `${cx},${cz}`;

// Map centred on the origin: cell (cx, cz) sits at world (cx * CELL, cz * CELL)
const OFFSET_X = Math.floor(MAP[0].length / 2);
const OFFSET_Z = Math.floor(MAP.length / 2);

export function buildLevel(textureCount) {
  const blocks = [];
  let spawn = { x: 0, z: 0 };
  let id = 0;

  MAP.forEach((row, rowIndex) => {
    [...row].forEach((char, colIndex) => {
      const cx = colIndex - OFFSET_X;
      const cz = rowIndex - OFFSET_Z;
      if (char === "P") spawn = { x: cx * CELL, z: cz * CELL };
      const height = HEIGHTS[char] || 0;
      for (let y = 0; y < height; y++) {
        blocks.push({
          id: id++,
          cx,
          cz,
          y,
          // spread the images so neighbouring blocks differ
          texture: textureCount ? (cx * 7 + cz * 13 + y * 5 + 1000) % textureCount : 0,
        });
      }
    });
  });

  const bounds = {
    minX: (0 - OFFSET_X) * CELL,
    maxX: (MAP[0].length - 1 - OFFSET_X) * CELL,
    minZ: (0 - OFFSET_Z) * CELL,
    maxZ: (MAP.length - 1 - OFFSET_Z) * CELL,
  };

  return { blocks, spawn, bounds };
}

// Remove a block and let everything stacked above it drop one level
export function destroyBlock(blocks, id) {
  const hit = blocks.find((block) => block.id === id);
  if (!hit) return blocks;
  return blocks
    .filter((block) => block.id !== id)
    .map((block) =>
      block.cx === hit.cx && block.cz === hit.cz && block.y > hit.y
        ? { ...block, y: block.y - 1 }
        : block
    );
}

// Columns that still have blocks, for player collision
export function solidColumns(blocks) {
  const solid = new Set();
  blocks.forEach((block) => solid.add(columnKey(block.cx, block.cz)));
  return solid;
}

// How many blocks each column holds, for stacking new blocks on top
export function columnHeights(blocks) {
  const heights = new Map();
  blocks.forEach((block) => {
    const key = columnKey(block.cx, block.cz);
    heights.set(key, (heights.get(key) || 0) + 1);
  });
  return heights;
}
