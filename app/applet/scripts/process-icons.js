import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

async function processIcons() {
  const imagesDir = path.join(process.cwd(), 'src', 'assets', 'images');
  const files = fs.readdirSync(imagesDir);
  const srcFile = files.find(f => f.endsWith('.jpg') || f.endsWith('.png'));
  
  if (!srcFile) {
    console.error('No source image found in src/assets/images');
    process.exit(1);
  }

  const srcPath = path.join(imagesDir, srcFile);
  console.log('Processing source image:', srcPath);

  const image = await Jimp.read(srcPath);
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sizes = [
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-maskable-512x512.png', size: 512 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon.ico', size: 32 }
  ];

  for (const item of sizes) {
    const cloned = image.clone();
    cloned.resize({ w: item.size, h: item.size });
    const dest = path.join(publicDir, item.name);
    await cloned.write(dest);
    console.log(`Saved ${item.name} (${item.size}x${item.size})`);
  }

  console.log('All icons successfully generated and saved to public/');
}

processIcons().catch(err => {
  console.error('Error processing icons:', err);
  process.exit(1);
});
