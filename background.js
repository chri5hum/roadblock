import { createMenus } from './menu.js'

const ALLOW_URL_LIST = ["about:", "moz-extension:"]
const BLOCK_URL_LIST = [".*"]
// const BLOCK_URL_LIST = []
const BLOCK_TIME_LIST = [["0000", "0900"], ["2300", "2400"]]
const blockSets = []
// BLOCK_TIME_LIST.push(["0000", "2400"])

const BLOCKED_HTML = "blocked.html"

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

async function updateBlockSets() {
    const blockSetKeys = ['tab0data', 'tab1data', 'tab2data']
    for (const blockSetKey of blockSetKeys) {
        await browser.storage.local.get(blockSetKey).then((result) => {
          if (!result || !result[blockSetKey]) {
              console.warn(`No data found for ${blockSetKey}`);
              return;
          }

          const blockSetObject = {
            'domains': [],
            'times': []
          }
          const data = result[blockSetKey];
          if (!data['domains']) return;

          blockSetObject['domains'] = data['domains'].split("\n")

          if (data['times']) {
            blockSetObject['times'] = data['times'].split(",").map((time) => time.split('-'));
          } else {
            blockSetObject['times'] = ["0000-2400"];
          }

          // console.log(`Blocklist for ${blockSetKey}:`, blockSetObject);
          blockSets.push(blockSetObject);
      });
    }
    console.log('blockSets: ', blockSets)
  
}

function shouldBlockTab(tabInfo) {
  const url = new URL(tabInfo.url)
  if (ALLOW_URL_LIST.some((re) => isRegexMatch(url.protocol, re))) return false

  for (const blockSet in blockSets) {
    if (shouldBlockTabByBlockSet(tabInfo, blockSet)) return true
  }

  return false
}

function shouldBlockTabByBlockSet(tabInfo, blockSet) {
  //check url applicable
  const url = new URL(tabInfo.url)
  const blockUrlList = blockSet.domains
  const blockTimeList = blockSet.times
  if (!blockUrlList.some((re) => isRegexMatch(url.host, re))) return false

  // check time acceptable
  const curDate = new Date()
  for (const blockStartEnd of blockTimeList) {
    const startDate = new Date()
    startDate.setHours(parseInt(blockStartEnd[0].slice(0, 2), 10))
    startDate.setMinutes(parseInt(blockStartEnd[0].slice(2, 4), 10))

    const endDate = new Date()
    endDate.setHours(parseInt(blockStartEnd[1].slice(0, 2), 10))
    endDate.setMinutes(parseInt(blockStartEnd[1].slice(2, 4), 10))

    if (startDate <= curDate && curDate <= endDate) return true
  }

  return false
}

function shouldBlockTab_v0(tabInfo) {

    //check url applicable
    const url = new URL(tabInfo.url)
    if (ALLOW_URL_LIST.some((re) => isRegexMatch(url.protocol, re))) return false
    if (!BLOCK_URL_LIST.some((re) => isRegexMatch(url.host, re))) return false

    // check time acceptable
    const curDate = new Date()
    for (const blockStartEnd of BLOCK_TIME_LIST) {
      const startDate = new Date()
      startDate.setHours(parseInt(blockStartEnd[0].slice(0, 2), 10))
      startDate.setMinutes(parseInt(blockStartEnd[0].slice(2, 4), 10))

      const endDate = new Date()
      endDate.setHours(parseInt(blockStartEnd[1].slice(0, 2), 10))
      endDate.setMinutes(parseInt(blockStartEnd[1].slice(2, 4), 10))

      if (startDate <= curDate && curDate <= endDate) return true
    }

    return false

}

function handleTabUpdated(tabId, changeInfo, tabInfo) {

    if (tabInfo.status == "complete") {
        updateBlockSets();

        if (shouldBlockTab(tabInfo)) {
            const tabUpdate = {
                loadReplace: true,
                url: BLOCKED_HTML
            }
            browser.tabs.update(tabId, tabUpdate);
        }
	}

}

createMenus();

browser.tabs.onCreated.addListener(handleTabCreated);
browser.tabs.onUpdated.addListener(handleTabUpdated);
