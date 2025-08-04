const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rootRouter = require("./routes/index");
const authRouter = require("./routes/authRoutes");
const path = require('path');

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/v1/admin', rootRouter);
// for web (patients)
app.use("/v1", authRouter)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));