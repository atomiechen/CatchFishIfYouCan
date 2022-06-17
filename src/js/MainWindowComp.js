import { store } from './store.js'
import DropdownComp from './DropdownComp.js'

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
        }
    },
    methods: {
        openModal() {
            this.$emit('openModal');
        }
    },
    template: /*html*/`
    <div class="section pt-2">

        <div class="field">
        <div class="level mb-0">
            <div class="level-left">
            <label class="label mb-0 mr-5">选择名单</label>
            <div class="control mr-3">
                <input class="switch is-link is-outlined" id="switch" type="checkbox" name="switch" v-model="isMultiple">
                <label for="switch">多选</label>
            </div>
            </div>
        </div>
        <div class="level">
            <div class="h-scroll mb-0 mr-3">
            <div class="control">
                <template v-if="isMultiple">
                <template v-for="(item, index) in store.allTitles">
                    <input class="is-checkradio is-link" type="checkbox" :id="'input'+index" name="foobar" :value="index" v-model="checkboxIndices">
                    <label :for="'input'+index">{{ item }}</label>
                </template>
                </template>
                <template v-else>
                <template v-for="(item, index) in store.allTitles">
                    <input class="is-checkradio is-link" type="radio" :id="'input'+index" name="foobar" :value="index" v-model="radioIndex">
                    <label :for="'input'+index">{{ item }}</label>
                </template>
                </template>
            </div>
            </div>
            <div class="level-right">
            <div class="control">
                <button class="button is-link" id="js-modal-trigger" data-target="modal-settings" @click="openModal">设置名单</button>
            </div>
            </div>
        </div>
        </div>

        <div class="field">
            <label class="label">漏网之鱼：<span id="count-fish">{{ fish.length }}</span></label>
            <article class="message">
                <div class="message-body" id="names">
                    {{ fish.join(separator) }}
                </div>
            </article>
        </div>

        <div class="field is-grouped is-grouped-right">
            <p class="control">
                <button class="button is-link">导出缺漏名单</button>
            </p>
        </div>

        <div class="field" id="get">
            <label class="label">全名单：<span id="count-names">{{ allNamesArray.length }}</span></label>
            <div class="control">
                <textarea readonly class="textarea" id="all-names" :value="allNamesArray.join(separator)"></textarea>
            </div>
        </div>

        <div class="field is-grouped is-grouped-right">
            <p class="control">
                <button class="button is-link">导出全名单</button>
            </p>
        </div>

    </div>
    `
}

// TODO: add keyboard shortcut
// TODO: support exporting to file, choosing the separator
// TODO: change UI to two columns