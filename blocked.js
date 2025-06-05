import { getBlockConfig, setOverride } from './common.js';

var blockingConfig = {}

async function fetchBlockingConfig(blockingConfigId) {
    blockingConfig = await getBlockConfig(blockingConfigId);
    // const blockingConfigKey = blockingConfigId + "key";
    // console.log(`Fetching blocking config for: ${blockingConfigKey}`);
    // await browser.storage.local.get(blockingConfigKey).then((result) => {
    //     if (!result || !result[blockingConfigKey]) {
    //         console.warn(`No data found for ${blockingConfigKey}`);
    //         return;
    //     }

    //     const blockConfigObject = {
    //         'blockConfigId': blockingConfigKey,
    //         'blockConfigName': result[blockingConfigKey]['blockConfigName'] || blockingConfigKey,
    //         'domains': [],
    //         'times': [],
    //         'blockConfigOverride': result[blockingConfigKey]['blockConfigOverride'] || "",
    //     }

    //     const data = result[blockingConfigKey];
    //     if (!data['domains']) return;

    //     blockConfigObject['domains'] = data['domains'].split("\n")

    //     if (data['times']) {
    //         blockConfigObject['times'] = data['times'].split(",").map((time) => time.split('-'));
    //     } else {
    //         blockConfigObject['times'] = ["0000-2400"];
    //     }

    //     blockingConfig = blockConfigObject;
    //   });
}

async function init(){
    const url = new URL(window.location.href);
    const originalUrl = url.searchParams.get("url");

    // await fetchBlockingConfig(url.searchParams.get("id"));
    blockingConfig = await getBlockConfig(url.searchParams.get("id"));

    const blockedReason = document.getElementById("blockedReason");
    blockedReason.textContent = "Page has been blocked by " + blockingConfig.blockConfigName;

    const displayParagraph = document.getElementById("displayParagraph");
    displayParagraph.textContent = blockingConfig.blockConfigOverride;

    const paragraphInput = document.getElementById("paragraphInput");
    const overrideBtn = document.getElementById("overrideBtn");

    const overrideDuration = document.getElementById("overrideDuration");

    overrideBtn.addEventListener("click", async () => {
        const duration = overrideDuration.value;

        if (displayParagraph.textContent == paragraphInput.value) {
            await setOverride(blockingConfig.blockConfigId, duration);
            
            const tabUpdate = {
                loadReplace: true,
                url: originalUrl
            }
            browser.tabs.update(tabUpdate);

        } else {
            alert("Input is incorrect. Please try again.");
        }
    });
};

init();
