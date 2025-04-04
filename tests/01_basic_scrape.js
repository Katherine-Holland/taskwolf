// tests/01_basic_scrape.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com/newest');

  // Extract article titles
  const titles = await page.$$eval('.titleline > a', links => {
    return links.map(link => link.innerText);
  });

  // Print the first 10 article titles
  console.log("Top 10 article titles:");
  titles.slice(0, 10).forEach((title, i) => {
    console.log(`${i + 1}. ${title}`);
  });

  await browser.close();
})();