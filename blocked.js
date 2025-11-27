import { getBlockConfig, setOverride } from './common.js';

var blockingConfig = {}

async function init(){
    const url = new URL(window.location.href);
    const originalUrl = url.searchParams.get("url");

    getBlockConfig(url.searchParams.get("id")).then((blockingConfig) => {

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
                setOverride(blockingConfig.blockConfigId, duration).then(() => {
                
                    const tabUpdate = {
                        loadReplace: true,
                        url: originalUrl
                    }
                    browser.tabs.update(tabUpdate);
                })

            } else {
                alert("Input is incorrect. Please try again.");
            }
        });
    })
};

init();
