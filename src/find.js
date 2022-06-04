let query = '';
let selectedIndex = -1;
let hoveredDropdownIndex = -1;
let clickableItems = null;
let progressBar = document.createElement('progress');
progressBar.max = 100;
progressBar.id = 'pgbar';
progressBar.classList.add('progress');
progressBar.classList.add('is-small');
let allLists = null;

function updateAllLists() {
    allLists = getAllLists();
    console.log("update allLists");
    console.log(allLists);
}

function isIndexNew(index) {
    return index == allLists.length;
}

function checkIndex(index) {
    return index >= 0 && index < allLists.length;
}

function getTitle(index) {
    return checkIndex(index)? allLists[index][0] : null;
}

function getNames(index) {
    return checkIndex(index)? allLists[index][1] : null;
}

// const splitLines = str => str.split(/\r?\n/)
// const split = str => str.split(/[\s,.;，。；|]+/)
const split = str => str.split(/[^a-zA-Z\u00B7\u3007\u3400-\u4DBF\u4E00-\u9FFF\uE000-\uF8FF\uD840-\uD8C0\uDC00-\uDFFF\uF900-\uFAFF]+/)

function stringToNames(namesString) {
    const allNames = new Set();
    split(namesString.trim())
        // remove empty names
        .filter(v => v)
        // remove duplicate names
        .forEach(allNames.add, allNames);
    return Array.from(allNames);
}

utools.onPluginEnter(({code, type, payload}) => {
    console.log('用户进入插件', code, type, payload);
    if (code === "new") {
        openModal();
        selectDropdownItem(clickableItems.length-1);
        document.querySelector('#setNamesBox').value = payload;
    } else if (code === "set" || allLists.length == 0) {
        // if no configured list, pop up the setting modal
        openModal();
    } else if (code === "catch") {
        query = payload;
        closeModal();
    }
});

function warnEmptyTitle(show=true, msg='名单名称不能为空') {
    const rootNode = document.querySelector('#field-key');
    if (show) {
        rootNode.querySelector('.input').classList.add('is-danger');
        rootNode.querySelector('.help').innerText = msg;
    } else {
        rootNode.querySelector('.input').classList.remove('is-danger');
        rootNode.querySelector('.help').innerText = '';
    }
}

function warnEmptyNames(show=true, msg='名单内容不能为空') {
    if (show) {
        document.querySelector('#setNamesBox').classList.add('is-danger');
        document.querySelector('#field-names .help').innerText = msg;
    } else {
        document.querySelector('#setNamesBox').classList.remove('is-danger');
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
    updateResult();
}

function setNameList() {
    const newNamesString = document.querySelector("#setNamesBox").value.trim();
    const inputTitle = document.querySelector('#setTitleBox').value.trim();

    let error = false;
    let oldTitle = getTitle(selectedIndex);
    let nameArray = null;

    if (inputTitle.length == 0) {
        warnEmptyTitle();
        error = true;
    } else {
        // check if title already exists to prevent overriding
        if ((oldTitle === null || oldTitle !== inputTitle) && hasList(inputTitle)) {
            warnEmptyTitle(true, '名单名称已存在');
            error = true;
        }
    }
    if (newNamesString.length == 0) {
        warnEmptyNames();
        error = true;
    } else {
        nameArray = stringToNames(newNamesString);
        if (nameArray.length == 0) {
            warnEmptyNames(true, '名单内容没有名字');
            error = true;
        }
    }
    if (error) {
        return;
    }

    setList(inputTitle, nameArray, oldTitle);
    closeModal();
}

function removeNameList() {
    let title = getTitle(selectedIndex);
    if (title) {
        if (removeList(title)) { // success
            closeModal();
        } else {
            warnEmptyNames(true, '不存在此名单');
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
            getNames(parseInt(node.getAttribute('index'))).forEach(allNames.add, allNames)
        }
    });

    const allNamesArray = Array.from(allNames);
    document.querySelector("#all-names").value = allNamesArray.join('，');

    fish = findFish(query, allNamesArray);
    prettyNames = fish.join('，');
    document.querySelector("#count").innerText = fish.length;
    document.querySelector("#names").innerText = prettyNames;
}

function selectDropdownItem(index, force=false, remainInputs=false) {
    hoverDropdownItem(index);
    // select a different item, or force refreshing
    let needRefreshInputs = force? !remainInputs : (selectedIndex !== index);
    // update input fields' content
    if (needRefreshInputs) {
        refreshInputs(index);
    }
    // update buttons and dropdown name
    const deleteBtn = document.querySelector(".btn-delete");
    const saveBtn = document.querySelector(".btn-save");
    const dropdownName = document.querySelector('#dropdown-name');
    if (!isIndexNew(index)) {
        deleteBtn.disabled = false;
        saveBtn.innerText = '更新名单';
        dropdownName.innerText = '更新名单';
    } else {
        deleteBtn.disabled = true;
        saveBtn.innerText = '新建名单';
        dropdownName.innerText = '新建名单';
    }

    // update indices
    selectedIndex = index;
    hoveredDropdownIndex = selectedIndex;
}

function refreshInputs(index) {
    const titleInputNode = document.querySelector('#setTitleBox');
    const namesInputBox = document.querySelector("#setNamesBox");
    if (!isIndexNew(index)) {
        titleInputNode.value = getTitle(index);
        namesInputBox.value = getNames(index).join('，');
    } else {
        titleInputNode.value = '';
        namesInputBox.value = '';
    }
    warnEmptyTitle(false);
    warnEmptyNames(false);
}

function refreshDropdown(dropdownTitleState) {
    console.log("dropdownTitleState");
    console.log(dropdownTitleState);
    // use Bulma dropdown
    const dropdownItems = [];
    allLists.forEach(() => dropdownItems.push(document.createElement('a')));
    if (dropdownItems.length > 0) {
        let item = document.createElement('hr');
        item.classList.add('dropdown-divider');
        dropdownItems.push(item);
    }
    dropdownItems.push(document.createElement('a'));
    document.querySelector('.dropdown-content').replaceChildren(...dropdownItems);

    let clicked = false;
    clickableItems = document.querySelectorAll(".dropdown-content a");
    clickableItems.forEach((item, index) => {
        item.classList.add('dropdown-item');
        let title = getTitle(index);
        if (title) {
            item.innerText = title;
        } else {
            item.innerText = '新建名单';
        }
        item.addEventListener('click', () => selectDropdownItem(index));
        // restore dropdown state
        if (dropdownTitleState === title) {
            if (dropdownTitleState === null) {
                // remain input content
                console.log("DEBUG");
                selectDropdownItem(index, true, true);
            } else {
                // refresh input content
                selectDropdownItem(index, true);
            }
            clicked = true;
        }
    });
    // if nothing selected, force to select the first item
    if (!clicked) {
        selectDropdownItem(0, true);
    }
}

function refreshCheckables(checkableStates) {
    console.log("refreshCheckables");
    console.log(checkableStates);
    const checkLabelNodes = [];
    let single = document.querySelector('#single').classList.contains('is-active');
    let checkedCount = 0;
    allLists.forEach((key, index) => {
        let node = document.createElement('label');
        node.classList.add('radio');
        let inputNode = document.createElement('input');
        if (single) {
            inputNode.setAttribute('type', 'radio');
        } else {
            inputNode.setAttribute('type', 'checkbox');
        }
        inputNode.setAttribute('name', 'foobar');
        inputNode.setAttribute('index', index);
        inputNode.addEventListener('change', updateResult);
        // restore checkable states
        if (checkableStates && checkableStates.includes(key[0])) {
            inputNode.checked = true;
            checkedCount++;
        }
        node.appendChild(inputNode);
        node.appendChild(document.createTextNode(' ' + key[0] + ' '));
        checkLabelNodes.push(node);
    });
    // if nothing checked, check the first one
    if (checkedCount == 0 && checkLabelNodes.length > 0) {
        checkLabelNodes[0].querySelector('input').checked = true;
    }
    document.querySelector('#check-namelists').replaceChildren(...checkLabelNodes);
}

function saveCheckableStates() {
    // record checkable states
    const checkableStates = [];
    document.querySelectorAll('#check-namelists label input').forEach(v => {
        if (v.checked) {
            checkableStates.push(getTitle(parseInt(v.getAttribute('index'))));
        }
    });
    return checkableStates;
}

function refreshUI() {
    // must be called before updateAllLists(), because need to store titles using allLists
    const checkableStates = saveCheckableStates();
    const dropdownTitleState = getTitle(selectedIndex);
    updateAllLists();
    // refreshSelect(); // can be commented out
    refreshCheckables(checkableStates);
    refreshDropdown(dropdownTitleState);

    updateResult();
    // updateSelectedList(); // can be commented out
}

function closeModal() {
    refreshUI();
    const $target = document.querySelector('#modal-settings');
    $target.classList.remove('is-active');
}

function openModal() {
    refreshUI();
    const $target = document.querySelector('#modal-settings');
    $target.classList.add('is-active');
}

function showProgressBar() {
    progressBar.value = 0;
    document.querySelector('#sec-modalcardbody').appendChild(progressBar);
}

function removeProgressBar() {
    document.querySelector('#sec-modalcardbody').removeChild(progressBar);
}

function setProgressBar(progress) {
    progressBar.value = progress;
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
    updateAllLists();

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
    document.querySelector('.js-modal-trigger').addEventListener('click', () => {
        openModal();
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
            warnEmptyTitle(true);
        } else {
            warnEmptyTitle(false);
        }
    });

    document.querySelector('#setNamesBox').addEventListener("input", (e) => {
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
            showProgressBar();
            document.querySelector('#span-filename').textContent = file.name;
            let reader = new FileReader();
            reader.addEventListener('load', e => {
                console.log('file loaded');
                let content = e.target.result;
                document.querySelector('#setNamesBox').value = content;
                removeProgressBar();
            });
            reader.addEventListener('progress', e => {
                if (e.lengthComputable) {
                    let progress = parseInt( ((e.loaded / e.total) * 100), 10 );
                    setProgressBar(progress);
                }
            });
            reader.readAsText(file);
        }
    });
});