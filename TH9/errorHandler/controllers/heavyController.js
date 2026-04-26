const heavySync = (req, res) => {
  const start = Date.now();
  console.log(`[SYNC] Request received at ${new Date().toISOString()}`);

  let result = 0;
  for (let i = 0; i < 1e8; i++) {
    result += Math.sqrt(i);
  }

  const duration = Date.now() - start;
  console.log(`[SYNC] Request completed in ${duration}ms`);

  res.json({
    type: "synchronous",
    message: "Blocking computation done",
    duration: `${duration}ms`,
    result: result.toFixed(2)
  });
};

// ASYNCHRONOUS - non-blocking using setTimeout
const heavyAsync = (req, res) => {
  const start = Date.now();
  console.log(`[ASYNC] Request received at ${new Date().toISOString()}`);

  // Simulate async I/O delay (e.g., DB call, file read)
  setTimeout(() => {
    const duration = Date.now() - start;
    console.log(`[ASYNC] Request completed in ${duration}ms`);

    res.json({
      type: "asynchronous",
      message: "Non-blocking async operation done",
      duration: `${duration}ms`,
      note: "Server remained responsive during this wait"
    });
  }, 2000);
};

module.exports = { heavySync, heavyAsync };