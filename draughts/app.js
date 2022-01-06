const express = require("express");
const http = require("http");
const indexRouter = require("./routes/index");

const port = process.argv[2];
const app = express();

app.get("/play", indexRouter);
app.get("/", indexRouter);

app.use(express.static(__dirname + "/public"));
http.createServer(app).listen(port);
