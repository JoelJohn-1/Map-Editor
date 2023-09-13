const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const KeySchema = new Schema(
  {
    key: { type: String, required: true },
    email: { type: String, required: true },
    "expireAt": { type: Date, expires: 300 }
  }
);

module.exports = mongoose.model("Key", KeySchema);