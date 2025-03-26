require("dotenv").config();

module.exports = (req, res, next) => {
  // Check for API Key in Authorization header for routes that need it
  console.log(req.path);
  if (req.path.startsWith("/django-orders")) {
    const authHeader = req.headers.authorization;
    console.log(process.env.API_KEY);

    if (!authHeader || authHeader !== process.env.API_KEY) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }
  }

  next();
};
