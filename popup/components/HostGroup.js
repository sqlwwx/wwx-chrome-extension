import {
  html
} from 'https://cdn.jsdelivr.net/npm/htm@3.0.4/preact/standalone.module.js'
import SourceMapItem from './SourceMapItem.js'

import {
  downloadSourceMaps,
} from '../utils.js'

const downloadHost = async ({ host, sourceMaps }) => {
  var errors = [];
  NProgress.start()
  await downloadSourceMaps(
    host,
    ...sourceMaps,
  )
  NProgress.done()
}
const HostGroup = ({ host, sourceMaps }) => {
  return html`
    <div class="host">
      <h1>
        <a href="#" onClick=${() => downloadHost({ host, sourceMaps })}>${host}</a>
      </h1>
      ${sourceMaps.map(sourceMap=> html`
        <${SourceMapItem} sourceMap=${sourceMap} />
      `)}
    </div>
  `
}

export default HostGroup
