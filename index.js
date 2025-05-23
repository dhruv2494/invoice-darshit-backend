const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const { connectDatabase } = require("./database/db");
const routes = require("./router/index");
const errorMiddleware = require("./utils/default/globalErrorHandler");
dotenv.config();
const app = express();
const port = process.env.PORT || 7001;

//CORS to handle credentials + specific origin
app.use(cors());
// Body parser and cookie parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Database Connection
const pool = connectDatabase();
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

app.get("/", (req, res) => {
  res.send("Invoice Server Is Running");
});
//Routes and error Middleware
app.use(routes);
app.use(errorMiddleware);
//Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
