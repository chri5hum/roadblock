import { createMenus } from './menu.js'
import { getBlockConfig, getOverride } from './common.js';

const ALLOW_URL_LIST = ["about:", "moz-extension:"]
var blockConfigs = []
const blockConfigOverrides = {}

// BLOCK_TIME_LIST.push(["0000", "2400"])

const BLOCKED_HTML = "blocked.html"

function substituteWildcard(input) {
    // Replace '*' with '.*' to make it a valid regex
    return input.replace('*', '.*');
}

function isRegexMatch(input, re) {
    re = substituteWildcard(re)

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

async function fetchBlockConfigs() {
  blockConfigs = []
  const blockConfigIds = ['config0', 'config1', 'config2']
  for (const blockConfigId of blockConfigIds) {
    const blockConfig = await getBlockConfig(blockConfigId);
    if (!blockConfig) continue;
    blockConfigs.push(blockConfig);
    
    const overrideData = await getOverride(blockConfig.blockConfigId);
    if (overrideData) {
      blockConfigOverrides[blockConfig.blockConfigId] = overrideData.until;
    }
  }
    
  console.log("Updated block configs:", blockConfigs);
  console.log("Block config overrides:", blockConfigOverrides);
}

function shouldBlockTab(tabInfo) {
  const url = new URL(tabInfo.url)
  if (ALLOW_URL_LIST.some((re) => isRegexMatch(url.protocol, re))) return false

  for (const blockSet of blockConfigs) {
    const blockingConfigId = shouldBlockTabByBlockSet(tabInfo, blockSet)
    if (Boolean(blockingConfigId)) {
      return blockingConfigId
    }
  }
  return ""
}

function shouldBlockTabByBlockSet(tabInfo, blockSet) {
  //check url applicable
  const url = new URL(tabInfo.url)
  const blockUrlList = blockSet.domains
  const blockTimeList = blockSet.times
  
  console.log("blockConfigOverrides:", blockConfigOverrides)
  if (blockConfigOverrides[blockSet.blockConfigId]) {
    if (blockConfigOverrides[blockSet.blockConfigId] > Date.now()) {
      console.log(`Tab allowed past ${blockSet.blockConfigId} by override until: ${new Date(blockConfigOverrides[blockSet.blockConfigId])}`);
      return ""
    }
  }

  if (blockUrlList.every((re) => !isRegexMatch(url.host, re))) return ""

  // check time acceptable
  const curDate = new Date()
  for (const blockStartEnd of blockTimeList) {
    const startDate = new Date()
    startDate.setHours(parseInt(blockStartEnd[0].slice(0, 2), 10))
    startDate.setMinutes(parseInt(blockStartEnd[0].slice(2, 4), 10))

    const endDate = new Date()
    endDate.setHours(parseInt(blockStartEnd[1].slice(0, 2), 10))
    endDate.setMinutes(parseInt(blockStartEnd[1].slice(2, 4), 10))

    if (startDate <= curDate && curDate <= endDate) {
      return blockSet.blockConfigId
    }
  }

  return ""
}

async function handleTabUpdated(tabId, changeInfo, tabInfo) {
    if (tabInfo.status == "complete") {
        await fetchBlockConfigs();

        const blockingConfigId = shouldBlockTab(tabInfo);
        if (blockingConfigId) {
            const tabUpdate = {
                loadReplace: true,
                url: BLOCKED_HTML + `?id=${blockingConfigId}&url=${tabInfo.url}`
            }
            browser.tabs.update(tabId, tabUpdate);
        }
	}

}

createMenus();

browser.tabs.onCreated.addListener(handleTabCreated);
browser.tabs.onUpdated.addListener(handleTabUpdated);
