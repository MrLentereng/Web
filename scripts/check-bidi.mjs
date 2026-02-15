import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const blocked = new Set([
  0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069, 0x200e,
  0x200f, 0x061c, 0xfeff
]);

const skip = new Set(['.git', 'node_modules', 'dist']);
const root = process.cwd();
const findings = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    const buffer = readFileSync(full);
    if (buffer.includes(0x00)) continue;
    const text = buffer.toString('utf8');
    let line = 1;
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp === 10) line += 1;
      if (blocked.has(cp)) findings.push(`${full.replace(`${root}/`, '')}:${line} U+${cp.toString(16)}`);
    }
  }
}

walk(root);
if (findings.length) {
  console.error('Blocked bidi/hidden unicode characters found:');
  for (const item of findings) console.error(` - ${item}`);
  process.exit(1);
}
console.log('No blocked bidi/hidden unicode characters found.');
