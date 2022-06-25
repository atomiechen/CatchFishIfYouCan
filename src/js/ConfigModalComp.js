import { watch } from './vue.esm-browser.prod.js';
import { store } from './store.js'
import DropdownComp from './DropdownComp.js'


const NO_FILE = '未选择文件';
const NEW_LIST = '新建名单';
const UPDATE_LIST = '更新名单';
const EMPTY_TITLE = '名单名称不能为空';
const EMPTY_NAMES = '名单内容不能为空';
const NO_NAME = '名单内容没有名字';
const EXISTING_TITLE = '名单名称已存在';
const NO_TITLE = '不存在此名单';
const SEP = '，';


export default {
    components: {
        DropdownComp
    },
    props: {
        isOpen: {
            type: Boolean,
            default: false
        },
        paraNames: {
            type: String,
            default: ''
        },
    },
    emits: ['update:paraNames', 'update:isOpen'],
    data() {
        return {
            // shared data
            store,
            // local data
            isActive: this.isOpen,
            selectedIndex: 0,
            selectedFilename: NO_FILE,
            inputTitle: '',
            inputNames: '',
            suppressInputOverwrite: false,
            lastInputTitle: '',
            lastInputNames: '',
            lastIsIndexCreate: false,
            warnTitleMsg: '',
            warnNamesMsg: '',
            suppressWarnTitle: false,
            suppressWarnNames: false,
            hasProgressBar: false,
            progress: 0,
            separator: SEP,
        }
    },
    computed: {
        indexCreate() {
            return store.allLists.length;
        },
        isIndexCreate() {
            return this.selectedIndex === this.indexCreate;
        },
        hintTitle() {
            return this.isIndexCreate? NEW_LIST : UPDATE_LIST;
        },
        selectedUniqueID() {
            return store.getTitle(this.selectedIndex)+store.getVersion(this.selectedIndex);
        },
    },
    methods: {
        setNamelist() {
            const newTitle = this.inputTitle.trim();
            let error = false;
            let oldTitle = store.getTitle(this.selectedIndex);
            let nameArray = null;
        
            if (this.warnEmptyTitle()) {
                error = true;
            } else {
                // check if title already exists to prevent overriding
                if ((oldTitle === null || oldTitle !== newTitle) && store.hasList(newTitle)) {
                    this.warnTitleMsg = EXISTING_TITLE;
                    error = true;
                }
            }
            if (this.warnEmptyNames()) {
                error = true;
            } else {
                const newNamesString = this.inputNames.trim();
                nameArray = store.stringToNames(newNamesString);
                if (nameArray.length == 0) {
                    this.warnNamesMsg = NO_NAME;
                    error = true;
                }
            }
            if (error) {
                return;
            }
        
            store.setList(newTitle, nameArray, oldTitle);
            // clear all inputs to avoid caching inputs
            // must be called before updateAllLists()
            this.refreshInputs();
            // update all lists
            store.updateAllLists();
            this.closeModal();
        },
        removeNamelist() {
            const title = store.getTitle(this.selectedIndex);
            if (title) {
                if (store.removeList(title)) { // success
                    // update all lists
                    store.updateAllLists();
                    this.closeModal();
                } else {
                    this.warnTitleMsg = NO_TITLE;
                }
            }
        },
        refreshInputs() {
            if (this.isIndexCreate) {
                this.inputTitle = '';
                this.inputNames = '';
            } else {
                this.inputTitle = store.getTitle(this.selectedIndex);
                this.inputNames = store.getNames(this.selectedIndex).join(this.separator);
            }
            // updated selected filename
            this.selectedFilename = NO_FILE;
            // remove warnings
            this.suppressWarnTitle = true;
            this.suppressWarnNames = true;
            this.warnTitleMsg = '';
            this.warnNamesMsg = '';
        },
        isEmptyTitle() {
            return this.inputTitle.trim().length == 0;
        },
        isEmptyNames() {
            return this.inputNames.trim().length == 0;
        },
        warnEmptyTitle() {
            if (this.isEmptyTitle()) {
                this.warnTitleMsg = EMPTY_TITLE;
                return true;
            } else {
                this.warnTitleMsg = '';
                return false;
            }
        },
        warnEmptyNames() {
            if (this.isEmptyNames()) {
                this.warnNamesMsg = EMPTY_NAMES;
                return true;
            } else {
                this.warnNamesMsg = '';
                return false;
            }
        },
        closeModal() {
            this.isActive = false;
            this.$emit('update:isOpen', false);
        },
        onKeyFile() {
            // read names from file
            const ret = utools.showOpenDialog({
                title: '从文件加载名单',
                filters: [{ 'name': '文本文件', extensions: ['txt', 'csv', 'md', 'markdown'] }], 
                properties: ['openFile']
            });
            if (ret && ret.length > 0) {
                const filePath = ret[0];
                // ref: https://stackoverflow.com/a/424006/11854304
                const filename = filePath.split('\\').pop().split('/').pop();
                const stream = preload.createReadStream(filePath);
                const totalSize = preload.statSync(filePath).size;

                this.progress = 0;
                this.hasProgressBar = true;

                let content = '';
                let loadedSize = 0;
                stream.on('data', (chunk) => {
                    content += chunk;
                    loadedSize += chunk.length;
                    this.progress = parseInt( ((loadedSize / totalSize) * 100), 10 );
                });
                stream.on('end', () => {
                    this.inputNames = content;
                    this.hasProgressBar = false;
                });

                this.selectedFilename = filename;
                // if title is empty, set it to filename without suffix
                if (this.isEmptyTitle()) {
                    this.inputTitle = filename.replace(/\.[^/.]+$/, "");
                }
            }
        },
    },
    watch: {
        // selected a difference dropdown item or version updated
        selectedUniqueID(newUID) {
            if (!this.isIndexCreate && this.lastIsIndexCreate) {
                // first time change from create to others
                this.lastIsIndexCreate = false;
                // store last input content
                this.lastInputTitle = this.inputTitle;
                this.lastInputNames = this.inputNames;
            } else if (this.isIndexCreate) {
                // we are selecting create
                this.lastIsIndexCreate = true;
            }

            // reset inputs
            if (!this.suppressInputOverwrite || !this.isIndexCreate) {
                this.refreshInputs();
            }
            // restore last input content if selecting create
            if (!this.suppressInputOverwrite && this.isIndexCreate) {
                this.inputTitle = this.lastInputTitle;
                this.inputNames = this.lastInputNames;
            }
            // consume suppress signal
            this.suppressInputOverwrite = false;
        },
        inputTitle(newInputTitle) {
            if (!this.suppressWarnTitle || newInputTitle.length > 0) {
                this.warnEmptyTitle();
            }
            this.suppressWarnTitle = false;
        },
        inputNames(newInputNames) {
            if (!this.suppressWarnNames || newInputNames.length > 0) {
                this.warnEmptyNames();
            }
            this.suppressWarnNames = false;
        },
        isOpen(newValue) {
            this.isActive = newValue;
        },
        paraNames(newValue) {
            if (newValue.length > 0) {
                let tmpTitle = null;
                if (this.isIndexCreate) {
                    tmpTitle = this.inputTitle;
                } else {
                    tmpTitle = this.lastInputTitle;
                }

                // select create and refresh inputs
                this.selectedIndex = this.indexCreate;
                this.refreshInputs();

                // restore title
                this.inputTitle = tmpTitle;
                // put paraNames from parent component
                this.inputNames = this.paraNames;
                // and consume it (make it empty)
                this.$emit('update:paraNames', '');
                // suppress further changes made to inputs due to selectedIndex change
                this.suppressInputOverwrite = true;
            }
        },
    },
    created() {
        // use a getter
        // ref: https://vuejs.org/guide/essentials/watchers.html#basic-example
        watch(
            () => store.allLists,
            (newValue, oldValue) => {
                // restore dropdown state
                let lastTitle = store.getTitle(this.selectedIndex, oldValue);
                let clicked = false;
                // restore selected state
                let index = 0;
                for (let key of newValue) {
                    if (key[0] === lastTitle) {
                        this.selectedIndex = index;
                        clicked = true;
                        break;
                    }
                    index++;
                }
                if (!clicked) {
                    // if nothing selected, select the first item
                    this.selectedIndex = 0;
                }
            }
        );
    },
    mounted() {
        document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button.btn-cancel').forEach(($close) => {
            $close.addEventListener('click', this.closeModal);
        });
    },
    template: /*html*/`
    <div class="modal" :class="{'is-active': isActive}">
        <div class="modal-background"></div>
        <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">设置名单</p>
            <button class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
            <div class="field">
                <label class="label">名单名称</label>
                <div class="field has-addons">
                    <div class="control">
                        <dropdown-comp 
                            :item-list-group="[store.allTitles, ['新建名单']]" 
                            :dropdownContentMaxHeight=13
                            v-model="selectedIndex" 
                            :title="hintTitle">
                        </dropdown-comp>
                    </div>
                    <div class="control is-expanded">
                        <input class="input" type="text" placeholder="名单名称" v-model="inputTitle" :class="{'is-danger': warnTitleMsg.length > 0}">
                        <p class="help is-danger">{{ warnTitleMsg }}</p>
                    </div>
                    <p class="control">
                        <button class="button btn-reset" @click="refreshInputs">
                            <span class="icon">
                            <i class="fas fa-undo" ></i>
                            </span>
                            <span>重置</span>
                        </button>
                    </p>
                </div>
            </div>

            <div class="field">
                <label class="label">名单内容</label>
                <div class="control">
                <textarea class="textarea" rows="5" placeholder="直接输入，或从文件加载" v-model="inputNames" :class="{'is-danger': warnNamesMsg.length > 0}"></textarea>
                </div>
                <p class="help is-danger">{{ warnNamesMsg }}</p>
                <div class="control">
                    <div class="file has-name is-fullwidth">
                        <label class="file-label">
                        <input class="file-input" @click="onKeyFile">
                        <span class="file-cta">
                            <span class="file-icon">
                            <i class="fas fa-upload"></i>
                            </span>
                            <span class="file-label">
                            从文件加载并覆盖文本框
                            </span>
                        </span>
                        <span class="file-name">{{ selectedFilename }}</span>
                        </label>
                    </div>
                </div>
            </div>
            <progress class="progress is-link is-small" max="100" v-if="hasProgressBar" :value="progress"></progress>
        </section>

        <!-- ref: https://github.com/jgthms/bulma/issues/516#issuecomment-294279272 -->
        <!-- related: https://github.com/jgthms/bulma/issues/1589#issuecomment-693128769 -->
        <footer class="modal-card-foot" style="justify-content: space-between;">
            <div>
                <button class="button is-link btn-save" ref="btnSave" @click="setNamelist">{{ hintTitle }}</button>
                <button class="button btn-cancel">取消</button>
            </div>
            <button class="button is-danger btn-delete" ref="btnDelete" :disabled="isIndexCreate" @click="removeNamelist">删除</button>
        </footer>
        </div>
    </div>
    `
}