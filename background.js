chrome.runtime.onInstalled.addListener(() => {
    console.log('Tab Manager Extension installed.');
  });
  
  function saveCurrentSession(sessionName) {
    chrome.tabs.query({}, (tabs) => {
      let session = tabs.map(tab => ({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      }));
      chrome.storage.local.get('sessions', (data) => {
        let sessions = data.sessions || [];
        sessions.push({ name: sessionName, tabs: session });
        chrome.storage.local.set({ sessions }, () => {
          console.log('Session saved:', sessionName);
        });
      });
    });
  }
  
  function closeAllTabsExceptOne(callback) {
    chrome.tabs.query({}, (tabs) => {
      if (tabs.length > 1) {
        let tabIds = tabs.slice(1).map(tab => tab.id);
        chrome.tabs.remove(tabIds, callback);
      } else {
        callback();
      }
    });
  }
  

  function restoreSession(tabs) {
    closeAllTabsExceptOne(() => {
      let createdTabs = tabs.map(tab => chrome.tabs.create({ url: tab.url }));
      Promise.all(createdTabs).then(() => {
        chrome.tabs.query({}, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.remove(tabs[0].id);
          }
        });
      });
    });
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'save') {
      saveCurrentSession(message.sessionName);
      sendResponse({ status: 'Session saved' });
    } else if (message.action === 'getSessions') {
      chrome.storage.local.get('sessions', (data) => {
        sendResponse({ sessions: data.sessions });
      });
      return true;
    } else if (message.action === 'restore') {
      restoreSession(message.sessionTabs);
      sendResponse({ status: 'Session restored' });
    }
  });
  