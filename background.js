function createContextMenus() {
    try {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'save-current-page',
                title: 'Save current page to URL Organizer',
                contexts: ['page']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.log('Context menu creation handled:', chrome.runtime.lastError.message);
                }
            });

            chrome.contextMenus.create({
                id: 'save-link',
                title: 'Save link to URL Organizer',
                contexts: ['link']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.log('Context menu creation handled:', chrome.runtime.lastError.message);
                }
            });
        });
    } catch (error) {
        console.log('Context menu setup error handled:', error);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    createContextMenus();

    chrome.storage.local.get(['savedUrls', 'categories'], (result) => {
        if (!result.savedUrls) {
            chrome.storage.local.set({ savedUrls: [] });
        }
        if (!result.categories) {
            chrome.storage.local.set({ 
                categories: ['work', 'personal', 'research', 'entertainment', 'news', 'shopping', 'social', 'education', 'other'] 
            });
        }
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'save-current-page') {
        saveUrl(tab.url, tab.title || extractDomainFromUrl(tab.url), 'other');
    } else if (info.menuItemId === 'save-link') {
        saveUrl(info.linkUrl, info.linkUrl, 'other');
    }
});

async function saveUrl(url, title, category) {
    try {
        const result = await chrome.storage.local.get(['savedUrls']);
        const savedUrls = result.savedUrls || [];

        const exists = savedUrls.find(item => item.url === url);
        if (exists) {
            showNotificationBadge('Already saved');
            return;
        }

        const urlObject = {
            id: Date.now(),
            url: url,
            title: title,
            category: category,
            dateAdded: new Date().toISOString(),
            dateAccessed: null,
            accessCount: 0
        };

        savedUrls.unshift(urlObject);
        await chrome.storage.local.set({ savedUrls: savedUrls });

        showNotificationBadge('Saved!');
        
    } catch (error) {
        console.error('Error saving URL:', error);
        showNotificationBadge('Error');
    }
}

function showNotificationBadge(text) {
    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    
    setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
    }, 3000);
}

function extractDomainFromUrl(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

chrome.action.onClicked.addListener((tab) => {

});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        chrome.runtime.sendMessage({
            type: 'storage-changed',
            changes: changes
        }).catch(() => {

        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'get-current-tab':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                sendResponse({ tab: tabs[0] });
            });
            return true;

        case 'open-url':
            chrome.tabs.create({ url: message.url });
            sendResponse({ success: true });
            break;

        case 'get-storage-data':
            chrome.storage.local.get(null, (data) => {
                sendResponse({ data: data });
            });
            return true;

        default:
            sendResponse({ error: 'Unknown message type' });
    }
});

chrome.runtime.onStartup.addListener(() => {
    chrome.action.setBadgeText({ text: '' });
    
    createContextMenus();
});