import {
  html, render, Component,
  useState, useEffect, useCallback, useMemo
} from 'https://cdn.jsdelivr.net/npm/htm@3.0.4/preact/standalone.module.js'

import {
  fileSize, parseFileName,
  downloadSourceMaps,
  emitter
} from './utils.js'

import HostGroup from './components/HostGroup.js'

const port = chrome.extension.connect({
  name: 'Communication to BackGround'
})


const App = () => {
  const [ sourceMap, setSourceMap ]= useState({})
  useEffect(() => {
    NProgress.start()
    const handler = list => {
      setSourceMap(map => {
        return list.reduce((ret, item)=> {
          return { ...ret, [item.url]: item }
        }, map)
      })
      NProgress.done()
    }
    port.onMessage.addListener(handler)
    port.postMessage('getAllSourceFiles');
    return () => port.onMessage.removeListener(handler)
  }, [])

  const hostMap  = useMemo(() => {
    return Object.values(sourceMap).reduce((map, item) => {
      const { host } = new URL(item.url)
      map[host] = map[host] || []
      map[host].push(item)
      return map
    }, Object.create(null))
  }, [sourceMap])

  const reset = useCallback(() => {
    port.postMessage('reset')
    setSourceMap({})
  })

  return html`
    <div class="app">
      <button onClick=${reset}>reset</button>
      <ul>
        ${Object.entries(hostMap).map(([host, sourceMaps ]) => html`
          <${HostGroup} ...${{ host, sourceMaps }} />
        `)}
      </ul>
    </div>
  `
}

render(html`<${App} />`, document.body)
