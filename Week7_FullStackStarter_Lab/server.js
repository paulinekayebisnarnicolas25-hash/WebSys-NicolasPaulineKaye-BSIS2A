const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const helmet = require('helmet'); // xss-clean removed: incompatible with Express 5 (read-only req.query). Using express-validator .escape() instead.
const rateLimit = require('express-rate-limit'); 

const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const authRoutes = require('./routes/authRoutes');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.json());


const protect = require('./middleware/authMiddleware');

app.get('/secure-data', protect, (req, res) => {
  res.json({ message: 'You accessed protected data', user: req.user });
});

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5,
  message: { message: 'Too many requests, try again later' }
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes); 


app.use(express.static(path.join(__dirname, "public")));


app.use("/api/users", usersRouter);

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRoutes);
// Test route
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