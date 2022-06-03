const splitLines = str => str.split(/\r?\n/)
// const split = str => str.split(/[\s,.;，。；|]+/)
const split = str => str.split(/[^a-zA-Z\u00B7\u3007\u3400-\u4DBF\u4E00-\u9FFF\uE000-\uF8FF\uD840-\uD8C0\uDC00-\uDFFF\uF900-\uFAFF]+/)

const KEY_PREFIX = "names_";
const getRealKey = title => KEY_PREFIX + title;
const getLiteralTitle = key => key.slice(KEY_PREFIX.length);


window.setList = (title, namesString, oldTitle=null) => {
   const allNames = new Set();
   // remove empty names
   const nameArray = split(namesString.trim()).filter(v => v);
   // remove duplicate names
   nameArray.forEach(allNames.add, allNames);
   if (allNames.size > 0) {
      if (oldTitle && oldTitle !== title) {
         window.removeNames(oldTitle);
      }
      utools.dbStorage.setItem(getRealKey(title), Array.from(allNames));
      return true;
   } else {
      return false;
   }
};

window.hasList = (title) => {
   let real_key = getRealKey(title);
   let result = utools.db.allDocs([real_key]);
   if (result && result.length > 0) {
      return true;
   } else {
      return false;
   }
}

window.removeList = (title) => {
   if (window.hasList(title)) {
      utools.dbStorage.removeItem(getRealKey(title));
      return true;
   } else {
      return false;
   }
};

window.getAllLists = () => {
   return utools.db.allDocs(KEY_PREFIX).map(v => [getLiteralTitle(v['_id']), v['value']]);
};