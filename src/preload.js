const { createReadStream, statSync, writeFile } = require('fs');

window.preload = {
   createReadStream(...args) {
      return createReadStream(...args);
   },
   statSync(...args) {
      return statSync(...args);
   },
   writeFile(...args) {
      return writeFile(...args);
   },
}