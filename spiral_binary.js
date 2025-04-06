function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`[onclick*="${id}"]`).classList.add('active');
  document.getElementById(id).classList.add('active');
}

function parseBinaryInput(text) {
  const lines = text.trim().split(/\n+/).map(line => line.trim());
  const size = lines.length;
  if (!lines.every(line => line.length === size)) return null;
  return lines.map(line => line.split('').map(Number));
}

function rotateCoords(coords, size, corner) {
  switch (corner) {
    case 'tr': return coords.map(([r, c]) => [c, size - 1 - r]);
    case 'br': return coords.map(([r, c]) => [size - 1 - r, size - 1 - c]);
    case 'bl': return coords.map(([r, c]) => [size - 1 - c, r]);
    case 'tl':
    default: return coords;
  }
}

function spiralCoordinates(n, inward, clockwise) {
  const coords = [];
  const visited = Array.from({ length: n }, () => Array(n).fill(false));
  const directions = clockwise
    ? [[0, 1], [1, 0], [0, -1], [-1, 0]]
    : [[1, 0], [0, -1], [-1, 0], [0, 1]];
  let r = 0, c = 0, dir = 0;

  for (let i = 0; i < n * n; i++) {
    coords.push([r, c]);
    visited[r][c] = true;
    let nr = r + directions[dir][0];
    let nc = c + directions[dir][1];
    if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc]) {
      r = nr; c = nc;
    } else {
      dir = (dir + 1) % 4;
      r += directions[dir][0];
      c += directions[dir][1];
    }
  }
  return inward ? coords.reverse() : coords;
}

function spiralOrder(matrix, corner, inward, clockwise) {
  const baseCoords = spiralCoordinates(matrix.length, inward, clockwise);
  const coords = rotateCoords(baseCoords, matrix.length, corner);
  return coords.map(([r, c]) => (matrix[r] ? matrix[r][c] : 0));
}

function binaryToAscii(bits) {
  const trimmed = bits.slice(0, Math.floor(bits.length / 8) * 8);
  const bytes = [];
  for (let i = 0; i < trimmed.length; i += 8) {
    const byte = trimmed.slice(i, i + 8).join('');
    const value = parseInt(byte, 2);
    if (value !== 0) bytes.push(String.fromCharCode(value));
  }
  return bytes.join('');
}

function decodeAllSpirals() {
  const input = document.getElementById("binaryInput").value;
  const matrix = parseBinaryInput(input);
  const output = document.getElementById("output");
  if (!matrix) {
    output.textContent = "Input must be a square block of binary.";
    return;
  }

  const corners = ['tl', 'tr', 'br', 'bl'];
  let found = false;
  let results = [];

  for (let inward of [true, false]) {
    for (let clockwise of [true, false]) {
      for (let corner of corners) {
        const bits = spiralOrder(matrix, corner, inward, clockwise);
        const text = binaryToAscii(bits);
        if (/^[\x20-\x7E\n\r\t]*$/.test(text)) {
          found = true;
          let direction = clockwise ? 'Clockwise' : 'Counter-Clockwise';
          let spiral = inward ? 'Outward' : 'Inward';
          results.push(`Corner: ${corner.toUpperCase()}, ${direction}, ${spiral}\n${text}\n`);
        }
      }
    }
  }

  output.textContent = found ? results.join('\n---\n') : "No valid ASCII decoding found.";
}

function decodeSingle() {
  const input = document.getElementById("binaryInput").value;
  const matrix = parseBinaryInput(input);
  const output = document.getElementById("output");
  if (!matrix) {
    output.textContent = "Input must be a square block of binary.";
    return;
  }

  const corner = document.getElementById("decodeCorner").value;
  const clockwise = document.getElementById("decodeDir").value === 'true';
  const inward = document.getElementById("decodeInward").value === 'true';

  const bits = spiralOrder(matrix, corner, inward, clockwise);
  const text = binaryToAscii(bits);
  output.textContent = text;
}

function encodeSpiral() {
  const text = document.getElementById("asciiInput").value;
  const corner = document.getElementById("cornerSelect").value;
  const clockwise = document.getElementById("dirSelect").value === 'true';
  const inward = document.getElementById("inwardSelect").value === 'true';

  const binaryStr = text.split('').map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join('');
  const binary = binaryStr.split('').map(Number);

  let size = Math.ceil(Math.sqrt(binary.length));
  while (size * size < binary.length) size++;

  const padded = binary.concat(Array(size * size - binary.length).fill(0));
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  const baseCoords = spiralCoordinates(size, inward, clockwise);
  const coords = rotateCoords(baseCoords, size, corner);

  for (let i = 0; i < padded.length; i++) {
    const [r, c] = coords[i];
    matrix[r][c] = padded[i];
  }

  const result = matrix.map(row => row.join('')).join('\n');
  document.getElementById("encodeOutput").textContent = result;
}