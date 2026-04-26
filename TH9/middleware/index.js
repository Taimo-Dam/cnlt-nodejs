const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized. Please login first." });
};

const validateStudent = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push("name must be at least 2 characters");
    }
  }

  if (!isUpdate || data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push("email must be a valid format");
    }
  }

  if (!isUpdate || data.age !== undefined) {
    const age = Number(data.age);
    if (isNaN(age) || age < 16 || age > 60) {
      errors.push("age must be between 16 and 60");
    }
  }

  return errors;
};

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
};

module.exports = { logger, requireLogin, validateStudent, errorHandler };