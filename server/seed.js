const mongoose = require('mongoose');
const Music = require('./src/models/Music');

const dummyMusic = Array.from({ length: 50 }, (_, i) => ({
  title: `Song ${i + 1}`,
  artist: `Artist ${(i % 5) + 1}`,
  album: `Album ${(i % 3) + 1}`,
  genre: ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Classical'][i % 5],
  audioFile: `audioFile-${i + 1}.mp3`,
  coverImage: `coverImage-${i + 1}.png`,
  duration: `${Math.floor(Math.random() * 4) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  status: i % 4 === 0 ? 'Inactive' : 'Active'
}));

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/music-app');
  await Music.deleteMany({});
  await Music.insertMany(dummyMusic);
  console.log('Database seeded!');
  process.exit();
}

seed();