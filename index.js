const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rootRouter = require("./routes/index");
const authRouter = require("./routes/authRoutes");

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://4tvmjlxv-3000.inc1.devtunnels.ms'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.use('/v1/admin', rootRouter);
// for web (patients)
app.use("/v1", authRouter)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));