const http = require("http");

const fs = require("fs");

const path = require("path");

const resolve = (...p) => path.resolve(__dirname, ...p);

/**
 *
 * @param {string} p file path in file system
 * @param {string} f parent uri for http request
 * @returns {string[]} file's uri for http request
 * @summary function for get static file's uri list
 */
const getFileList = async (p = "./build", f = "") => {
  // open directory
  const dir = fs.opendirSync(resolve(p));
  const results = [];

  // iterate get child directory/file
  for await (const dirent of dir) {
    // file
    if (dirent.isFile()) {
      results.push(`${f}/${dirent.name}`);
      continue;
    }
    // recursively handle child directory
    results.push(
      ...(await getFileList(resolve(p, dirent.name), `${f}/${dirent.name}`))
    );
  }
  return results;
};

/**
 * @returns {http.Server}
 * @summary main function
 */
const main = async () => {
  // get file url list at first, and wait complete
  const fileList = await getFileList();

  // create http server instance, provide http request handle method
  const app = http.createServer((req, res) => {
    const url = req.url;
    // root path, response html document.
    if (url === "/" || url === "/index" || url === "/index.html") {
      // get index.html file content
      fs.readFile(resolve("./build/index.html"), (e, data) => {
        // get file failed
        if(e){
          res.statusCode = 500;
          res.end();
          return;
        }
        // get file success, set http response head
        res.setHeader("Content-Type", "text/html");

        // set response body
        res.end(data);
      });

      return;
    }

    // can't find file
    if (!fileList.includes(url)) {
      res.statusCode = 404;
      res.end();
      return;
    }

    // response asset files
    fs.readFile(resolve(`./build${url}`), (e, data) => {
      res.end(data);
    });
  });

  // listen 7000 port
  app.listen("7000", (e) => {
    // error handle
  });
  return app;
};

const app = main();

module.exports = {
  main,
  app,
};
