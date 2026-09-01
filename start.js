import { spawn } from 'child_process';

console.log('--- KHỞI ĐỘNG HỆ THỐNG QUẢN LÝ DÂN CƯ (DCid) ---');

// 1. Start Backend Server
const server = spawn('node', ['server/index.js'], { stdio: 'inherit', shell: true });

// 2. Start Frontend Vite Dev Server
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  server.kill();
  vite.kill();
  process.exit();
});
