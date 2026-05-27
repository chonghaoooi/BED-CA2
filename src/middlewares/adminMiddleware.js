// Admin middleware: only user_id 1 (admin) can access admin routes
module.exports.requireAdmin = (req, res, next) => {
  if (res.locals.userId !== 1) {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};
