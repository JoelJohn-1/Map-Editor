import { useQueryClient } from "react-query";
import axios from "axios";
import jsTPS from "./jsTPS";
import editTPS from "./editTPS";
import graphicalTps from "./graphicalTPS";
import graphicalTPS from "./graphicalTPS";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: import.meta.env.VITE_MAP_API,
});
export const loadMapList = async () => {
  let res = await api.get("/getmaplist");
  return res.data.mapList;
};

export const loadPublicMapList = async () => {
  let res = await api.get("/getallmaps");
  return res.data.mapList;
};

export const addMap = async (map) => {
  return await api.post("uploadmap", map);
};

export const deleteMap = async (id) => {
  return await api.post("deletemap", id);
};

export const renameMap = async (data) => {
  return await api.post("/renamemap", data);
};

export const forkMap = async (data) => {
  return await api.post("/forkmap", data);
};

export const loadMapOnly = async (id) => {
  let res = await api.post("/getmap", id);
  return res.data.map;
};

export const loadMap = async (id) => {
  let res = await api.post("/getmap", id);
  let tps = new jsTPS();
  let editTps = new editTPS();

  let fontSize = 10;
  let nameLevel = "name";
  if (res.data.map.features[0]) {
    if (res.data.map.features[0].properties.ID_3) {
      nameLevel = "name_3";
      fontSize = 8;
    } else if (res.data.map.features[0].properties.ID_2) {
      nameLevel = "name_2";
      fontSize = 8;
    } else if (res.data.map.features[0].properties.ID_1) {
      nameLevel = "name_1";
      fontSize = 8;
    } else if (res.data.map.features[0].properties.ID_0) {
      nameLevel = "name_0";
    }
  }

  return {
    mapData: res.data.map.features,
    fontSize: fontSize,
    nameLevel: nameLevel,
    tps: tps,
    editTps: editTps,
  };
};

export const loadGraphic = async (id) => {
  let res = await api.post("/getmap", id);
  let graphicalTps = new graphicalTPS();

  return {
    mapData: res.data.map.features,
    legend: res.data.map.legend,
    textPositions: res.data.map.textPositions,
    backgroundColor: res.data.map.backgroundColor,
    graphicalTps: graphicalTps,
  };
};

export const saveMap = async (data) => {
  return await api.post("/savemap", data);
};

export const saveGraphic = async (data) => {
  return await api.post("/savegraphic", data);
};

export const loadComments = async (data) => {
  let res = await api.post("/comment", data);
  return res.data.comment;
};
export const publishComment = async (data) => {
  let res = await api.post("/comment", data);
  return res.data.comment;
};

export const updateProperties = async (data) => {
  return await api.post("/update", data);
};

export const useGetFetchQuery = (name, selectedLayers) => {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(name);
  let properties = {};

  selectedLayers.forEach((selectedLayer) => {
    for (let i = 0; i < data.mapData.length; i++) {
      if (data.mapData[i] == selectedLayer.feature) {
        properties = data.mapData[i].properties;
      }
    }
  });

  return properties;
};

export const updateThumbnail = async (data) => {
  return await api.post("/updatethumbnail", data);
};

export default api;
