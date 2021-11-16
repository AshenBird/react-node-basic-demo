const http = require("http");

const fs = require("fs");

const path = require("path");

const resolve = (...p) => path.resolve(__dirname, ...p);

const getFileList = async (p = "./build", f = "") => {
  const dir = fs.opendirSync(resolve(p));
  const results = [];
  for await (const dirent of dir) {
    if (dirent.isFile()) {
      results.push(`${f}/${dirent.name}`);
      continue;
    }
    results.push( ...await getFileList(resolve(p, dirent.name), `${f}/${dirent.name}`));
  }
  return results;
};

const main = async () => {
  const fileList = await getFileList();
  const app = http.createServer((req, res) => {
    const url = req.url;
    if(url==="/"){
      fs.readFile(resolve("./build/index.html"),(e, data)=>{
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      })
      
      return;
    }
    if(!fileList.includes(url)){
      res.statusCode = 404;
      res.end()
      return
    }
    
    fs.readFile(resolve(`./build${url}`),(e, data)=>{
      res.end(data);
    })
  });

  app.listen("7000", (e) => {
    // error handle
  });
  return app;
};


main()


module.exports = main
