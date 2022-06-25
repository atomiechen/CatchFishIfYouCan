import { createApp } from './vue.esm-browser.prod.js'
import { store } from './store.js'
import ConfigModalComp from './ConfigModalComp.js'
import MainWindowComp from './MainWindowComp.js'


const app = createApp({
    components: {
        ConfigModalComp,
        MainWindowComp
    },
    data() {
        return {
            // shared data
            store,
            // main window related
            query: '',
            // modal related
            isModalOpen: false,
            paraNames: '',
        }
    },
    methods: {
        openModal() {
            this.isModalOpen = true;
        },
        closeModal() {
            this.isModalOpen = false;
        },
    },
    mounted() {
        utools.onPluginEnter(({code, type, payload}) => {
            console.log('用户进入插件', code, type, payload);
        
            utools.setSubInput(({ text }) => {
                this.query = text;
            }, '输入查找文本', false);

            if (code === "new") {
                this.query = '';
                this.openModal();
                // update input names
                this.paraNames = payload;
            } else if (code === "set" || store.hasNoList()) {
                this.query = '';
                // if no configured list, pop up the setting modal
                this.openModal();
            } else if (code === "catch") {
                this.query = payload;
                utools.setSubInputValue(this.query);
                utools.subInputBlur();
                this.closeModal();
            }
        });

        utools.onDbPull(() => {
            console.log('onDbPull');
            store.updateAllLists();
        });
        store.updateAllLists();
    }
});
app.mount('#app');
