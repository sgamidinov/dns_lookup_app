const express = require("express");
const dig = require("node-dig-dns");
const fs = require("fs");
const path = require("path");
const htmlMinifier = require("html-minifier");

const app = express();
const template = fs.readFileSync(path.resolve("./page.html"));
const minifiedTemplate = htmlMinifier.minify(template.toString(), {
  processScripts: true,
  minifyCSS: true,
  minifyJS: true,
  html5: true,
});
const redirectToHomePageMiddleware = (request, response, next) => {
  if (/api/.test(request.path) || request.path === "/") {
    next();
    return;
  }

  response.redirect("/");
};

app.use(express.json());
app.use(redirectToHomePageMiddleware);

app.get("/", (_, response) => {
  response.send(minifiedTemplate);
});

app.post("/api/v1/lookup", (request, response) => {
  try {
    const digParams = [];
    if (request.body.dns_server) {
      digParams.push(`@${request.body.dns_server}`);
    }
    digParams.push(request.body.hostname);
    dig(digParams)
      .then((result) => {
        response.send(result);
      })
      .catch(() => {
        response.send({ error: "bad request" });
      });
  } catch (e) {
    response.status(200).send({ error: "server internal error" });
  }
});

app.listen(3000);
