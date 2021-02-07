import { connect, connection } from "mongoose";

const options = {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  useNewUrlParser: true,
};

connect(`${process.env.DB_CONNECTION_STRING}`, options).catch((e) => {
  console.error("Connection error", e.message);
});

const db = connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

module.exports = db;
