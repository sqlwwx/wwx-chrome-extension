import {
  html, Component,
} from 'https://cdn.jsdelivr.net/npm/htm@3.0.4/preact/standalone.module.js'

import {
  fileSize, parseFileName,
  downloadSourceMaps,
  emitter
} from '../utils.js'

const download = async (sourceMap) => {
  const { url } = sourceMap
  const filename = parseFileName(url);
  NProgress.remove()
  NProgress.start()
  emitter.once('loadedSourceMap:' + url, (consumer) => {
    let step = 1 / consumer.sources.length
    emitter.on('addSourceMapFile:' + url, (filename) => {
      NProgress.inc(step)
    })
  })
  await downloadSourceMaps(filename, sourceMap)
  emitter.removeAllListeners('addZipFile:' + url)
  NProgress.done()
  NProgress.remove()
};

export default class SourceMapItem extends Component {
  shouldComponentUpdate () {
    return false
  }

  render ({ sourceMap }) {
    return html`
      <li>
        <a class="url" href="#" onClick=${() => download(sourceMap) }>${sourceMap.url}</a>
        <span class="fileSize"> ${fileSize(sourceMap.content.length)}</span>
      </li>
    `
  }
}
