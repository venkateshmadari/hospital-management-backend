const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rootRouter = require("./routes/doctor/index");
const patientRouter = require("./routes/patient/index");
const path = require("path");

dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://your-production-domain.com",
  "https://hospital-management-website-nine.vercel.app",
  "https://hospital-management-dashboard-nu.vercel.app",
  "https://0fp8zzd0-3030.inc1.devtunnels.ms"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/v1/admin", rootRouter);
// for web (patients)
app.use("/v1", patientRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
