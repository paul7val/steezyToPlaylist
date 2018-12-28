var Tesseract = require('tesseract.js');
const fs = require('fs');

let youtubeVideoToFrames = require('./youtubeToFrame.js')
let youtubeUrl = 'https://www.youtube.com/watch?v=Cb9RIe5Yop0'
let options = {videoName: 'steezy', fps: 1, imgFileName: "steezy", downloadLocation: './dl'}
youtubeVideoToFrames(youtubeUrl, options);

// fs.readFile('steezy001.jpg', function(err, data) {
//   if (err) throw err;


//   Tesseract.recognize(data)
//     .progress(message => console.log('message', message))
//     .catch(err => console.error('err', err))
//     .then(result => console.log('result', result))
//     .finally(resultOrError => console.log('resultOrError', resultOrError))
// });
