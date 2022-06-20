export default {
    props: {
        itemListGroup: {
            type: Array,
            default: [[]]
        },
        modelValue: {
            type: Number,
            default: 0
        },
        dropdownContentMaxHeight: {
            type: Number,
            default: 10
        },
        title: String
    },
    // modelValue is builtin variable name
    // ref: https://vuejs.org/guide/components/events.html#usage-with-v-model
    emits: ['update:modelValue'],
    data() {
        return {
            isActive: false,
            selectedIndex: this.modelValue,
            dropup: false,
            clickSignal: false,
        }
    },
    computed: {
        selectedIndices() {
            // let tmp = this.modelValue;
            let tmp = this.selectedIndex;
            // do not use forEach, we cannot break the loop inside
            // do not use for...in, the iteration order is not guaranteed
            let groupIndex = 0;
            for (let itemList of this.itemListGroup) {
                if (tmp >= itemList.length) {
                    tmp -= itemList.length;
                } else {
                    break;
                }
                groupIndex++;
            }
            return [groupIndex, tmp]
        }
    },
    watch: {
        modelValue(newValue) {
            this.selectedIndex = newValue;
        }
    },
    methods: {
        selectDropdownItem(groupIndex, itemIndex) {
            // even if the parent component does not update modalValue,
            // we can still make change effect
            this.selectedIndex = this.flattenIndex(groupIndex, itemIndex);
            this.$emit('update:modelValue', this.selectedIndex);
            this.isActive = false;
        },
        toggleDropdown() {
            this.isActive = !this.isActive;
            // signal the document click listener
            this.clickSignal = true;
        },
        flattenIndex(groupIndex, itemIndex) {
            let ans = 0;
            for (let i = 0; i < groupIndex; i++) {
                ans += this.itemListGroup[i].length;
            }
            ans += itemIndex;
            return ans;
        },
        checkSelected(groupIndex, itemIndex) {
            return groupIndex === this.selectedIndices[0] 
                    && itemIndex === this.selectedIndices[1];
        }
    },
    created() {
        if (this.$attrs.class) {
            this.dropup = this.$attrs.class.includes('is-up');
        }
    },
    mounted() {
        document.addEventListener('click', () => {
            if (this.clickSignal) {
                // event comes from trigger, consume signal
                this.clickSignal = false;
            } else {
                this.isActive = false;
            }
        });
    },
    template: /*html*/`
    <div class="dropdown" :class="{'is-active': isActive}">
        <div class="dropdown-trigger" @click="toggleDropdown">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                <span>{{ title }}</span>
                <span class="icon is-small">
                    <i v-if="dropup" class="fas fa-angle-up" aria-hidden="true"></i>
                    <i v-else class="fas fa-angle-down" aria-hidden="true"></i>
                </span>
            </button>
        </div>
        <div class="dropdown-menu" role="menu" @click.stop>
            <div class="dropdown-content" :style="{'max-height': dropdownContentMaxHeight+'em'}" style="overflow: auto;">
                <template v-for="(itemList, groupIndex) in itemListGroup">
                    <a class="dropdown-item" 
                        v-for="(item, itemIndex) in itemList" 
                        :class="{'is-active': checkSelected(groupIndex, itemIndex)}" 
                        @click="selectDropdownItem(groupIndex, itemIndex)">{{ item }}</a>
                    <hr class="dropdown-divider" v-show="itemList.length > 0 && groupIndex != itemListGroup.length-1">
                </template>
            </div>
        </div>
    </div>
    `
}