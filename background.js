chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'closeTabs') {
    const tabs = await chrome.tabs.query({
      url: [
        'https://www.youtube.com/*'
      ]
    });
    const tabIds = tabs.map(({ id }) => id);
    chrome.tabs.remove(tabIds);
    document.querySelector('p').remove();
  }
});