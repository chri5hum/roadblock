import { getBlockConfig, setOverride } from './common.js';

//may need to wrap try catch. if there is a failure, then should just drop
async function init(){
    const url = new URL(window.location.href);
    //need to do manual string parsing because originalURL may have '&' char inside
    let originalUrl = url.href.split('url=').at(-1);
    const currentTab = await browser.tabs.getCurrent();

    getBlockConfig(url.searchParams.get("id")).then((blockingConfig) => {

        const blockedReason = document.getElementById("blockedReason");
        blockedReason.textContent = "Page has been blocked by " + blockingConfig.blockConfigName;

        const displayParagraph = document.getElementById("displayParagraph");
        displayParagraph.innerHTML = blockingConfig.blockConfigOverride.replace(/\n/g, '<br>');

        const paragraphInput = document.getElementById("paragraphInput");
        const overrideBtn = document.getElementById("overrideBtn");
        const countdownDisplay = document.getElementById("countdown");

        const overrideDuration = document.getElementById("overrideDuration");

        overrideBtn.addEventListener("click", async () => {
            const duration = overrideDuration.value;

            if (overrideBtn.disabled) return; // Already counting down

            if (blockingConfig.blockConfigOverride == paragraphInput.value) {
                startCountdown(duration);
            } else {
                alert("Input is incorrect. Please try again.");
            }
        });

        function startCountdown(duration) {
            let timeLeft = blockingConfig.overrideDelay || 0;
            if (timeLeft <= 0) {
                applyOverride(duration, currentTab.id);
                return;
            }
            overrideBtn.disabled = true;
            overrideDuration.disabled = true;
            countdownDisplay.textContent = `Override in ${timeLeft} seconds...`;

            const countdownInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    countdownDisplay.textContent = `Override in ${timeLeft} seconds...`;
                } else {
                    clearInterval(countdownInterval);
                    applyOverride(duration, currentTab.id);
                }
            }, 1000);
        }

        async function applyOverride(duration, currentTabId) {
            setOverride(blockingConfig.blockConfigId, duration).then(() => {
                const tabUpdate = {
                    loadReplace: true,
                    url: originalUrl
                }
                browser.tabs.update(currentTabId, tabUpdate);
            })
        }
    })
};

init();
