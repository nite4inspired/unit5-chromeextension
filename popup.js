// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Calculate the time until 8:00 PM
const buttonTime = document.getElementById('time');
const input = document.getElementById('timeInput');
let p = document.createElement("p");
p.style['font-size'] = '20px';
p.style.margin = '10px';
buttonTime.addEventListener('click', () => {
  const now = new Date();
  const then = new Date(now);

  const time = input.value;
  p.textContent = 'Tabs will be removed at ' + time;
  buttonTime.after(p);

  then.setHours(Number(time.split(':')[0]), Number(time.split(':')[1]), 0, 0); //
  console.log(now);
  console.log(then);

  if (now.getTime() > then.getTime()) {
    then.setDate(now.getDate() + 1); // If it's past 8:00 PM, schedule for next day
  }
  const delayInMinutes = (then.getTime() - now.getTime()) / (1000 * 60);
  console.log(delayInMinutes);
  // Create the alarm
  chrome.alarms.create('closeTabs', { when: Date.now() + delayInMinutes * 60 * 1000 });
})

const tabs = await chrome.tabs.query({
  url: [
    // 'https://developer.chrome.com/docs/webstore/*',
    // 'https://developer.chrome.com/docs/extensions/*'
    'https://www.youtube.com/*'
  ]
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
buttonTime.addEventListener('click', async () => {
  const tabIds = tabs.map(({ id }) => id);
  if (tabIds.length) {
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: '⏰' });
  }
});
