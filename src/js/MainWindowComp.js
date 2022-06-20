import { store } from './store.js'
import DropdownComp from './DropdownComp.js'
import FileSaver from './FileSaver.esm-browser.min.js';


const SEP = '，';

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
            // shared data
            store,
            // local data
            separator: SEP,
            // main window related
            isMultiple: false,
            checkboxIndices: [],
            radioIndex: 0,
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
                            <div class="content fixed-height">
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
                            <div class="content fixed-height">
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
                            <span>选择名单</span>
                        </p>
                        <p class="panel-tabs">
                            <a :class="{'is-active': !isMultiple}" @click="setNotMultiple">单选</a>
                            <a :class="{'is-active': isMultiple}" @click="setMultiple">多选</a>
                        </p>

                        <div class="fixed-height-pandel">
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
                    </nav>
                </div>
            </div>
        </div>

    </div>
    `
}

// TODO: add keyboard shortcut
// TODO: choosing the separator