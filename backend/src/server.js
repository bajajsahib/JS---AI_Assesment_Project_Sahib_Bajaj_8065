import app from './app.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Support Ticket API running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Stop the old backend first:`);
    console.error(`  netstat -ano | findstr :${PORT}`);
    console.error(`  taskkill /PID <pid> /F\n`);
    process.exit(1);
  }
  throw err;
});
