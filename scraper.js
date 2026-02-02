const fs = require('fs');
const https = require('https');

// URL to fetch data from (Using your reference site as the source)
// This is a reliable way to get the data without complex HTML parsing
const SOURCE_URL = 'https://gold-price.sakib.dev/';

https.get(SOURCE_URL, (resp) => {
  let data = '';

  // A generic chunk of HTML is received
  resp.on('data', (chunk) => { data += chunk; });

  resp.on('end', () => {
    // 1. FIND THE PRICE using Regex (Finds "৳258K" or similar pattern)
    // Note: In a real app, you might use 'cheerio' library for better parsing
    // This looks for the 22K price specifically in the HTML
    const priceMatch = data.match(/৳([\d,]+)K/); 
    
    if (priceMatch) {
      // Convert "258" to 258000
      const priceVal = parseInt(priceMatch[1].replace(/,/g, '')) * 1000;
      
      const today = new Date().toISOString().split('T')[0];
      
      // 2. READ EXISTING DATA
      const currentData = JSON.parse(fs.readFileSync('data.json'));
      const lastEntry = currentData[currentData.length - 1];

      // 3. ADD NEW DATA ONLY IF CHANGED or NEW DAY
      if (lastEntry.date !== today || lastEntry.price !== priceVal) {
          currentData.push({ date: today, price: priceVal });
          
          // 4. SAVE FILE
          fs.writeFileSync('data.json', JSON.stringify(currentData, null, 2));
          console.log(`Updated price to ${priceVal}`);
      } else {
          console.log('Price has not changed.');
      }
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});