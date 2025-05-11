module.exports = (action, getTargetId = () => null) => {
    return (req, res, next) => {
      res.on('finish', () => {
        console.log("logAction was called");
  
        if (req.user && res.statusCode < 400) {
          const targetId = getTargetId(req, res);
  
          console.log("Logging action:");
          console.log("User ID:", req.user.userId); // Use req.user
          console.log("Action:", action);
          console.log("Target ID:", targetId);
          console.log("User-Agent:", req.headers['user-agent']);
  
          const stmt = req.db.prepare(`
            INSERT INTO audit_logs (user_id, action, target_id, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)
          `);
          stmt.run(
            req.user.userId,  // FIXED
            action,
            targetId,
            req.ip || "unknown",
            req.headers['user-agent']
          );
        }
      });
  
      next();
    };
  };