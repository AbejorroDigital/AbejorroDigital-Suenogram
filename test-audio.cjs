const https = require('https');

const urls = [
  'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b3cb81ed.mp3',
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b817b385.mp3',
  'https://cdn.pixabay.com/download/audio/2022/10/25/audio_166b8d29b0.mp3',
  'https://cdn.pixabay.com/download/audio/2022/11/22/audio_8bea359853.mp3'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(url, res.statusCode);
  }).on('error', (e) => {
    console.error(url, e.message);
  });
});
