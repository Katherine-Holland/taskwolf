// Validating that the first 100 articles, sorted from newest to oldest

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com/newest');

  const timestamps = [];

  while (timestamps.length < 100) {
    // Extract ISO timestamp strings from each post
    const newTimestamps = await page.$$eval('span.age', spans => {
      return spans.map(span => span.getAttribute('title')); // e.g., "2025-04-04T19:51:15"
    });

    // Add only valid, non-duplicate timestamps
    for (const ts of newTimestamps) {
      if (ts && !timestamps.includes(ts)) {
        timestamps.push(ts);
      }
    }

    console.log(`Collected ${timestamps.length} timestamps so far...`);

    // Load more posts if we still need them
    if (timestamps.length < 100) {
      await page.click('a.morelink');
      await page.waitForLoadState('load');
    }
  }

  // Ensure we only use the first 100 (as required)
  const top100 = timestamps.slice(0, 100);
  console.log('\nRaw timestamp strings (first 5):');
  console.log(top100.slice(0, 5));
  // Convert to Date objects, skipping any bad values safely
  const dates = top100
  .filter(ts => ts && !isNaN(new Date(ts.split(' ')[0])))
  .map(ts => new Date(ts.split(' ')[0]));
  console.log(`\n🧪 ${dates.length} valid timestamps used for validation.\n`);

  // Validation: are dates in descending order (newest first)?
  const isSorted = dates.every((date, i, arr) => i === 0 || arr[i - 1] >= date);

  console.log('\n✅ Validation Result:');
  console.log(isSorted ? '✅ Articles are sorted newest to oldest' : '❌ Articles are NOT sorted correctly');

  // Print 5 example timestamps to show what was checked
  console.log('\nSample Timestamps from First 100 Posts:');
  dates.slice(0, 5).forEach((date, i) => {
    console.log(`${i + 1}. ${date.toISOString()}`);
  });

  await browser.close();
})();
