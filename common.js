
export async function setOverride(blockConfigId, duration) {
    const overrideKey = blockConfigId + 'override';

    const overrideData = {
        'blockConfigId': blockConfigId,
        'until': Date.now() + (duration * 60 * 1000) // duration in minutes converted to milliseconds
    };

    console.log(`Setting override for ${overrideKey} until ${overrideData.until}`);
    
    // Store the override data in local storage
    await browser.storage.local.set({
        [overrideKey]: overrideData
    });

}

export async function getOverride(blockConfigId) {
    const overrideKey = blockConfigId + 'override';
    
    const result = await browser.storage.local.get(overrideKey);
    if (result && result[overrideKey]) {
        return result[overrideKey];
    } else {
        console.log(`No override found for ${overrideKey}`);
        return null;
    }
}

export async function getBlockConfig(blockConfigId) {
    const blockConfigKey = blockConfigId + 'key';

    const result = await browser.storage.local.get(blockConfigKey);
    if (!result || !result[blockConfigKey]) {
        console.log(`No data found for ${blockConfigKey}`);
        return null;
    }

    const data = result[blockConfigKey];
    
    const blockConfig = {
        'blockConfigId': data['blockConfigId'] || blockConfigKey,
        'blockConfigName': data['blockConfigName'] || blockConfigKey,
        'domains': data['domains'] ? data['domains'].split('\n') : [],
        'times': data['times'] ? data['times'].split(',').map((time) => time.split('-')) : ["0000-2400"],
        'blockConfigOverride': data['blockConfigOverride'] || "",
        'overrideDelay': data['overrideDelay'] ? parseInt(data['overrideDelay'], 10) : 0,
    }

    return blockConfig;
    
}
