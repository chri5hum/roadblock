function handleMenuClick(info, tab) {
	let id = info.menuItemId;
	if (id == "options") {
		let fullURL = browser.runtime.getURL('options.html');
		browser.tabs.create({ url: fullURL });
	}
}

export function createMenus() {
	if (!browser.menus) {
		return; // no support for menus!
	}

	browser.menus.removeAll();
    browser.menus.create({
		id: "options",
		title: "Options",
		contexts: ['action'],
	});

	browser.menus.onClicked.addListener(handleMenuClick)
}
