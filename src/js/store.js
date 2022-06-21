import { reactive, computed, ref } from './vue.esm-browser.prod.js'

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
        this.allLists = getAllLists();
    },
    hasNoList() {
        return this.allLists.length === 0;
    }
});