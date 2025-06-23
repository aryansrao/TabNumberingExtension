// Background script for Tab Number Shortcut Extension
// Track which tabs have content scripts injected
const tabsWithContentScript = new Set();

// Handle keyboard shortcuts (Command+1-9)
chrome.commands.onCommand.addListener((command, tab) => {
  const match = command.match(/switch-to-tab-(\d+)/);
  if (match) {
    const tabNumber = parseInt(match[1]);
    switchToTab(tabNumber);
  }
});

// Switch to specific tab by number
function switchToTab(tabNumber) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (tabNumber <= tabs.length && tabNumber > 0) {
      const targetTab = tabs[tabNumber - 1];
      chrome.tabs.update(targetTab.id, { active: true });
    }
  });
}

// Check if URL can have content script injected
function isInjectableUrl(url) {
  return url && 
         !url.startsWith('chrome://') && 
         !url.startsWith('chrome-extension://') && 
         !url.startsWith('edge://') && 
         !url.startsWith('about:') &&
         (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://'));
}

// Inject content script into specific tab
function injectContentScript(tabId, callback) {
  if (tabsWithContentScript.has(tabId)) {
    if (callback) callback(true);
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  }, (result) => {
    if (!chrome.runtime.lastError) {
      tabsWithContentScript.add(tabId);
    }
    if (callback) callback(!chrome.runtime.lastError);
  });
}

// Update all tabs with their current numbers
function updateAllTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach((tab, index) => {
      if (tab.id && isInjectableUrl(tab.url)) {
        // Clean the title to remove any existing numbers
        let cleanTitle = tab.title || '';
        while (cleanTitle.match(/^\[\d+\]\s*/)) {
          cleanTitle = cleanTitle.replace(/^\[\d+\]\s*/, '');
        }
        
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateTabNumber',
          tabNumber: index + 1,
          totalTabs: tabs.length,
          originalTitle: cleanTitle,
          isActive: tab.active
        }, (response) => {
          if (chrome.runtime.lastError) {
            injectContentScript(tab.id, (success) => {
              if (success) {
                setTimeout(() => {
                  chrome.tabs.sendMessage(tab.id, {
                    action: 'updateTabNumber',
                    tabNumber: index + 1,
                    totalTabs: tabs.length,
                    originalTitle: cleanTitle,
                    isActive: tab.active
                  });
                }, 200);
              }
            });
          }
        });
      }
    });
  });
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'switchToTab') {
    switchToTab(message.tabNumber);
    sendResponse({ success: true });
  } else if (message.action === 'contentScriptReady') {
    if (sender.tab && sender.tab.id) {
      tabsWithContentScript.add(sender.tab.id);
    }
    sendResponse({ success: true });
  } else if (message.action === 'commandPressed') {
    showNumbersOnAllTabs();
    sendResponse({ success: true });
  } else if (message.action === 'commandReleased') {
    hideNumbersOnAllTabs();
    sendResponse({ success: true });
  }
});

// Tab event listeners
chrome.tabs.onActivated.addListener(() => updateAllTabs());
chrome.tabs.onCreated.addListener(() => setTimeout(updateAllTabs, 500));
chrome.tabs.onRemoved.addListener((tabId) => {
  tabsWithContentScript.delete(tabId);
  setTimeout(updateAllTabs, 100);
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isInjectableUrl(tab.url)) {
    tabsWithContentScript.delete(tabId);
    setTimeout(updateAllTabs, 100);
  }
});

// Inject content scripts into all tabs on startup
function injectContentScriptInAllTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const injectionPromises = tabs
      .filter(tab => tab.id && isInjectableUrl(tab.url))
      .map(tab => new Promise(resolve => {
        injectContentScript(tab.id, resolve);
      }));
    
    Promise.all(injectionPromises).then(() => {
      setTimeout(updateAllTabs, 500);
    });
  });
}

// Initialize extension on startup and installation
chrome.runtime.onStartup.addListener(() => setTimeout(injectContentScriptInAllTabs, 1000));
chrome.runtime.onInstalled.addListener(() => setTimeout(injectContentScriptInAllTabs, 1000));

// Show numbers on all tabs when Command is pressed
function showNumbersOnAllTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach((tab, index) => {
      if (tab.id && isInjectableUrl(tab.url)) {
        // Clean the title multiple times to handle cases where numbers were already added
        let cleanTitle = tab.title || '';
        // Remove any existing numbers (handle multiple occurrences)
        while (cleanTitle.match(/^\[\d+\]\s*/)) {
          cleanTitle = cleanTitle.replace(/^\[\d+\]\s*/, '');
        }
        
        chrome.tabs.sendMessage(tab.id, {
          action: 'showNumber',
          tabNumber: index + 1,
          originalTitle: cleanTitle
        });
      }
    });
  });
}

// Hide numbers on all tabs when Command is released
function hideNumbersOnAllTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && isInjectableUrl(tab.url)) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'hideNumber'
        });
      }
    });
  });
}
