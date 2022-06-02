let query = '';
let selectedIndex = -1;
let hoveredDropdownIndex = -1;
let clickableItems = null;

utools.onPluginEnter(({code, type, payload}) => {
    console.log('用户进入插件', code, type, payload);
    // if no configured list, pop up the setting modal
    if (getAllKeys().length == 0 || code === "set") {
        openModal();
    } else if (code === "catch") {
        closeModal();
        query = payload;
        updateResult();
    }
});

function warnEmptyKey(show=true) {
    const rootNode = document.querySelector('#field-key');
    if (show) {
        rootNode.querySelector('.input').classList.add('is-danger');
        rootNode.querySelector('.help').innerText = '名单名称不能为空';
    } else {
        rootNode.querySelector('.input').classList.remove('is-danger');
        rootNode.querySelector('.help').innerText = '';
    }
}

function warnEmptyNames(show=true, msg='名单内容不能为空') {
    if (show) {
        document.querySelector('#setbox').classList.add('is-danger');
        document.querySelector('#field-names .help').innerText = msg;
    } else {
        document.querySelector('#setbox').classList.remove('is-danger');
        document.querySelector('#field-names .help').innerText = '';
    }
}

function toggleCheckables(single=true) {
    document.querySelectorAll('.tabs li').forEach(item => item.classList.remove('is-active'));
    const checkables = document.querySelectorAll("#check-namelists input");
    if (single) {
        document.querySelector('#single').classList.add('is-active');
        checkables.forEach(item => item.setAttribute("type", "radio"));
    } else {
        document.querySelector('#multiple').classList.add('is-active');
        checkables.forEach(item => item.setAttribute("type", "checkbox"));
    }
}

function setNameList() {
    const newNamesString = document.querySelector("#setbox").value.trim();
    const inputKey = document.querySelector('#listName').value.trim();

    let error = false;
    if (inputKey.length == 0) {
        warnEmptyKey();
        error = true;
    }
    if (newNamesString.length == 0) {
        warnEmptyNames();
        error = true;
    }
    if (error) {
        return;
    }

    if (setNames(inputKey, newNamesString, getKeyByIndex(selectedIndex))) { // success
        refreshUI();
        closeModal();
    } else {
        warnEmptyNames(true, '名单内容没有名字');
    }
}

function removeNameList() {
    let key = getKeyByIndex(selectedIndex);
    if (key) {
        if (removeNames(key)) { // success
            refreshUI();
            closeModal();
        }
    }
}

function findFish(namesString, allNames) {
    namesString = namesString.trim();
    const fish = [];
    allNames.forEach(v => {
       if (!namesString.includes(v)) {
          fish.push(v);
       }
    })
    return fish;
}

function updateResult() {
    const allNames = new Set();

    document.querySelectorAll('#check-namelists input').forEach(node => {
        if (node.checked) {
            getNames(getKeyByIndex(parseInt(node.getAttribute('index')))).forEach(allNames.add, allNames)
        }
    });

    const allNamesArray = Array.from(allNames);
    document.querySelector("#all-names").value = allNamesArray.join('，');

    fish = findFish(query, allNamesArray);
    prettyNames = fish.join('，');
    document.querySelector("#count").innerText = fish.length;
    document.querySelector("#names").innerText = prettyNames;
}

// function updateSelectedList() {
//     const listNameInputNode = document.querySelector('#listName');
//     const inputBox = document.querySelector("#setbox");
//     const deleteBtn = document.querySelector(".btn-delete");
//     const saveBtn = document.querySelector(".btn-save");
//     selectedKey = document.querySelector("#select-names").value;
//     if (selectedKey !== NEW_KEY) {
//         console.log('selected: ' + selectedKey);
//         listNameInputNode.value = selectedKey;
//         inputBox.value = getNames(selectedKey).join('，');
//         deleteBtn.disabled = false;
//         saveBtn.innerText = '更新名单';
//     } else {
//         listNameInputNode.value = '';
//         inputBox.value = '';
//         deleteBtn.disabled = true;
//         saveBtn.innerText = '新建名单';
//     }
// }

function getKeyByIndex(index) {
    if (index >= 0 && index < getAllKeys().length) {
        return getAllKeys()[index];
    } else {
        return null;
    }
}

function selectDropdownItem(index, force=false) {
    hoverDropdownItem(index);
    // select a different item, or force refreshing
    if (selectedIndex !== index || force) {
        selectedIndex = index;
        hoveredDropdownIndex = selectedIndex;
        // update input fields' content
        const listNameInputNode = document.querySelector('#listName');
        const inputBox = document.querySelector("#setbox");
        const deleteBtn = document.querySelector(".btn-delete");
        const saveBtn = document.querySelector(".btn-save");
        const dropdownName = document.querySelector('#dropdown-name');
        let key = getKeyByIndex(index);
        if (key) {
            listNameInputNode.value = key;
            inputBox.value = getNames(key).join('，');
            deleteBtn.disabled = false;
            saveBtn.innerText = '更新名单';
            dropdownName.innerText = '更新名单';
        } else {
            listNameInputNode.value = '';
            inputBox.value = '';
            deleteBtn.disabled = true;
            saveBtn.innerText = '新建名单';
            dropdownName.innerText = '新建名单';
        }
        warnEmptyKey(false);
        warnEmptyNames(false);
    }
}

function refreshDropdown() {
    // use Bulma dropdown
    const dropdownItems = [];
    getAllKeys().forEach((key, index) => {
        let item = document.createElement('a');
        item.classList.add('dropdown-item');
        item.innerText = key;
        item.setAttribute('index', index);
        dropdownItems.push(item);
    });
    if (dropdownItems.length > 0) {
        let item = document.createElement('hr');
        item.classList.add('dropdown-divider');
        dropdownItems.push(item);
    }
    let item = document.createElement('a');
    item.classList.add('dropdown-item');
    item.innerText = '新建名单';
    item.setAttribute('index', getAllKeys().length);
    dropdownItems.push(item);
    document.querySelector('.dropdown-content').replaceChildren(...dropdownItems);
    clickableItems = document.querySelectorAll(".dropdown-content a.dropdown-item");
    clickableItems.forEach(v => v.addEventListener('click', () => selectDropdownItem(parseInt(v.getAttribute('index')))));

    selectDropdownItem(0, true);
}

function refreshCheckables() {
    const checkLabelNodes = [];
    getAllKeys().forEach((key, index) => {
        let node = document.createElement('label');
        node.classList.add('radio')
        let inputNode = document.createElement('input');
        inputNode.setAttribute('type', 'radio');
        inputNode.setAttribute('name', 'foobar');
        inputNode.setAttribute('index', index);
        inputNode.addEventListener('change', updateResult);
        node.appendChild(inputNode);
        node.appendChild(document.createTextNode(' ' + key + ' '));
        checkLabelNodes.push(node);
    });
    if (checkLabelNodes.length > 0) {
        checkLabelNodes[0].querySelector('input').checked = true;
    }
    document.querySelector('#check-namelists').replaceChildren(...checkLabelNodes);
    toggleCheckables(true);
}

// function refreshSelect() {
//     const optionNodes = []
//     getAllKeys().forEach(key => optionNodes.push(new Option(key, key)));
//     if (optionNodes.length > 0) {
//         const separator = new Option("─────");
//         separator.disabled = true;
//         optionNodes.push(separator);
//     }
//     optionNodes.push(new Option("新建名单", "newList"));
//     document.querySelector("#select-names").replaceChildren(...optionNodes);
// }

function refreshUI() {
    refreshDropdown();
    // refreshSelect(); // can be commented out
    refreshCheckables();

    updateResult();
    // updateSelectedList(); // can be commented out
}

function closeModal() {
    const $target = document.querySelector('.modal');
    $target.classList.remove('is-active');
}

function openModal() {
    const $target = document.querySelector('.modal');
    $target.classList.add('is-active');
}

function hoverDropdownItem(index) {
    clickableItems.forEach(v => v.classList.remove('is-active'));
    clickableItems[index].classList.add('is-active');
}

function closeDropdown() {
    const dropdownNode = document.querySelector('.dropdown');
    dropdownNode.classList.remove("is-active");
    // reset hover index
    hoveredDropdownIndex = selectedIndex;
    hoverDropdownItem(hoveredDropdownIndex);
}

document.addEventListener("DOMContentLoaded", function() {
    // this function runs when the DOM is ready, i.e. when the document has been parsed
    refreshUI();

    // document.querySelector("#select-names").addEventListener('change', (event) => {
    //     updateSelectedList();
    // });

    document.querySelector('#single').addEventListener('click', () => {
        toggleCheckables(true);
    });

    document.querySelector('#multiple').addEventListener('click', () => {
        toggleCheckables(false);
    });

    // Add a click event on buttons to open a specific modal
    document.querySelectorAll('.js-modal-trigger').forEach(($trigger) => {
        const modal = $trigger.dataset.target;
        const $target = document.getElementById(modal);

        $trigger.addEventListener('click', () => {
            $target.classList.add('is-active');
        })
    });

    // Add a click event on various child elements to close the parent modal
    document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button.btn-cancel').forEach(($close) => {
        $close.addEventListener('click', () => {
            closeModal();
        })
    });

    document.querySelector('.btn-save').addEventListener('click', () => {
        setNameList();
    });

    document.querySelector('.btn-delete').addEventListener('click', () => {
        removeNameList();
    });

    document.querySelector('.btn-reset').addEventListener('click', () => {
        selectDropdownItem(selectedIndex, true);
    });

    const dropdownNode = document.querySelector('.dropdown');
    dropdownNode.addEventListener('click', (event) => {
        // stop propagation to avoid document click event
        event.stopPropagation();
        if (dropdownNode.classList.contains('is-active')) {
            closeDropdown();
        } else {
            dropdownNode.classList.add('is-active');
        }
    });
    dropdownNode.addEventListener('keydown', (event) => {
        // keyboard select
        switch (event.key) {
            case 'ArrowDown':
                console.log("down");
                if (hoveredDropdownIndex < clickableItems.length-1) {
                    hoverDropdownItem(++hoveredDropdownIndex);
                }
                // prevent default to avoid scrolling the page
                event.preventDefault();
                break;
            case 'ArrowUp':
                console.log("up");
                if (hoveredDropdownIndex > 0) {
                    hoverDropdownItem(--hoveredDropdownIndex);
                }
                // prevent default to avoid scrolling the page
                event.preventDefault();
                break;
            case 'Enter':
                console.log("enter");
                selectDropdownItem(hoveredDropdownIndex);
                break;
        }
    });
    document.addEventListener("click", () => {
        closeDropdown();
    });

    document.querySelector('#field-key .input').addEventListener("input", (e) => {
        if (e.target.value.trim().length === 0) {
            warnEmptyKey(true);
        } else {
            warnEmptyKey(false);
        }
    });

    document.querySelector('#setbox').addEventListener("input", (e) => {
        if (e.target.value.trim().length === 0) {
            warnEmptyNames(true);
        } else {
            warnEmptyNames(false);
        }
    });

    // ref: https://stackoverflow.com/a/26298948/11854304
    // read names from file
    document.querySelector('#input-file').addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            let file = files[0];
            if (!file) {
                return;
            }
            console.log(file.type);
            document.querySelector('#span-filename').textContent = file.name;
            let reader = new FileReader();
            reader.onload = function(e) {
              let content = e.target.result;
              document.querySelector('#setbox').value = content;
            };
            reader.readAsText(file);
        }
    });
});