const KEY_PREFIX = "names_";
const getRealKey = title => KEY_PREFIX + title;
const getLiteralTitle = key => key.slice(KEY_PREFIX.length);

window.setList = (title, nameArray, oldTitle=null) => {
   if (nameArray.length > 0) {
      if (oldTitle && oldTitle !== title) {
         window.removeList(oldTitle);
      }
      utools.dbStorage.setItem(getRealKey(title), nameArray);
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