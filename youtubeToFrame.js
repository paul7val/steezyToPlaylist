const fs = require('fs');
const ytdl = require('ytdl-core');
const util = require('util')
const fsAccessAsync = util.promisify(fs.access)
let spawn = require('child_process').spawn
const exec = require('child_process').exec
const readline = require('readline')
const path = require('path')
let output;
let ffmpeg;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

let defaultVideoOptions = {videoName: 'video', fps: 1, imgFileName: "img", downloadLocation: path.resolve(__dirname)}

const setOptions = (options) => {
  options.fps = options.fps < 1 ? 1 : options.fps
  defaultVideoOptions = Object.assign(defaultVideoOptions, options)
}

const getOptions = () => defaultVideoOptions

const changeDownloadLocationToCwd = () => {
  let optionsWithNewDownloadLocation = Object.assign(defaultVideoOptions, {downloadLocation: path.resolve(__dirname)})
  setOptions(optionsWithNewDownloadLocation)
}


const ensureDirExists = () => {
  let path = defaultVideoOptions.downloadLocation
  return fsAccessAsync(path, fs.constants.R_OK | fs.constants.W_OK)
}

const errAndExit = (msg) => {
  console.error(msg)
  process.exit()
}

const downloadVideo = () => {
  options = Object.assign(defaultVideoOptions, {})
  output = fs.createWriteStream(`${options.videoName}.mp4`)
  ytdl.init(options.videoUrl, {}).pipe(output);
  output.on('open', (data) => {
    console.log("Downloading video before converting to frames.")
    console.log('data', data);
    setTimeout(() => {
      ytdl.stream.destroy();
      console.log('destroy');
      convertVideoToFrames()
    }, 6000);
  })
  // output.on('end', (data) => {
  //   console.log("END")
  // })
  // output.on('error', (err) => {
  //   errAndExit(err)
  // })
  // output.on('close', () => {
  //   let pluralOrSingular = options.fps > 1 ? 'frames' : 'frame'
  //   console.log(`Finished downloading video. Now screenshotting ${options.fps} ${pluralOrSingular} per second.`)
  //   convertVideoToFrames()
  // })
}

const convertVideoToFrames = () => {
  let options = defaultVideoOptions
  let ffmpeg = spawn('ffmpeg', [
   '-i', `./${options.videoName}.mp4`,
   '-f', 'image2',
   '-bt', '20M',
   '-vf', `fps=${options.fps}`,
   '-ss', `00:00:00`,
   '-vframes', `1`,
   '-q:v', `2`,
   `./${options.imgFileName}%03d.jpg`
  ])

  ffmpeg.stdout.on('data', (data) => {
    // console.log(data.toString());
  });

  ffmpeg.stderr.on('data', (err) => {
    console.log(err.toString());
  });

  ffmpeg.stdout.on('close', (data) => {
    console.log('image loaded');
    
    process.exit()
  });
}

// const installFfmpegUsingBrew = () => {
//   console.log("Installing ffmpeg")
//   let imagemagickInstall = spawn('brew', ['install', 'ffmpeg'])
//   imagemagickInstall.stderr.on('data', (data) => {
//     console.log(data.toString('utf8'));
//   });
//   imagemagickInstall.stdout.on('data', (data) => {
//     console.log(data.toString());
//   });
//   imagemagickInstall.on('exit', (data) => {
//     console.log("Finished instaling ffmpeg.")
//     downloadVideo()
//   });
// }


module.exports = (videoUrl, options = {}) => {
  let youtubeRegex = /https?:\/\/(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed|time_continue)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/
  if (youtubeRegex.test(videoUrl)) {
    options = Object.assign({}, {videoUrl}, options)
    setOptions(options)
    if(options.downloadLocation !== path.resolve(__dirname)) {
      console.log('GO');
      downloadVideo()
    }
  }
}
