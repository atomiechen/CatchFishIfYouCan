import { reactive, computed, ref } from './vue.esm-browser.prod.js'

const split = str => str.split(/[^a-zA-Z\u00B7\u3007\u3400-\u4DBF\u4E00-\u9FFF\uE000-\uF8FF\uD840-\uD8C0\uDC00-\uDFFF\uF900-\uFAFF]+/)

const KEY_PREFIX = "names_";
const getRealKey = title => KEY_PREFIX + title;
const getLiteralTitle = key => key.slice(KEY_PREFIX.length);

const allLists = ref([[]]);
const allTitles = computed(() => allLists.value.map(v => v[0]));

export const store = reactive({
    allLists: allLists,
    allTitles: allTitles,
    checkIndex(index, allLists=this.allLists) {
        return index >= 0 && index < allLists.length;
    },
    getTitle(index, allLists=this.allLists) {
        return this.checkIndex(index, allLists)? allLists[index][0] : null;
    },
    getNames(index, allLists=this.allLists) {
        return this.checkIndex(index, allLists)? allLists[index][1] : null;
    },
    getVersion(index, allLists=this.allLists) {
        return this.checkIndex(index, allLists)? allLists[index][2] : null;
    },
    updateAllLists() {
        console.log("udpate AllLists");
        this.allLists = utools.db.allDocs(KEY_PREFIX).map(v => [getLiteralTitle(v['_id']), v['value'], v['_rev']]);
    },
    hasNoList() {
        return this.allLists.length === 0;
    },
    removeList(title) {
        if (this.hasList(title)) {
           utools.dbStorage.removeItem(getRealKey(title));
           return true;
        } else {
           return false;
        }
    },
    hasList(title) {
        let real_key = getRealKey(title);
        let result = utools.db.allDocs([real_key]);
        if (result && result.length > 0) {
           return true;
        } else {
           return false;
        }
    },
    setList(title, nameArray, oldTitle=null) {
        if (nameArray.length > 0) {
           if (oldTitle && oldTitle !== title) {
              this.removeList(oldTitle);
           }
           utools.dbStorage.setItem(getRealKey(title), nameArray);
           return true;
        } else {
           return false;
        }
     },
     stringToNames(namesString) {
        const allNames = new Set();
        split(namesString.trim())
            // remove empty names
            .filter(v => v)
            // remove duplicate names
            .forEach(allNames.add, allNames);
        return Array.from(allNames).sort(this.compare);
    },
    findFish(namesString, allNames) {
        namesString = namesString.trim();
        const fish = [];
        // reversely loop to check the longer string first 
        // than the shorter one that may be the prefix
        let i = allNames.length - 1;
        for (; i >= 0; i--) {
            let target = allNames[i];
            if (!namesString.includes(target)) {
                fish.push(target);
            } else {
                // replace all occurences of target word
                let re = new RegExp(target, 'g');
                namesString = namesString.replace(re,'|');
            }
        }
        return fish.sort(this.compare);
    },
    compare(a, b) { 
        return (a.length - b.length) || a.localeCompare(b); 
    },
});