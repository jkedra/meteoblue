const path = require("path");
const express = require("express");
const logger = require("morgan");
const moment = require("moment");

const app = express();


app.use(logger("dev"));

console.log(__dirname);
console.log(__filename);
const staticDir = path.join(__dirname, "../static");
const viewsDir = path.join(__dirname, "../views");

app.set("view engine", "pug");
app.set("views", viewsDir);

app.use(express.static(staticDir));

let commons = {
  title: "Weather App",
  name: "Jurek Kędra",
  author: "Witek Kędra",
  currentTime: moment().format()
};


// routers
const locRtr = require('../routes/location.js');
app.use('/location', locRtr);


app.get("", (req, res, next) => {
  res.render("index", commons);
});

app.get("/about", (req, res, next) => {
  res.render("index", Object.assign({
    page_subheader: "Main Page",
    page_div_content: "Tests with ExpressJS, Pug and Weather API"
  }, commons));
});

app.get("/help", (req, res, next) => {
  res.send("Help Express!");
});


app.get("/json", (req, res) => {
  res.send({ name: "JUrek Kędra", age: 49 });
});

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => console.log("server is up"));
