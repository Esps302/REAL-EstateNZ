import fs from 'fs';
import path from 'path';
import https from 'https';

const seedFilePath = path.join(process.cwd(), 'src/app/seed/page.tsx');
let seedContent = fs.readFileSync(seedFilePath, 'utf-8');

// Find all unsplash urls in the dummyProperties array
const unsplashUrls = seedContent.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+\?auto=format&fit=crop&w=1600&q=80/g) || [];

// Deduplicate
const uniqueUrls = [...new Set(unsplashUrls)];

console.log(`Found ${uniqueUrls.length} unique images to download...`);

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Follow redirects if necessary (Unsplash sometimes redirects)
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume(); // Consume response data to free up memory
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

async function main() {
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    // Create a local filename
    const filename = `property-${i + 1}.jpg`;
    const filepath = path.join(process.cwd(), 'public/images', filename);
    const localUrl = `/images/${filename}`;

    console.log(`Downloading [${i+1}/${uniqueUrls.length}] ${filename}...`);
    try {
      await downloadImage(url, filepath);
      
      // Replace all occurrences of this exact URL in the seed file with the localUrl
      // Need to escape regex characters in URL just in case
      const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedUrl, 'g');
      seedContent = seedContent.replace(regex, localUrl);
      
    } catch (err) {
      console.error(`Failed to download ${url}:`, err);
    }
  }

  // Save the updated seed file
  fs.writeFileSync(seedFilePath, seedContent, 'utf-8');
  console.log('Seed file successfully updated with local image paths!');
}

main();
