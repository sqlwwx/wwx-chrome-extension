import { html, Component, useState, useCallback, useEffect, render, useRef } from 'https://cdn.jsdelivr.net/npm/htm@3.0.4/preact/standalone.module.js'

const saveOptions = (options) => {
  localStorage.setItem('options', JSON.stringify(options));
  window.close();
}

const options = JSON.parse(
  localStorage.getItem('options') || '{}'
)

const port = chrome.extension.connect({
  name: 'options'
})

const App = () => {
  return html`
    <div class="app">
      <button onClick=${() => port.postMessage('reset')}>reset</button>
    </div>
  `
}

render(html`<${App} />`, document.body);
