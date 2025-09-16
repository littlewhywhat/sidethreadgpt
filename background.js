chrome.runtime.onInstalled.addListener(() => {});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    console.log('Opening side panel');
    await chrome.sidePanel.setOptions({ tabId: tab.id, path: 'sidepanel.html', enabled: true });
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
    console.error(e);
  }
});

