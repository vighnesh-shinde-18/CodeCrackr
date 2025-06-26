const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const db = require("./config/db");

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);


const allowedOrigins = process.env.FRONTEND_URL;

console.log("Allowed Origins:", allowedOrigins);


app.use(cors({
  origin: function (origin, callback) {
    console.log("🔍 Incoming origin:", origin);
    if (!origin) return callback(null, true); // Allow tools like Postman
    if (allowedOrigins == origin) {
      console.log("✅ CORS allowed for:", origin);
      return callback(null, true);
    } else {
      console.log("❌ CORS blocked for:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

 
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
 

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai/interactions", interactionRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
