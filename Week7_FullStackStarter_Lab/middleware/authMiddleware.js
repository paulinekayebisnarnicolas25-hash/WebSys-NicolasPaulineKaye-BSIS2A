module.exports = (req, res, next) => {
  if (!req.headers.role) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  next();
};