console.log('opened options.js')

var curConfigId = 'config0';
var tabData = {}

function log(text) {
    const shouldLog = true;
    if (shouldLog) {
        console.log(text)
    }
}

function init() {
    // set names

    document.getElementById("config0").addEventListener("click", () => showTab("config0"));
    document.getElementById("config1").addEventListener("click", () => showTab("config1"));
    document.getElementById("config2").addEventListener("click", () => showTab("config2"));

    document.getElementById("savetab").addEventListener("click", () => saveTab());
    showTab(curConfigId, false);
}

async function showTab(tabId, saveBeforeSwitch = true) {
    if (saveBeforeSwitch) {
        saveTab();
    }

    // update button to active
    document.getElementById(curConfigId).classList.remove("active");
    curConfigId = tabId;
    document.getElementById(curConfigId).classList.add("active");

    //update current selection
    const key = curConfigId + 'key'

    const result = await browser.storage.local.get(key)
    tabData = result[key] ? result[key] : {}
    document.getElementById('blockConfigName').value = tabData['blockConfigName'] || "";
    document.getElementById('domains').value = tabData['domains'] ? tabData['domains']: ""
    document.getElementById('times').value = tabData['times'] ? tabData['times'] : ""
    document.getElementById('blockConfigOverride').value = tabData['blockConfigOverride'] || "";
}

function saveTab() {
    log('save tab')

    tabData = {}
    tabData['blockConfigId'] = curConfigId
    tabData['blockConfigName'] = document.getElementById('blockConfigName').value
    tabData['domains'] = document.getElementById('domains').value
    tabData['times'] = document.getElementById('times').value
    tabData['blockConfigOverride'] = document.getElementById('blockConfigOverride').value

    const key = curConfigId + 'key'
    log(`Saving tab data for ${key}: ${tabData}`)
    console.log(tabData)
    browser.storage.local.set({
        [key]: tabData
    })
}

init()