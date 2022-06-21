import { watch } from './vue.esm-browser.prod.js';
import { store } from './store.js'
import DropdownComp from './DropdownComp.js'
import FileSaver from './FileSaver.esm-browser.min.js';


const SEP_NAME = ['中文逗号','英文逗号','空格', '全角空格','换行符'];
const CUSTOM = '自定义';
const SEP = ['，', ',',' ', '　', '\n'];

export default {
    components: {
        DropdownComp
    },
    props: {
        query: {
            type: String,
            default: ''
        },
    },
    emits: ['openModal'],
    data() {
        return {
            // constant data
            sep_name: SEP_NAME,
            custom: CUSTOM,
            // shared data
            store,
            // local data
            selectedSepIndex: 0,
            isMultiple: false,
            checkboxIndices: [],
            radioIndex: 0,
            inputSep: '',
        }
    },
    computed: {
        allNamesArray() {
            const allNames = new Set();
            if (this.isMultiple) {
                this.checkboxIndices.forEach(index => {
                    store.getNames(parseInt(index)).forEach(allNames.add, allNames);
                });
            } else {
                let names = store.getNames(parseInt(this.radioIndex));
                if (names) {
                    names.forEach(allNames.add, allNames);
                }
            }
            return Array.from(allNames);
        },
        fish() {
            return findFish(this.query, this.allNamesArray);
        },
        result() {
            return this.fish.join(this.separator);
        },
        allNamesString() {
            return this.allNamesArray.join(this.separator);
        },
        isCustomSeparator() {
            return this.selectedSepIndex == SEP.length;
        },
        separator() {
            if (this.isCustomSeparator) {
                return this.inputSep;
            } else {
                return SEP[this.selectedSepIndex];
            }
        },
        dropdownTitle() {
            if (this.isCustomSeparator) {
                return CUSTOM;
            } else {
                return SEP_NAME[this.selectedSepIndex];
            }
        }
    },
    methods: {
        openModal() {
            this.$emit('openModal');
        },
        exportResult() {
            let blob = new Blob([this.result], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, "漏网之鱼.txt");
        },
        exportAllNames() {
            let blob = new Blob([this.allNamesString], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, "全名单.txt");
        },
        setMultiple() {
            this.isMultiple = true;
        },
        setNotMultiple() {
            this.isMultiple = false;
        },
    },
    created() {
        // use a getter
        // ref: https://vuejs.org/guide/essentials/watchers.html#basic-example
        watch(
            () => store.allLists,
            (newValue, oldValue) => {
                // restore checkables' states
                // (1) restore radio state
                let lastRadioTitle = store.getTitle(this.radioIndex, oldValue);
                let index = 0;
                for (let key of newValue) {
                    if (key[0] === lastRadioTitle) {
                        this.radioIndex = index;
                        break;
                    }
                    index++;
                }
                // (2) restore checkboxes' states
                const newcheckboxIndices = [];
                this.checkboxIndices.forEach(v => {
                    let title = store.getTitle(v, oldValue);
                    index = 0;
                    for (let key of newValue) {
                        if (key[0] === title) {
                            newcheckboxIndices.push(index);
                            break;
                        }
                        index++;
                    }
                });
                this.checkboxIndices = newcheckboxIndices;
            }
        );
    },
    template: /*html*/`
    <div class="section pt-2 pb-5">

        <div class="tile is-ancestor">
            <div class="tile is-8 is-vertical is-parent">
                <div class="tile is-child">
                    <nav class="panel">
                        <p class="panel-heading">
                            <div class="level">
                                <span>漏网之鱼：<span id="count-fish">{{ fish.length }}</span></span>
                                <button class="button is-link is-outlined is-small" @click="exportResult">
                                导出
                                </button>
                            </div>
                        </p>
                        <p class="panel-block">
                            <div class="control is-expanded name-content">
                            {{ result }}
                            </div>
                        </p>
                    </nav>
                </div>
                <div class="tile is-child">
                    <nav class="panel">
                        <p class="panel-heading">
                            <div class="level">
                                <span>全名单：<span id="count-names">{{ allNamesArray.length }}</span></span>
                                <button class="button is-link is-outlined is-small" @click="exportAllNames">
                                导出
                                </button>
                            </div>
                        </p>
                        <p class="panel-block">
                            <div class="control is-expanded name-content">
                            {{ allNamesString }}
                            </div>
                        </p>
                    </nav>
                </div>
            </div>
            <div class="tile is-parent">
                <div class="tile is-child">
                    <nav class="panel">
                        <p class="panel-heading">
                            <span>控制面板</span>
                        </p>
                        <p class="panel-tabs">
                            <a :class="{'is-active': !isMultiple}" @click="setNotMultiple">单选名单</a>
                            <a :class="{'is-active': isMultiple}" @click="setMultiple">多选名单</a>
                        </p>

                        <div class="control-pandel-content" :style="{'max-height': isCustomSeparator? '13.5em' : '16.5em'}" style="overflow: auto;">
                        <template v-if="isMultiple">
                            <template v-for="(item, index) in store.allTitles">
                                <label class="panel-block">
                                    <input class="mr-2" type="checkbox" name="foobar" :value="index" v-model="checkboxIndices">
                                    {{ item }}
                                </label>
                            </template>
                        </template>
                        <template v-else>
                            <template v-for="(item, index) in store.allTitles">
                                <label class="panel-block">
                                    <input class="mr-2" type="radio" name="foobar" :value="index" v-model="radioIndex">
                                    {{ item }}
                                </label>
                            </template>
                        </template>
                        </div>

                        <div class="panel-block">
                            <button class="button is-link is-outlined is-fullwidth" @click="openModal">
                            设置名单
                            </button>
                        </div>
                        <div class="panel-block">
                            <div style="width: 100%">
                                <div class="field">
                                    <div class="label">分隔符</div>
                                    <div class="control ">
                                        <dropdown-comp 
                                            class="is-up"
                                            :item-list-group="[sep_name,[custom]]"
                                            :dropdownContentMaxHeight=15
                                            :title="dropdownTitle"
                                            v-model="selectedSepIndex" 
                                            title="分隔符">
                                        </dropdown-comp>
                                    </div>
                                </div>
                                <div class="field">
                                    <p class="control">
                                        <textarea class="textarea" rows="1" placeholder="请输入" v-show="isCustomSeparator" v-model="inputSep"></textarea>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </div>

    </div>
    `
}