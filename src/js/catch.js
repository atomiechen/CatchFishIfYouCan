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
    return Array.from(allNames).sort((a, b) => (a.length - b.length) || a.localeCompare(b));
}

function findFish(namesString, allNames) {
    namesString = namesString.trim();
    const fish = [];
    // reversely loop to check the longer string first 
    // than the shorter one that may be the prefix
    let i = allNames.length - 1;
    for (; i >= 0; i--) {
        let target = allNames[i];
        if (!namesString.includes(target)) {
            fish.push(target);
        } else {
            // replace all occurences of target word
            let re = new RegExp(target, 'g');
            namesString = namesString.replace(re,'|');
        }
    }
    return fish;
}
