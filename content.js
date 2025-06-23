// Content script for Tab Number Shortcut Extension
(function() {
  'use strict';
  
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  
  // State variables
  let tabNumber = 1;
  let isCommandPressed = false;
  let originalTitle = document.title;
  let isValid = true;
  let titleModified = false;
  
  // Check if extension context is valid
  function isExtensionValid() {
    try {
      return isValid && chrome && chrome.runtime && chrome.runtime.id;
    } catch (e) {
      isValid = false;
      return false;
    }
  }
  
  // Show/hide tab number functions
  function showTabNumber() {
    if (!isExtensionValid()) return;
    
    if (!titleModified) {
      // Make sure we get the clean original title without any existing numbers
      originalTitle = document.title.replace(/^\[\d+\]\s*/, '');
      document.title = `[${tabNumber}] ${originalTitle}`;
      titleModified = true;
    }
  }
  
  function hideTabNumber() {
    if (titleModified) {
      document.title = originalTitle;
      titleModified = false;
    }
  }
  
  // Keyboard event handlers
  function onKeyDown(e) {
    if (!isExtensionValid()) return;
    
    const isCmd = e.metaKey || e.ctrlKey;
    
    if (isCmd && !isCommandPressed) {
      isCommandPressed = true;
      chrome.runtime.sendMessage({ action: 'commandPressed' });
    }
    
    if (isCmd && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const num = parseInt(e.key);
      chrome.runtime.sendMessage({
        action: 'switchToTab',
        tabNumber: num
      });
    }
  }
  
  function onKeyUp(e) {
    if (!e.metaKey && !e.ctrlKey && isCommandPressed) {
      isCommandPressed = false;
      chrome.runtime.sendMessage({ action: 'commandReleased' });
    }
  }
  
  function onBlur() {
    if (isCommandPressed) {
      isCommandPressed = false;
      chrome.runtime.sendMessage({ action: 'commandReleased' });
    }
  }
  
  // Message handler for background script communication
  function onMessage(msg, sender, sendResponse) {
    if (!isExtensionValid()) return;
    
    if (msg.action === 'updateTabNumber') {
      tabNumber = msg.tabNumber || 1;
      // Always use the original title provided by background script
      originalTitle = msg.originalTitle || document.title.replace(/^\[\d+\]\s*/, '');
      
      // If we're currently showing numbers, update the title
      if (isCommandPressed && titleModified) {
        document.title = `[${tabNumber}] ${originalTitle}`;
      }
      
      if (sendResponse) sendResponse({ success: true });
    } else if (msg.action === 'showNumber') {
      tabNumber = msg.tabNumber || 1;
      // Always use the clean original title from background script
      originalTitle = msg.originalTitle || document.title.replace(/^\[\d+\]\s*/, '');
      
      // Force reset the title state to prevent duplicates
      titleModified = false;
      showTabNumber();
      
      if (sendResponse) sendResponse({ success: true });
    } else if (msg.action === 'hideNumber') {
      hideTabNumber();
      if (sendResponse) sendResponse({ success: true });
    }
  }
  
  // Cleanup and initialization
  function cleanup() {
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('keyup', onKeyUp, true);
    window.removeEventListener('blur', onBlur);
    
    if (chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.removeListener(onMessage);
    }
    
    hideTabNumber();
    isValid = false;
  }
  
  function init() {
    if (!isExtensionValid()) return;
    
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', onBlur);
    
    chrome.runtime.onMessage.addListener(onMessage);
    
    // Handle extension context invalidation
    window.addEventListener('error', function(e) {
      if (e.error && e.error.message && 
          e.error.message.includes('Extension context invalidated')) {
        e.preventDefault();
        cleanup();
      }
    });
    
    // Notify background that content script is ready
    chrome.runtime.sendMessage({ action: 'contentScriptReady' });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
