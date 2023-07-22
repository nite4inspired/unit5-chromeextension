// Calculate the time until 8:00 PM
const buttonSite = document.getElementById('addSite');
const inputSite = document.getElementById('websiteInput');
const buttonDone = document.getElementById('done');
const buttonTime = document.getElementById('time');
const inputTime = document.getElementById('timeInput');
let p = document.createElement("p");
p.style['font-size'] = '20px';
p.style.margin = '10px';

var urls = [];

// Load the urls array from storage when the extension is loaded
chrome.storage.local.get(['urls'], function(result) {
  if (result.urls) {
    urls = result.urls;
  }
});

buttonSite.addEventListener('click', () => {
  urls.push(inputSite.value + '*');

  // Save the urls array to storage whenever it is updated
  chrome.storage.local.set({urls: urls}, function() {
    console.log('Urls array is saved');
  });
});

buttonTime.addEventListener('click', () => {
  const now = new Date();
  const then = new Date(now);

  const time = inputTime.value;
  p.textContent = 'Tabs will be removed at ' + time;
  buttonTime.after(p);

  then.setHours(Number(time.split(':')[0]), Number(time.split(':')[1]), 0, 0); //

  if (now.getTime() > then.getTime()) {
    then.setDate(now.getDate() + 1); // If it's past 8:00 PM, schedule for next day
  }
  const delayInMinutes = (then.getTime() - now.getTime()) / (1000 * 60);
  // Create the alarm
  chrome.alarms.create('closeTabs', { when: Date.now() + delayInMinutes * 60 * 1000 });
})

buttonDone.addEventListener('click', async function() {
  const tabs = await chrome.tabs.query({
    url: urls
  });
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
  const collator = new Intl.Collator();
  tabs.sort((a, b) => collator.compare(a.title, b.title));

  const template = document.getElementById('li_template');
  const elements = new Set();

  for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.split('-')[0].trim();
    const pathname = new URL(tab.url).pathname.slice('/docs'.length);

    element.querySelector('.title').textContent = title;
    element.querySelector('.pathname').textContent = pathname;
    element.querySelector('a').addEventListener('click', async () => {
      // need to focus window as well as the active tab
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    elements.add(element);
  }
  document.querySelector('ul').append(...elements);

  //const button = document.querySelector('button');
  //buttonTime.addEventListener('click', async () => {
    const tabIds = tabs.map(({ id }) => id);
    if (tabIds.length) {
      const group = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(group, { title: '⏰' });
    }
  //});
})



const resetButton = document.getElementById('resetButton');

resetButton.addEventListener('click', () => {
  chrome.storage.local.clear(function() {
    console.log('Local storage has been cleared');
  });
});