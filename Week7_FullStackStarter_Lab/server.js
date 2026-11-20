const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const authRoutes = require('./routes/authRoutes');
const protect = require('./middleware/authMiddleware');

const app = express();

// Helmet with the Bootstrap CDN allowed (needed for the PWA service worker)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"]
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: xss-clean removed: incompatible with Express 5 (read-only req.query).
// XSS is handled with express-validator .escape() in routes/authRoutes.js instead.

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { message: 'Too many requests, try again later' }
});
app.use('/api/auth/login', loginLimiter);

app.get('/secure-data', protect, (req, res) => {
  res.json({ message: 'You accessed protected data' });
});

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

async function start() {
try {
await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected");

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Welcome to My Deployed App');
});

app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (err) {
console.error("Startup error:", err.message);
process.exit(1);
}
}

start();