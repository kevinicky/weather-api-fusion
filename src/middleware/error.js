export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);

  if (err.message.includes('not found')) {
    return res.status(404).json({ error: err.message });
  }

  if (err.message.includes('Provide either')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({
    error: err.message || 'Internal server error'
  });
}
