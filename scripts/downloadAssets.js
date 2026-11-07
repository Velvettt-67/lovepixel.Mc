import fs from 'fs';
import path from 'path';
import https from 'https';

const assets = [
  // Flowers & Macros
  {
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1400&q=80',
    dest: 'public/assets/flowers/peony-macro.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1400&q=80',
    dest: 'public/assets/flowers/petals-motion.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1400&q=80',
    dest: 'public/assets/flowers/cherry-blossom.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1400&q=80',
    dest: 'public/assets/flowers/minimal-flora.jpg'
  },
  
  // Hero & Atmospheric
  {
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1600&q=80',
    dest: 'public/assets/hero/pink-twilight.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    dest: 'public/assets/hero/dreamy-clouds.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    dest: 'public/assets/hero/window-morning.jpg'
  },

  // Community & Social
  {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
    dest: 'public/assets/community/social-circle.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80',
    dest: 'public/assets/community/music-lounge.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4b13?auto=format&fit=crop&w=1400&q=80',
    dest: 'public/assets/community/cozy-interior.jpg'
  },

  // Events
  {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/assets/events/creative-salon.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/assets/events/film-night.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/assets/events/game-salon.jpg'
  },

  // Gallery
  {
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/assets/gallery/silk-waves.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/assets/gallery/pink-glass.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/assets/gallery/sunset-haze.jpg'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function run() {
  console.log('Starting asset download...');
  for (const item of assets) {
    try {
      await download(item.url, item.dest);
      console.log(`✓ Downloaded ${item.dest}`);
    } catch (e) {
      console.error(`✗ Error downloading ${item.dest}:`, e.message);
    }
  }
  console.log('All assets processed!');
}

run();
