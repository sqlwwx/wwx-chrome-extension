import EventEmitter from 'https://cdn.jsdelivr.net/gh/sqlwwx/events@f76f24c/events.module.js'
import { isValidSourceMap } from '../share/utils.js'

const { SourceMapConsumer } = sourceMap

export const emitter = new EventEmitter()

let sourceMapFileMap = {}

chrome.browserAction.setBadgeText({
  text: ''
});

const setBadgeText = (num) => {
  let text = num > 0 ? '' + num : ''
  chrome.browserAction.setBadgeText({text: text});
}

const tryGetMap = (url, callback) => {
  setTimeout(() => {
    fetch(url + '.map').then(resp => {
      if (resp.status === 200) {
        resp.text().then(text => {
          callback(resp.url, text);
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }, 300);
}

chrome.extension.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    emitter.emit(msg)
    if ('getAllSourceFiles' === msg) {
      const list = [...Object.keys(sourceMapFileMap).map((key) => {
        return {
          url: key,
          content: sourceMapFileMap[key].content,
        };
      })];
      for (let i = 0, length = list.length; i < length; i += 3 ) {
        console.log('send', i)
        port.postMessage(list.slice(i, i + 3))
      }
    }
  })
});

emitter.on('reset', () => {
  sourceMapFileMap = {}
  chrome.browserAction.setBadgeText({
    text: ''
  });
})

chrome.webRequest.onBeforeRequest.addListener((details) => {
  if (details.type === 'script' && /\.js$/.test(details.url) && !(/^chrome-extension:\/\//.test(details.url))) {
    tryGetMap(details.url, async (url, content) => {
      if (await isValidSourceMap(content)) {
        sourceMapFileMap[url] = { content }
        setBadgeText(Object.keys(sourceMapFileMap).length)
      }
    })
  }
}, {
  urls: ['<all_urls>']
});
