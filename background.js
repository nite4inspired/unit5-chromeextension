// chrome.alarms.onAlarm.addListener(async (alarm) => {
//   if (alarm.name === 'closeTabs') {
//     const tabs = await chrome.tabs.query({
//       url: urls
//     });
//     const tabIds = tabs.map(({ id }) => id);
//     chrome.tabs.remove(tabIds);
//     document.querySelector('p').remove();
//   }
// });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'closeTabs') {
    // Retrieve the urls array from storage
    chrome.storage.local.get(['urls'], async function(result) {
      if (result.urls) {
        const tabs = await chrome.tabs.query({
          url: result.urls
        });
        const tabIds = tabs.map(({ id }) => id);
        chrome.tabs.remove(tabIds);
      }
    });
  }
});