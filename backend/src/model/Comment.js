const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    mapId: { type: mongoose.Schema.Types.ObjectId, required: true },
    comments: [{
        username: {type: String, required: true},
        body: {type: String, required: true},
        date: {type: String }
  }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);