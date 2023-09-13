const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MapSchema = new Schema(
  { any: Schema.Types.Mixed },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("Map", MapSchema);