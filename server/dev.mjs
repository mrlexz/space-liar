import {spawn} from 'node:child_process';
import {server} from './index.mjs';

// Start the API first so Vite can proxy to its actual port.
server.on('error', error => {
  if (error.code === 'EADDRINUSE' && !process.env.PORT) {
    console.log('API port 3001 is busy; choosing an available port.');
    server.listen(0, '127.0.0.1');
  } else {
    console.error(`Cannot start API: ${error.message}`);
    process.exitCode = 1;
  }
});
server.once('listening', () => {
  const port = server.address().port;
  console.log(`Office Bluff API: http://127.0.0.1:${port}`);
  const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js'], {
    stdio: 'inherit',
    env: {...process.env, OFFICE_BLUFF_API_PORT: String(port)},
  });
  let stopping = false;
  function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    vite.kill();
    server.close();
    process.exitCode = code;
  }
  vite.on('error', error => { console.error(error.message); stop(1); });
  vite.on('exit', code => stop(code ?? 0));
  process.on('SIGINT', () => stop());
  process.on('SIGTERM', () => stop());
});
server.listen(Number(process.env.PORT ?? 3001), '127.0.0.1');
