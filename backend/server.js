const mongoose = require("mongoose"),
  path = require("path"),
  envPath = path.resolve(__dirname, ".", ".env"),
  dotenv = require("dotenv").config({ path: envPath }),
  PORT = process.env.PORT,
  app = require("./src/app");

mongoose
  .connect(process.env.DATABASE, { useNewUrlParser: true })
  .then((res) => {
    console.log("Mongo connected");
  })
  .catch((err) => {
    console.log(err);
  });
  // mongoose.set('debug', true);

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
