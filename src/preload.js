const splitLines = str => str.split(/\r?\n/)
// const split = str => str.split(/[\s,.;，。；|]+/)
const split = str => str.split(/[^a-zA-Z\u00B7\u3007\u3400-\u4DBF\u4E00-\u9FFF\uE000-\uF8FF\uD840-\uD8C0\uDC00-\uDFFF\uF900-\uFAFF]+/)

const KEY_PREFIX = "names_";
const getRealKey = key => KEY_PREFIX + key;
const getLiteralKey = key => key.slice(KEY_PREFIX.length);

window.getNames = (key) => {
   return utools.dbStorage.getItem(getRealKey(key));
};

window.setNames = (key, namesString, oldKey=null) => {
   const allNames = new Set();
   // remove empty names
   const nameArray = split(namesString.trim()).filter(v => v);
   // remove duplicate names
   nameArray.forEach(allNames.add, allNames);
   if (allNames.size > 0) {
      if (oldKey && oldKey !== key) {
         window.removeNames(oldKey);
      }
      utools.dbStorage.setItem(getRealKey(key), Array.from(allNames));
      return true;
   } else {
      return false;
   }
};

window.removeNames = (key) => {
   let real_key = getRealKey(key);
   let result = utools.db.allDocs([real_key]);
   if (result && result.length > 0) {
      utools.dbStorage.removeItem(real_key);
      return true;
   } else {
      return false;
   }
};

window.getAllKeys = () => {
   return utools.db.allDocs(KEY_PREFIX).map(v => getLiteralKey(v['_id']));
};
