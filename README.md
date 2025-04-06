# Task Wolf  
**Article Sorter Assignment – QA Wolf**

---

## 🧪 Testing & What I Learned Along the Way 🪲

Taking a methodological approach, I broke the task down into smaller pieces and created three test scripts: one for scraping, one for pagination, and one for validation. Here’s what happened as I worked through each part — including the bugs I hit and how I fixed them.

---

### `01_basic_scrape.js` — Getting Started with Scraping

First, I wanted to make sure I could grab data from Hacker News using Playwright. So I wrote a quick script that opened the site, selected all the article title links, and printed out the first 10.

This part went smoothly — Playwright’s `page.$$eval()` made it easy to grab the text from `.titleline > a`. No issues here!

---

### `02_pagination.js` — Clicking “More” to Collect 100 Posts

The next step was to collect more than just the first 30 posts. Hacker News loads new articles when you click the “More” button at the bottom, so I set up a loop to click that button and grab titles from the next page too.

Originally, I tried using:

```js
await Promise.all([
  page.waitForNavigation(),
  page.click('a.morelink')
]);
```

…but Playwright wasn’t happy with that — it showed a warning about `waitForNavigation()` being unreliable in some cases. So I swapped it out for:

```js
await page.click('a.morelink');
await page.waitForLoadState('load');
```

That worked perfectly.

I also noticed that sometimes I collected more than 100 posts, so I made sure to only use:

```js
const top100 = titles.slice(0, 100);
```

to slice the array in my final validation logic — just to stick to the brief.

---

### `03_validation.js` — Timestamps & Sorting

This part was trickier. I needed to make sure the first 100 posts were sorted from newest to oldest — based on their timestamp.

So I grabbed the `title` attribute from each `<span class="age">`, which contains the full ISO timestamp. Or so I thought...

Here’s what I actually got:

```
'2025-04-04T20:12:23 1743797543'
```

Turns out Hacker News includes an extra number after the timestamp, and that was breaking JavaScript’s `Date()` parser.

I hit this error:

```
RangeError: Invalid time value
```

To fix it, I updated the code to split off the extra bit:

```js
.map(ts => new Date(ts.split(' ')[0]));
```

And to be safe, I filtered out any invalid entries:

```js
.filter(ts => ts && !isNaN(new Date(ts.split(' ')[0])));
```

That worked! I could now convert the timestamps into proper `Date` objects and check that the list was in descending order.

---

## 💡 Bonus Thought: What About Filtering?

After fixing the timestamp issue, I realized I needed to be careful **when** I filtered. I asked myself:

> “If I remove invalid timestamps, am I still validating the first 100 posts, like the task requires?”

The answer: **yes — as long as I slice first, and filter after**. That way I’m only removing bad data from the first 100, not skipping over posts entirely.

So I made sure my logic went like this:

```js
const top100 = timestamps.slice(0, 100);
const dates = top100
  .filter(ts => ts && !isNaN(new Date(ts.split(' ')[0])))
  .map(ts => new Date(ts.split(' ')[0]));
```

And not like this (which would be incorrect):

```js
const top100 = timestamps.filter(...).slice(0, 100);
```

---

### ✅ Final Thoughts

Breaking the task into three parts really helped me ensure my results were accurate. I navigated pages, dealt with pagination, cleaned up weird timestamp formats, and wrote solid validation logic. Each script builds on the last, and the final version (`index.js`) brings it all together into one polished solution.

---

## 🚀 Setup & Installation

To install and run the project:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install system dependencies** (required on Linux, Gitpod, or CI environments):
   ```bash
   npx playwright install-deps
   ```

3. **Run the validation script**:
   ```bash
   node index.js
   ```

4. **(Optional) Run with debug mode to print all 100 timestamps**:
   ```bash
   node index.js --debug
   ```
   This will output each timestamp alongside the article title it belongs to, making it easy to visually inspect the sort order:
      ```
      1. 2025-04-06T13:36:41.000Z — "Ask HN: What are your favorite productivity hacks?"
      2. 2025-04-06T13:28:48.000Z — "Show HN: I built a local-first notes app"
      ...
      ```

---

## 📦 Project Dependencies

This project uses:

- `playwright` – for browser automation and scraping  
- `@playwright/test` – Playwright’s optional test runner (installed as a dev dependency)  
- `@types/node` – Type definitions for Node.js (dev only, helpful for TypeScript or editor autocompletion)

All dependencies are listed in `package.json`. After cloning the repo, just run `npm install` to get started.