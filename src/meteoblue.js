const u = require("./utils.js");
const axios = require("axios");
require("dotenv").config();

const MB_API_KEY = process.env.METEOBLUE_API_KEY;

function mbLocApi(q) {
  // https://docs.meteoblue.com/en/weather-apis/further-apis/location-search-api
  // Meteoblue Geocoding API
  return encodeURI(
    `https://www.meteoblue.com/pl/server/search/query3?query=${q}`
  );
}

function meteoblueApi({ lat = 50.0173, lon = 19.9252 }) {
  return encodeURI(
    `https://my.meteoblue.com/packages/basic-day?apikey=${MB_API_KEY}&` +
      `lat=${lat}&lon=${lon}` +
      "&format=json&tz=Europe%2FWarsaw"
  );
}

// http://my.meteoblue.com/packages/current?lat=47.558&lon=7.573&asl=279&tz=Europe%2FZurich&name=Basel&format=json&apikey=DEMOKEY&sig=993472dc3af5567662f68f6f388771aa
function mbApi({ package = "current", lat, lon, asl = undefined }) {
  if (isNaN(lat) || isNaN(lon)) throw "lat/lon is not a number";
  let asl2 = asl ? `&asl=${asl}` : "";
  return encodeURI(
    `http://my.meteoblue.com/packages/${package}?` +
      `apikey=${MB_API_KEY}&lat=${lat}&lon=${lon}` +
      `${asl}&tz=Europe%2FWarsaw&format=json`
  );
}

// Gets meteoblue data_day series and combines them by specific time objects
function pivot_series(series) {
  const series_size = Math.min(
    ...Object.values(series).map((ary) => ary.length)
  );
  const series_keys = Object.keys(series);

  let final_array = [];
  for (let i = 0; i < series_size; i++) {
    let all_series_objects = series_keys.map((v) => ({ [v]: series[v][i] }));
    let series_object = {};
    all_series_objects.forEach((v) => Object.assign(series_object, v));
    final_array.push(series_object);
  }
  return final_array;
}

function pivot_series2(series) {
  const series_size = Math.min(
    ...Object.values(series).map((ary) => ary.length)
  );
  const series_keys = Object.keys(series);

  let final_array = [];
  for (let i = 0; i < series_size; i++) {
    let series_objects = series_keys.map((v) => ({ [v]: series[v][i] }));
    series_objects.reduce((previous, obj) => {
      Object.assign(previous, obj);
      return previous;
    }, {});
    final_array.push(series_objects);
  }
  return final_array;
}

function getDataday(response) {
  if (response.data.hasOwnProperty("data_day")) {
    const {
      time,
      precipitation_probability,
      precipitation,
      temperature_mean,
      felttemperature_min,
      felttemperature_max,
    } = response.data.data_day;
    return u.zip(
      time,
      precipitation_probability,
      precipitation,
      temperature_mean,
      felttemperature_min,
      felttemperature_max
    );
  }
}

function doAsyncWeekBasic({ lat = 50.0173, lon = 19.9252 } = {}) {
  // Promise with basic week forecast
  // returned as a list of [date, ..., ..., ..., ...]
  // see getDataday function for the exact list of weather parameters
  return new Promise((resolve, reject) => {
    if (isNaN(lat) || isNaN(lon)) reject("lat/long wrong format");
    axios
      .get(meteoblueApi({ lat, lon }))
      .then((response) => resolve(getDataday(response)))
      .catch(({ message }) => reject(message));
  });
}

function doAsyncCurrentLoc({ lat = 50.0173, lon = 19.9252 } = {}) {
  // returns a Promise with current weather condition with given location
  const url = mbApi({ package: "current", lat, lon, asl: undefined });
  return new Promise((resolve, reject) => {
    if (isNaN(lat) || isNaN(lon)) reject("lat/lon wrong format");
    axios
      .get(url)
      .then((response) => resolve(response))
      .catch(({ message }) => reject(message));
  });
}

function getGeoByName(name = "Brzozów") {
  const apiUrl = mbLocApi(name);
  return new Promise((resolve, reject) => {
    axios
      .get(apiUrl)
      .then(({ data }) => resolve(data))
      .catch(({ message }) => reject(message));
  });
}

function getGeoByLoc({lat, lon}) {
  const apiUrl = mbLocApi(`${lat} ${lon}`);
  console.log("GeoByLoc", apiUrl)
  return new Promise((resolve, reject) => {
    axios
      .get(apiUrl)
      .then(({ data }) => resolve(data))
      .catch(({ message }) => reject(message));
  });
}


const featureClass = {
  A: "Administrative Boundary Features",
  H: "Hydrographic Features",
  L: "Area Features",
  P: "Populated Place Features",
  S: "Spot Features",
  T: "Hypsographic Features",
};

const featureCode = {
  ADM1: "first-order administrative division",
  ADM2: "second-order administrative division",
  ADM3: "third-order administrative division",
  ADM4: "fourth-order administrative division",
  ADM5: "fifth-order administrative division",
  PCLI: "independent political entity",
  PCLD: "dependent political entity",
  PCLIX: "section of independent political entity",
  PCLS: "semi-independent political entity",
  TERR: "territory",
  PCLF: "freely associated state",
  PCL: "political entity",
  PPL: "populated place",
  PPLL: "populated locality",
  PPLC: "capital of a political entity",
  PPLA: "seat of a first-order administrative division",
  PPLA2: "seat of a second-order administrative division",
  PPLA3: "seat of a third-order administrative division",
  PPLA4: "seat of a fourth-order administrative division",
  PPLX: "section of populated place",
  PPLS: "populated places",
  PPLCH: "historical capital of a political entity",
  AMUS: "amusement park",
  AIRP: "airport",
  MT: "mountain",
  MTS: "mountains",
  PK: "peaks",
  PAN: "pan",
  PANS: "pans",
  PASS: "pass",
  VALL: "valley",
  FLL: "waterfall(s)",
  DAM: "dam",
  PRK: "park",
  GLCR: "glacier(s)",
  cont: "continent",
  RSV: "reservoir(s)",
  UPLD: "upland",
  ISL: "island",
  ISLET: "islet",
  ISLF: "artificial island",
  ISLM: "mangrove island",
  ISLS: "islands",
  ISLT: "land-tied island",
  CAPE: "cape",
  HUT: "hut",
  HUTS: "huts",
  RSRT: "resort",
  CMP: "camp(s)",
  CMPMN: "mining camp",
  CLF: "cliff(s)",
};

const featureCodePL = {
  ADM1: "województwo",
  ADM2: "powiat",
  ADM3: "gmina",
  ADM4: "fourth-order administrative division",
  ADM5: "fifth-order administrative division",
  PCLI: "niepodległe państwo",
  PCLD: "terytoria zależne",
  PCLIX: "section of independent political entity",
  PCLS: "semi-independent political entity",
  TERR: "obszar",
  PCLF: "freely associated state",
  PCL: "political entity",
  PPL: "miejscowość",
  PPLL: "populated locality",
  PPLC: "stolica państwowa",
  PPLA: "miasto wojewódzkie",
  PPLA2: "siedziba powiatu",
  PPLA3: "siedziba gminy",
  PPLA4: "seat of a fourth-order administrative division",
  PPLX: "dzielnica",
  PPLS: "populated places",
  PPLCH: "dawna stolica państwowa",
  AMUS: "amusement park",
  AIRP: "lotnisko",
  MT: "góra",
  MTS: "góry",
  PK: "szczyt",
  PAN: "pan",
  PANS: "pans",
  PASS: "przełęcz",
  VALL: "dolina",
  FLL: "waterfall(s)",
  DAM: "zapora",
  PRK: "park",
  GLCR: "lodowiec",
  cont: "kontynent",
  RSV: "zbiornik",
  UPLD: "upland",
  ISL: "wyspa",
  ISLET: "islet",
  ISLF: "sztuczna wyspa",
  ISLM: "mangrove island",
  ISLS: "wyspy",
  ISLT: "land-tied island",
  CAPE: "przylądek",
  HUT: "chata (hut)",
  HUTS: "huts",
  RSRT: "resort",
  CMP: "camp(s)",
  CMPMN: "mining camp",
  CLF: "skały/urwiska",
};


module.exports = {
  meteoblueApi,
  mbLocApi,
  getDataday,
  doAsyncWeekBasic,
  getGeoByName,
  getGeoByLoc,
  featureClass,
  featureCode,
  featureCodePL
};
