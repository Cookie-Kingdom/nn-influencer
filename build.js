const fs = require('fs');
const path = require('path');

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY'];
const SRC = path.join(__dirname, 'index.html');
const OUT_DIR = path.join(__dirname, 'dist');

// ตอนรันในเครื่องอ่านค่าจาก .env ให้ด้วย — บน Vercel ค่ามาจาก Environment Variables
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error('\nBuild failed: ยังไม่ได้ตั้งค่า ' + missing.join(', '));
  console.error('ตั้งที่ Vercel → Settings → Environment Variables');
  console.error('หรือสร้างไฟล์ .env ตามตัวอย่างใน .env.example ถ้ารันในเครื่อง\n');
  process.exit(1);
}

let html = fs.readFileSync(SRC, 'utf8');
for (const key of REQUIRED) {
  html = html.split('__' + key + '__').join(process.env[key]);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html);
console.log('built dist/index.html -> ' + process.env.SUPABASE_URL);
