const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route lama helin - ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === "P2002") {
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : err.meta?.target;
    return res.status(400).json({ message: `Qiimahan (${field}) horey ayaa loo isticmaalay.` });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Diiwaanka lama helin." });
  }
  if (err.code === "P2003") {
    return res.status(400).json({ message: "Xiriirka xogta (reference) khalad ah." });
  }

  res.status(err.statusCode || 500).json({ message: err.message || "Khalad server-ka ah ayaa dhacay." });
};

module.exports = { notFound, errorHandler };
