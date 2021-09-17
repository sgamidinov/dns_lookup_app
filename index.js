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

const ipCheckRegex = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/g;

app.use(express.json());
app.use(redirectToHomePageMiddleware);

app.get("/", (_, response) => {
  response.send(minifiedTemplate);
});

app.post("/api/v1/lookup", (request, response) => {
  try {
    const digParams = [];
    if (request.body.dns_server) {
      if (ipCheckRegex.test(request.body.dns_server)) {
        digParams.push(`@${request.body.dns_server}`);
      } else {
        response.send({ error: "invalid ip address" });
        return;
      }
    }
    digParams.push(request.body.hostname);
    dig(digParams, { raw: true })
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
