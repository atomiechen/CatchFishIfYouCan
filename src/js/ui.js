let query = '';
let selectedIndex = -1;
let hoveredDropdownIndex = -1;
let clickableItems = null;
let progressBar = document.createElement('progress');
progressBar.max = 100;
progressBar.id = 'pgbar';
progressBar.classList.add('progress');
progressBar.classList.add('is-small');
let inputTitleBox = null;
let inputNamesBox = null;
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

function getVersion(index) {
    return checkIndex(index)? allLists[index][2] : null;
}

utools.onPluginEnter(({code, type, payload}) => {
    console.log('用户进入插件', code, type, payload);

    utools.setSubInput(({ text }) => {
        query = text;
        updateResult();
    }, '输入查找文本', false);

    if (code === "new") {
        query = '';
        openModal();
        selectDropdownItem(clickableItems.length-1);
        inputNamesBox.value = payload;
        warnEmptyNames(false);
    } else if (code === "set" || allLists.length == 0) {
        query = '';
        // if no configured list, pop up the setting modal
        openModal();
    } else if (code === "catch") {
        query = payload;
        utools.setSubInputValue(query);
        utools.subInputBlur();
        updateResult();
        closeModal();
    }
});

utools.onDbPull(() => {
    console.log('onDbPull');
    refreshUI();
});

function warnEmptyTitle(show=true, msg='名单名称不能为空') {
    if (show) {
        inputTitleBox.classList.add('is-danger');
        document.querySelector('#field-key .help').innerText = msg;
    } else {
        inputTitleBox.classList.remove('is-danger');
        document.querySelector('#field-key .help').innerText = '';
    }
}

function warnEmptyNames(show=true, msg='名单内容不能为空') {
    if (show) {
        inputNamesBox.classList.add('is-danger');
        document.querySelector('#field-names .help').innerText = msg;
    } else {
        inputNamesBox.classList.remove('is-danger');
        document.querySelector('#field-names .help').innerText = '';
    }
}

function isEmptyTitle() {
    return inputTitleBox.value.trim().length === 0;
}

function isEmptyNames() {
    return inputNamesBox.value.trim().length === 0;
}

function isEmptyTitleAndWarn() {
    if (isEmptyTitle()) {
        warnEmptyTitle(true);
        return true;
    } else {
        warnEmptyTitle(false);
        return false;
    }
}

function isEmptyNamesAndWarn() {
    if (isEmptyNames()) {
        warnEmptyNames(true);
        return true;
    } else {
        warnEmptyNames(false);
        return false;
    }
}

function toggleCheckables() {
    const checkables = document.querySelectorAll("#check-namelists input");
    if (document.querySelector('#switch').checked) {
        checkables.forEach(item => item.setAttribute("type", "checkbox")); 
    } else {
        checkables.forEach(item => item.setAttribute("type", "radio"));
    }
    updateResult();
}

function setNameList() {
    const inputTitle = inputTitleBox.value.trim();

    let error = false;
    let oldTitle = getTitle(selectedIndex);
    let nameArray = null;

    if (isEmptyTitleAndWarn()) {
        error = true;
    } else {
        // check if title already exists to prevent overriding
        if ((oldTitle === null || oldTitle !== inputTitle) && hasList(inputTitle)) {
            warnEmptyTitle(true, '名单名称已存在');
            error = true;
        }
    }
    if (isEmptyNamesAndWarn()) {
        error = true;
    } else {
        const newNamesString = inputNamesBox.value.trim();
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
    // force update input content
    refreshUI(true);
    closeModal();
}

function removeNameList() {
    let title = getTitle(selectedIndex);
    if (title) {
        if (removeList(title)) { // success
            // force update input content
            refreshUI(true);
            closeModal();
        } else {
            warnEmptyNames(true, '不存在此名单');
        }
    }
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
    // remove uploaded filename
    document.querySelector('#span-filename').textContent = '';
    if (!isIndexNew(index)) {
        inputTitleBox.value = getTitle(index);
        inputNamesBox.value = getNames(index).join('，');
    } else {
        inputTitleBox.value = '';
        inputNamesBox.value = '';
    }
    warnEmptyTitle(false);
    warnEmptyNames(false);
}

function refreshDropdown(dropdownState, force) {
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
        let version = getVersion(index);
        if (title) {
            item.innerText = title;
        } else {
            item.innerText = '新建名单';
        }
        item.addEventListener('click', () => selectDropdownItem(index));
        // restore dropdown state
        if (dropdownState && dropdownState[0] === title) {
            // check version
            if (!force && dropdownState[1] === version) {
                // same version, remain input content
                selectDropdownItem(index, true, true);
            } else {
                // different version, or force refresh
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
    const checkLabelNodes = [];
    let multiple = document.querySelector('#switch').checked;
    let checkedCount = 0;
    allLists.forEach((key, index) => {
        let node = document.createElement('label');
        node.innerText = getTitle(index);
        let inputNode = document.createElement('input');
        inputNode.classList.add('is-checkradio');
        inputNode.classList.add('is-link');
        if (multiple) {
            inputNode.setAttribute('type', 'checkbox');
        } else {
            inputNode.setAttribute('type', 'radio');
        }
        inputNode.id = "input" + index;
        node.setAttribute('for', inputNode.id);
        inputNode.setAttribute('name', 'foobar');
        inputNode.setAttribute('index', index);
        inputNode.addEventListener('change', updateResult);
        // restore checkable states
        if (checkableStates && checkableStates[getTitle(index)] === getVersion(index)) {
            inputNode.checked = true;
            checkedCount++;
        }
        checkLabelNodes.push(inputNode);
        checkLabelNodes.push(node);
    });
    document.querySelector('#check-namelists').replaceChildren(...checkLabelNodes);
    // if nothing checked, check the first one
    if (checkedCount == 0 && checkLabelNodes.length > 0) {
        document.querySelector('#check-namelists input').checked = true;
    }
}

function saveCheckableStates() {
    // record checkable states
    const checkableStates = {};
    document.querySelectorAll('#check-namelists label input').forEach(v => {
        if (v.checked) {
            let index = parseInt(v.getAttribute('index'));
            checkableStates[getTitle(index)] = getVersion(index);
        }
    });
    return checkableStates;
}

function saveDropdownState() {
    const dropdownState = [getTitle(selectedIndex), getVersion(selectedIndex)];
    return dropdownState;
}

function refreshUI(force=false) {
    // must be called before updateAllLists(), because need to store titles using allLists
    let checkableStates = null;
    let dropdownState = null;
    if (allLists) {
        checkableStates = saveCheckableStates();
        dropdownState = saveDropdownState();
    }

    updateAllLists();

    refreshCheckables(checkableStates);
    refreshDropdown(dropdownState, force);

    updateResult();
}

function closeModal() {
    const $target = document.querySelector('#modal-settings');
    $target.classList.remove('is-active');
}

function openModal() {
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

    // frequently used nodes
    inputTitleBox = document.querySelector('#setTitleBox');
    inputNamesBox = document.querySelector('#setNamesBox');

    refreshUI(true);

    document.querySelector('#switch').addEventListener('change', toggleCheckables);

    // Add a click event on buttons to open a specific modal
    document.querySelector('#js-modal-trigger').addEventListener('click', openModal);

    // Add a click event on various child elements to close the parent modal
    document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button.btn-cancel').forEach(($close) => {
        $close.addEventListener('click', closeModal);
    });

    document.querySelector('.btn-save').addEventListener('click', setNameList);

    document.querySelector('.btn-delete').addEventListener('click', removeNameList);

    document.querySelector('.btn-reset').addEventListener('click', () => {
        refreshInputs(selectedIndex);
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
    document.addEventListener("click", closeDropdown);

    inputTitleBox.addEventListener("input", isEmptyTitleAndWarn);

    inputNamesBox.addEventListener("input", isEmptyNamesAndWarn);

    // ref: https://stackoverflow.com/a/26298948/11854304
    // read names from file
    const inputFileBox = document.querySelector('#input-file');
    inputFileBox.addEventListener('change', (event) => {
        // on Windows the plugin window disappears after the select file window pops up
        utools.showMainWindow();
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
                // set input names box's content to file content
                inputNamesBox.value = content;
                isEmptyNamesAndWarn();
                removeProgressBar();
                // if empty, set title to filename
                if (isEmptyTitle()) {
                    inputTitleBox.value = file.name.replace(/\.[^/.]+$/, "")
                    isEmptyTitleAndWarn();
                }
            });
            reader.addEventListener('progress', e => {
                if (e.lengthComputable) {
                    let progress = parseInt( ((e.loaded / e.total) * 100), 10 );
                    setProgressBar(progress);
                }
            });
            reader.readAsText(file);
            // clear value to enable another change event even if it is the same file
            inputFileBox.value = '';
        }
    });
});