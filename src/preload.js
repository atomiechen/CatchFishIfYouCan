
// preload.js 中使用 nodejs

// const path = require('path')
// const fs = require('fs')

// const nameFile = 'names.txt'

// function readNames(nameFile) {
//    try {
//       data = fs.readFileSync(path.join(__dirname, nameFile), encoding='utf-8')
//       return data
//    } catch (error) {
//       console.error(error)
//    }
// }

// function writeNames(namesString) {
//    try {
//       fs.writeFileSync(path.join(__dirname, nameFile), namesString, encoding='utf-8')
//    } catch (error) {
//       console.error(error)
//    }
// }

const splitLines = str => str.split(/\r?\n/)
// const split = str => str.split(/[\s,.;，。；|]+/)
const split = str => str.split(/[^a-zA-Z\u00B7\u3007\u3400-\u4DBF\u4E00-\u9FFF\uE000-\uF8FF\uD840-\uD8C0\uDC00-\uDFFF\uF900-\uFAFF]+/)


// window.names = {
//    "名单1": ['张三', '赵四'],
//    "搞笑委员会": ['铁蛋', '张伟']
// }

window.names = utools.dbStorage.getItem('names');
if (!window.names) {
   window.names = {};
}

window.getNames = (key) => {
   return window.names[key];
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
      window.names[key] = Array.from(allNames);
      utools.dbStorage.setItem('names', window.names);
      return true;
   } else {
      return false;
   }
};

window.removeNames = (key) => {
   if (key in window.names) {
      delete window.names[key];
      if (Object.keys(window.names).length === 0) {
         utools.dbStorage.removeItem('names');
      } else {
         utools.dbStorage.setItem('names', window.names);
      }
      return true;
   } else {
      return false;
   }
};

window.getAllKeys = () => {
   return Object.keys(window.names);
};

// unused
window.exports = {
   "hello": { // 注意：键对应的是 plugin.json 中的 hello
      mode: "doc",  // 列表模式
      // args: {
      //    // 进入插件时调用（可选）
      //    enter: (action, callbackSetList) => {
      //       // 如果进入插件就要显示列表数据
      //       callbackSetList(findFish(action.payload))
      //    },
      //    // 子输入框内容变化时被调用 可选 (未设置则无搜索)
      //    search: (action, searchWord, callbackSetList) => {
      //       // 获取一些数据
      //       // 执行 callbackSetList 显示出来
      //       callbackSetList(findFish(searchWord))
      //    },
      //    // 用户选择列表中某个条目时被调用
      //    select: (action, itemData, callbackSetList) => {
      //       // window.utools.hideMainWindow()
      //       // const url = itemData.url
      //       // require('electron').shell.openExternal(url)
      //       // window.utools.outPlugin()
      //    },
      //    // 子输入框为空时的占位符，默认为字符串"搜索"
      //    placeholder: "搜索"
      // } 
      args: {
         // 索引集合
         // indexes: require('./indexes.json')
         indexes:[
            {
               t: '这是标题',
               d: '这是描述',
               p: 'index.html' //页面, 只能是相对路径
            },
            {
               t: '这是cwh',
               d: '这是描述',
               p: 'index.html' //页面, 只能是相对路径
            }
         ],
         // 子输入框为空时的占位符，默认为字符串"搜索"
         placeholder: "搜索"
      }
   }
}
