const ALLOW_URL_LIST = ["about:", "moz-extension:"]
// const BLOCK_URL_LIST = [".*"]
const BLOCK_URL_LIST = []
const BLOCK_TIME_LIST = [("0000", "2400")]

function isRegexMatch(input, re) {
    // fix regex
    try {
      const regex = new RegExp(re);
      return regex.test(input);
    } catch (e) {
      console.error("Invalid regular expression:", e);
      return false;
    }
  }
function handleTabCreated() {
    // console.log("handleTabCreated: ");
}

function blockTab(tabId) {

}

function shouldBlockTab(tabInfo) {

    //check url applicable
    const url = new URL(tabInfo.url)
    console.log(url)
    if (ALLOW_URL_LIST.some((re) => isRegexMatch(url.protocol, re))) return false
    if (!BLOCK_URL_LIST.some((re) => isRegexMatch(url.host, re))) return false

    // check time acceptable
    // for ((start, end) in BLOCK_TIME_LIST) {
    //     const hours = parseInt(timeStr.slice(0, 2), 10);
    //     const minutes = parseInt(timeStr.slice(2, 4), 10);

    // }
    // const date = Date()


    

    return true

}

function handleTabUpdated(tabId, changeInfo, tabInfo) {
    // console.log(`Updated tab: ${tabId}`);
    // console.log("Changed attributes: ", changeInfo);
    // console.log("New tab Info: ", tabInfo);
    
    // if (changeInfo.url) {
    //     console.log(changeInfo.url)
    //     if (changeInfo.url.includes("novel")) {
    //         console.log("kill");
    //     }
    // }
    

    if (tabInfo.status == "complete") {
        if (shouldBlockTab(tabInfo)) {
            tabUpdate = {
                loadReplace: true,
                url: 'README.md'
            }
            browser.tabs.update(tabId, tabUpdate);
        }
	}

}

browser.tabs.onCreated.addListener(handleTabCreated);
browser.tabs.onUpdated.addListener(handleTabUpdated);
