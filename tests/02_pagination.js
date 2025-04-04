// Collect at least 100 article titles,
// As the website loads more than 100 use 
// const top100 = titles.slice(0, 100); for final version

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com/newest');

  const titles = [];

  while (titles.length < 100) {
    // Scrape titles from the current page
    const newTitles = await page.$$eval('.titleline > a', links => {
      return links.map(link => link.innerText);
    });

    // Add only unique titles
    for (const title of newTitles) {
      if (!titles.includes(title)) {
        titles.push(title);
      }
    }

    console.log(`Collected ${titles.length} titles so far...`);

    // If we still need more, click "More" and wait for page load
    if (titles.length < 100) {
      await page.click('a.morelink');
      await page.waitForLoadState('load');
    }
  }

  // Print the first 10 titles as a preview
  console.log('\nSample of 10 titles from total collected:');
  titles.slice(0, 10).forEach((title, i) => {
    console.log(`${i + 1}. ${title}`);
  });

  console.log(`✅ Done! Collected ${titles.length} unique titles.`);

  await browser.close();
})();
