// Validate first 100 Hacker News posts are sorted newest to oldest
// Submitted by Kat 🐺

const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("\n🚀 Launching browser and navigating to Hacker News...");
  await page.goto("https://news.ycombinator.com/newest");

  const timestamps = [];
  const titles = [];

  // Step 1: Click “More” until we collect at least 100 post timestamps
  while (timestamps.length < 100) {
    const newTimestamps = await page.$$eval("span.age", spans =>
      spans.map(span => span.getAttribute("title"))
    );

    const newTitles = await page.$$eval(".titleline > a", links =>
      links.map(link => link.innerText)
    );

    for (let i = 0; i < newTimestamps.length; i++) {
      const ts = newTimestamps[i];
      const title = newTitles[i];

      if (ts && !timestamps.includes(ts)) {
        timestamps.push(ts);
        titles.push(title);
      }
    }

    console.log(`🕵️ Collected ${timestamps.length} timestamps so far...`);

    if (timestamps.length < 100) {
      await page.click("a.morelink");
      await page.waitForLoadState("load");
    }
  }

  // Step 2: Work only with the first 100 entries
  const top100 = timestamps.slice(0, 100);
  const top100Titles = titles.slice(0, 100);

  // Step 3: Clean and convert to Date objects
  const dates = top100
    .filter(ts => ts && !isNaN(new Date(ts.split(" ")[0])))
    .map(ts => new Date(ts.split(" ")[0]));

  // Step 4: Validate sort order
  console.log('\n🧪 Checking timestamp sort order for the first 100 posts...\n');

  const isSorted = dates.every((date, i, arr) => i === 0 || arr[i - 1] >= date);

  console.log(`✅ Collected ${dates.length} valid timestamps from the first 100 posts.`);

  if (isSorted) {
    console.log('🎉 Success! Articles are sorted newest to oldest.\n');
  } else {
    console.log('❌ Sorting failed: Articles are not in the correct order.\n');
  }

  // Step 5: Print sample timestamps
  console.log("🗓️ Sample timestamps from the first 100:");
  dates.slice(0, 5).forEach((date, i) => {
    console.log(`${i + 1}. ${date.toISOString()}`);
  });

  // Step 6: Show time difference between first few posts
  console.log("\n🔍 Time difference between first few posts:");
  for (let i = 1; i < 5; i++) {
    const diff = (dates[i - 1] - dates[i]) / 1000;
    console.log(`Post ${i} to ${i + 1}: ${diff}s difference`);
  }

  // Step 7: Optional debug output with titles
  if (process.argv.includes('--debug')) {
    console.log("\n📋 Full list of articles with timestamps:");
    for (let i = 0; i < dates.length; i++) {
      console.log(`${i + 1}. ${dates[i].toISOString()} — "${top100Titles[i]}"`);
    }
  }

  await browser.close();

  console.log("\n🧹 Browser closed. All done!");
  console.log("// Thanks for reviewing my code! – Kat 🐾");
}

(async () => {
  await sortHackerNewsArticles();
})();

