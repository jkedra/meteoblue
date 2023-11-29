const moment = require("moment");

const express = require("express");
const router = express.Router();
const mb = require("../src/meteoblue.js");
const e = require("express");

let commons = {
  title: "Miejsce",
  name: "Jurek Kędra",
  author: "Witek Kędra",
  currentTime: moment().format(),
};

function renderHTML(response, data) {
  Object.assign(data, commons);
  data.results.forEach((el) => {
    el.featureCode = mb.featureCodePL[el.featureCode];
    el.featureClass = mb.featureClass[el.featureClass];
    el.population = new Intl.NumberFormat().format(el.population);
  });
  console.log("renderPage", data);
  console.log(data);
  response.render("location", data);
}

function sendJSON(response, data) {
  Object.assign(data, commons);
  data.results.forEach((el) => {
    el.featureCode = mb.featureCode[el.featureCode];
    el.featureClass = mb.featureClass[el.featureClass];
  });
  response.status(200).send(data);
}

function filterByIdSendJSON(response, id, data) {
  Object.assign(data, commons);
  data.results.forEach((el) => {
    el.featureCode = mb.featureCodePL[el.featureCode];
    el.featureClass = mb.featureClass[el.featureClass];
    el.population = new Intl.NumberFormat().format(el.population);
    el.admin1 = el.admin1.replace("Województwo ", "");
  });
  data.results = data.results.filter((el) => el.id == id);
  response.status(200).send(data.results[0]);
}

/* GET home page. */
router.get("/", function (req, res, next) {
  const query = req.query.qloc;
  mb.getGeoByName(query)
    .then((data) => renderHTML(res, data))
    .catch((err) => console.log("ERROR:", err));
});

router.get("/json", function (req, res, next) {
  const { qloc, lat, lon, url } = req.query;
  if (qloc) {
    mb.getGeoByName(qloc)
      .then((data) => sendJSON(res, data))
      .catch((err) => console.log("ERROR:", err));
  } else if (url) {
    const [nameOnly, _, id] = url.split("_");
    mb.getGeoByName(nameOnly)
      .then((data) => filterByIdSendJSON(res, id, data))
      .catch((err) => console.log("ERROR:", err));
  } else if (lat && lon)
    mb.getGeoByLoc({ lat, lon })
      .then((data) => sendJSON(res, data))
      .catch((err) => console.log("ERROR:", err));
  else res.status(404).send({ error: "allowed parameters = qloc, (lat, lon), url" });
});

module.exports = router;
