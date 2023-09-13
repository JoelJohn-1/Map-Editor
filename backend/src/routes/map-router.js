const express = require("express");
const auth = require("../auth");
const router = express.Router();
const Map = require("../model/Map");
const User = require("../model/User");
const Comment = require("../model/Comment");
const mongoose = require("mongoose");
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs");

const validateId = (req, res, next) => {
  const { id } = req.body;
  let isValidId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidId) {
    console.log(`Error to process ID: ${id}`);
    return res
      .status(400)
      .json({ success: false, error: `Error to process ID: ${id}` });
  }
  next();
};

router.get("/getmaplist", auth.verify, async (req, res) => {
  let user = await User.findOne({ _id: req.userId });
  let maps = await Map.find({ author: user.username });

  if (!maps) {
    return res.status(400).json({ success: false, error: "Maps not found" });
  } else {
    let mapList = [];
    for (let key in maps) {
      let map = maps[key];
      let data = {
        id: map._id,
        name: map.name,
        author: map.author,
        thumbnail: map.thumbnail,
      };

      mapList.push(data);
    }
    return res.status(200).json({ success: true, mapList: mapList });
  }
});

router.get("/getallmaps", auth.verify, async (req, res) => {
  let maps = await Map.find({});
  console.log(req.userId);
  if (!maps) {
    return res.status(400).json({ success: false, error: "Maps not found" });
  } else {
    let mapList = [];
    for (let key in maps) {
      let map = maps[key];
      let publicMap = map.public;
      if (!publicMap) {
        continue;
      }
      let data = {
        id: map._id,
        name: map.name,
        author: map.author,
        thumbnail: map.thumbnail,
      };

      mapList.push(data);
    }
    return res.status(200).json({ success: true, mapList: mapList });
  }
});

router.post("/uploadmap", auth.verify, async (req, res) => {
  const whitelist_properties = [
    "ID_0",
    "ID_1",
    "ID_2",
    "ID_3",
    "NAME_0",
    "NAME_1",
    "NAME_2",
    "NAME_3",
    "name_0",
    "name_1",
    "name_2",
    "name_3",
    "name",
  ];
  let lowerCase = ["NAME_0", "NAME_1", "NAME_2", "NAME_3"];
  let user = await User.findOne({ _id: req.userId });
  let { features, type } = req.body;
  let mapData = [];
  console.log(`features.length: ${features.length}`);
  console.log(`request size: ${req.socket.bytesRead}`);

  for (let i = 0; i < features.length; i++) {
    // Sanity check
    if (features[i].properties) {
      // Clean properties that is not belong from list of allowed properties
      Object.keys(features[i].properties).forEach((property) => {
        if (!whitelist_properties.includes(property))
          delete features[i].properties[property];
        else {
          if (lowerCase.includes(property)) {
            features[i].properties[property.toLowerCase()] =
              features[i].properties[property];
            delete features[i].properties[property];
          }
        }
      });
    }
    mapData[i] = features[i];
  }
  let adm;
  if (features[0]) {
    if (features[0].properties.ID_3) {
      adm = 3;
    } else if (features[0].properties.ID_2) {
      adm = 2;
    } else if (features[0].properties.ID_1) {
      adm = 1;
    } else if (features[0].properties.ID_0) {
      adm = 0;
    }
  }

  for (let i = 0; i < features.length; i++) {
    // Sanity check
    let key = `name_${adm}`;
    if (features[i].properties && features[i].properties[key]) {
      features[i].properties["name"] = features[i].properties[key];
    }
  }

  let map = new Map({
    author: user.username,
    authorId: req.userId,
    public: false,
    name: "Untitled",
    type: type,
    features: mapData,
    properties: {},
    thumbnail: "",
    legend: [],
    textPositions: [],
    backgroundColor: "",
  });
  await map.save();

  return res.status(200).json({ id: map._id });
});

router.post("/deletemap", validateId, auth.verify, async (req, res) => {
  const { id } = req.body;
  let map = await Map.findById({ _id: id });
  let user = await User.findOne({ username: map.author });

  if (user._id == req.userId) {
    await Map.findOneAndDelete({ _id: id });
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({
      errorMessage: "Authentication error",
    });
  }
});
// Not authenticated (used for cypress test)
router.post("/deleteAllMaps", async (req, res) => {
  const { author } = req.body;

  await Map.deleteMany({
    author: author,
  });
  return res.status(200).json({ author: author });
});

router.post("/exportmap", validateId, async (req, res) => {
  const { id, geojson } = req.body;

  const query = await Map.findById({ _id: id }).exec();
  // console.log(query)
  if (!query) {
    console.log(`Not found map ID: ${id}`);
    return res
      .status(400)
      .json({ success: false, error: `Error to process ID: ${id}` });
  }
  if (geojson) return res.status(200).json({ data: query });
  const mapData = {
    type: query.type,
    features: query.features,
  };
  const data = new URLSearchParams();
  data.append("json", JSON.stringify(mapData));
  data.append("outputName", query.name);
  const options = {
    responseType: "stream",
  };
  const response = await axios.post(
    "http://ogre.adc4gis.com/convertJson",
    data,
    options
  );
  response.data.pipe(res);
});

router.post("/getmap", validateId, auth.verify, async (req, res) => {
  const { id } = req.body;
  let map = await Map.findOne({ _id: id });
  if (!map) {
    console.log(`Not found map ${id}`);
    return res.status(400).json({ success: false, error: "Error to get map" });
  }
  map = map.toObject();
  map.isAuthor = req.userId === map.authorId;
  return res.json({ success: true, map: map });
});

router.post("/savemap", validateId, async (req, res) => {
  const { id, mapData } = req.body;
  let map = await Map.findOneAndUpdate(
    { _id: id },
    { features: mapData },
    { new: true }
  );
  await map.save();

  //console.log(map.features)

  return res.json({ success: true });
});

router.post("/savegraphic", validateId, async (req, res) => {
  const { id, legend, textPositions, backgroundColor, mapData } = req.body;
  let map = await Map.findOneAndUpdate(
    { _id: id },
    {
      legend: legend,
      textPositions: textPositions,
      features: mapData,
      backgroundColor: backgroundColor,
    },
    { new: true }
  );
  await map.save();

  return res.json({ success: true });
});

router.post("/updatethumbnail", validateId, async (req, res) => {
  const { id, thumbnail } = req.body;
  let map = await Map.findOneAndUpdate(
    { _id: id },
    { thumbnail: thumbnail },
    { new: true }
  );
  await map.save();
  return res.json({ success: true });
});

router.post("/renamemap", validateId, async (req, res) => {
  const { id, name } = req.body;
  let map = await Map.findOneAndUpdate(
    { _id: id },
    { name: name },
    { new: true }
  );
  await map.save();

  return res.json({ success: true });
});

router.post("/forkmap", validateId, auth.verify, async (req, res) => {
  const { id } = req.body;
  let user = await User.findOne({ _id: req.userId });
  let map = await Map.findOne({ _id: id });

  let newMap = new Map({
    author: user.username,
    authorId: req.userId,
    public: false,
    name: map.name,
    type: map.type,
    features: map.features,
    properties: map.properties,
    thumbnail: map.thumbnail,
    legend: map.legend,
    textPositions: map.textPositions,
    backgroundColor: map.backgroundColor,
  });

  await newMap.save();

  return res.json({ success: true });
});

router.post("/publishmap", validateId, auth.verify, async (req, res) => {
  const { id } = req.body;
  let map = await Map.findOneAndUpdate(
    { _id: id, authorId: req.userId },
    { public: true },
    { new: true }
  );
  if (!map) {
    console.log(
      `Error to publish map: ${id}. Either you are not owner of the map or map is not found`
    );
    return res.status(400).json({
      success: false,
      error: `Error to publish. Either you are not owner of the map or map is not found`,
    });
  }
  return res.json({ success: true });
});

router.post("/comment", validateId, auth.verify, async (req, res) => {
  const { id, body } = req.body;

  // Get the user info
  let user = await User.findOne({ _id: req.userId });
  let map = await Map.findOne({ _id: id });
  // Check if user has permission to access the map or map does not exist
  if (!map || (!map.public && map.author !== user.username)) {
    return res.status(400).json({
      success: false,
      error: "You do not have permission to access this map",
    });
  }
  let comment = await Comment.findOne({ mapId: id });
  // If there is not comment & not update to comment => return the current list
  if (!comment && !body) {
    return res.status(200).json({ success: true, comment: [] });
  }

  let commentObject = {
    username: user.username,
    body: body,
    date: moment
      .tz(Date.now(), "America/New_York")
      .format("MMMM Do YYYY, h:mm:ss a"),
  };

  // Returns comment for loading
  if (!body) {
    return res.status(200).json({ success: true, comment: comment });
  }

  // Case 1: create new document
  if (!comment) {
    comment = new Comment({
      mapId: id,
      comments: [commentObject],
    });
    await comment.save();
  }
  // Case 2: there is already comment there => update the array
  else {
    comment.comments.push(commentObject);
    await comment.save();
  }
  return res.status(200).json({ success: true, comment: comment });
});

// Refactor
router.post("/update", validateId, auth.verify, async (req, res) => {
  const { id, map, region } = req.body;
  console.log("received /update");

  let mapData = await Map.findOne({ _id: id });
  console.log(mapData.author, req.username);
  if (!mapData || mapData.author !== req.username) {
    return res.status(400).json({
      success: false,
      error: "You do not have permission to change this map properties",
    });
  }
  // Check if body is valid json
  let mapCopy;
  try {
    mapCopy = JSON.parse(JSON.stringify(mapData));
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
  if (map) {
    // Update to the map
    mapData.properties = map;
    mapData.set("properties", map);
    // properties.forEach(property => {
    //   mapData.properties[property] = newMap[property]
    //   mapData.set(property,newMap[property]) // because of Schema.Types.Mixed
    // });
  } else {
    mapData.features = region;
    mapData.set("features", region);
  }
  await mapData.save();
  return res.status(200).json({
    success: true,
  });
});
module.exports = router;
