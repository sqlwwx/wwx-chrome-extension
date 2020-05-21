import EventEmitter from 'https://cdn.jsdelivr.net/gh/sqlwwx/events@f76f24c/events.module.js'
import { readSourceMap } from '../../../share/utils.js'

export const emitter = new EventEmitter()

export const parseFileName = (url) => url.split('/').filter(item => item).slice(-1)[0]

export const fileSize = (length) => {
  const exp = Math.log(length) / Math.log(1024) | 0;
  const result = (length / Math.pow(1024, exp)).toFixed(2);
  return result + ' ' + (exp == 0 ? 'bytes': 'KMGTPEZY'[exp - 1] + 'B');
}

export const addZipFile = async (root, filename, content) => {
  let folder = root
  let folders = filename.split('/')
  for(let i = 0; i < folders.length - 1; i++) {
    folder = folder.folder(folders[i])
  }
  folder.file(folders[folders.length - 1], content)
}

export const downloadByChrome = async (filename, content) => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => {
      chrome.downloads.download({ filename, url: reader.result });
    }
    reader.readAsDataURL(content);
  })
}

export const downloadZipFile = async (name, zip) => {
  const content = await zip.generateAsync({type: 'blob'})
  return downloadByChrome(name + '.zip', content)
}

export const addSourceMap = async (zip, sourceMapFile) => {
  const { url } = sourceMapFile
  const sourceMapConsumer = await readSourceMap(sourceMapFile.content)
  emitter.emit('loadedSourceMap:' + url, sourceMapConsumer)
  await sourceMapConsumer.sources
    .filter(fileName => fileName.startsWith('webpack://'))
    .reduce(async (promise, fileName) => {
      await promise
      await addZipFile(
        zip,
        fileName
          .replace(/^webpack:\/\//, '')
          .replace(/^\//, '')
          .replace(/^\~\//, 'node_modules/')
        , sourceMapConsumer.sourceContentFor(fileName)
      )
      emitter.emit('addSourceMapFile:' + url, fileName)
    }, Promise.resolve())
  sourceMapConsumer.destroy()
}

export const downloadSourceMaps = async (name, ...sourceMapFiles) => {
  const zip = new JSZip();
  await sourceMapFiles.reduce(
    (promise, sourceMapFile) => promise.then(() => addSourceMap(zip, sourceMapFile)),
    Promise.resolve()
  )
  await downloadZipFile(name, zip)
}

