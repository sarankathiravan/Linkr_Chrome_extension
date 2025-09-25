// Background script for URL Organizer extension

// Function to create context menus safely
function createContextMenus() {
    try {
        chrome.contextMenus.removeAll(() => {
            // Create context menu for saving current page
            chrome.contextMenus.create({
                id: 'save-current-page',
                title: 'Save current page to URL Organizer',
                contexts: ['page']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.log('Context menu creation handled:', chrome.runtime.lastError.message);
                }
            });

            // Create context menu for saving links
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

// Install event - setup context menus
chrome.runtime.onInstalled.addListener(() => {
    createContextMenus();

    // Initialize storage with default data if needed
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

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'save-current-page') {
        saveUrl(tab.url, tab.title || extractDomainFromUrl(tab.url), 'other');
    } else if (info.menuItemId === 'save-link') {
        saveUrl(info.linkUrl, info.linkUrl, 'other');
    }
});

// Function to save URL to storage
async function saveUrl(url, title, category) {
    try {
        const result = await chrome.storage.local.get(['savedUrls']);
        const savedUrls = result.savedUrls || [];

        // Check for duplicates
        const exists = savedUrls.find(item => item.url === url);
        if (exists) {
            showNotificationBadge('Already saved');
            return;
        }

        // Create URL object
        const urlObject = {
            id: Date.now(),
            url: url,
            title: title,
            category: category,
            dateAdded: new Date().toISOString(),
            dateAccessed: null,
            accessCount: 0
        };

        // Add to saved URLs
        savedUrls.unshift(urlObject);
        await chrome.storage.local.set({ savedUrls: savedUrls });

        // Show success notification
        showNotificationBadge('Saved!');
        
    } catch (error) {
        console.error('Error saving URL:', error);
        showNotificationBadge('Error');
    }
}

// Function to show notification via badge
function showNotificationBadge(text) {
    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    
    // Clear badge after 3 seconds
    setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
    }, 3000);
}

// Helper function to extract domain from URL
function extractDomainFromUrl(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

// Handle extension icon click - open popup
chrome.action.onClicked.addListener((tab) => {
    // The popup will open automatically when action is clicked
    // This event is for fallback if popup fails
});

// Listen for storage changes to sync between windows
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        // Notify all open extension pages about storage changes
        chrome.runtime.sendMessage({
            type: 'storage-changed',
            changes: changes
        }).catch(() => {
            // Ignore errors if no receivers
        });
    }
});

// Handle messages from popup or other extension pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'get-current-tab':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                sendResponse({ tab: tabs[0] });
            });
            return true; // Keep message channel open for async response

        case 'open-url':
            chrome.tabs.create({ url: message.url });
            sendResponse({ success: true });
            break;

        case 'get-storage-data':
            chrome.storage.local.get(null, (data) => {
                sendResponse({ data: data });
            });
            return true; // Keep message channel open for async response

        default:
            sendResponse({ error: 'Unknown message type' });
    }
});

// Cleanup on extension startup
chrome.runtime.onStartup.addListener(() => {
    // Clear any existing badge text
    chrome.action.setBadgeText({ text: '' });
    
    // Clear and recreate context menus to avoid duplicates
    createContextMenus();
});