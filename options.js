console.log('opened options.js')

var isFirstRun = true;
var curTabId = 'tab0';
var tabData = {}

function log(text) {
    const shouldLog = true;
    if (shouldLog) {
        console.log(text)
    }
}

function init() {
    document.getElementById("tab0").addEventListener("click", () => showTab("tab0"));
    document.getElementById("tab1").addEventListener("click", () => showTab("tab1"));
    document.getElementById("tab2").addEventListener("click", () => showTab("tab2"));

    document.getElementById("savetab").addEventListener("click", () => saveTab());
    showTab(curTabId);
}

async function showTab(tabId) {
    console.log('show tabId: ', tabId)
    if (isFirstRun) {
        isFirstRun = false;
        return;
    }
    saveTab(); //this needs to fixed to not run the first time


    // update button to active
    document.getElementById(curTabId).classList.remove("active");
    curTabId = tabId;
    document.getElementById(curTabId).classList.add("active");

    //update current selection
    const key = curTabId + 'data'

    tabData = await browser.storage.local.get(key)
    tabData = tabData[key] ? tabData[key] : {}

    document.getElementById('domains').value = tabData['domains'] ? tabData['domains']: ""
    document.getElementById('times').value = tabData['times'] ? tabData['times'] : ""
}

function saveTab() {
    console.log('save tab')
    tabData = {}
    tabData['domains'] = document.getElementById('domains').value
    tabData['times'] = document.getElementById('times').value

    const key = curTabId + 'data'
    storeItem = {}
    storeItem[key] = tabData
    browser.storage.local.set(storeItem)
}

init()