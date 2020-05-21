import 'https://cdn.jsdelivr.net/npm/source-map@0.7.3/dist/source-map.js'

const { SourceMapConsumer } = sourceMap

sourceMap.SourceMapConsumer.initialize({
  "lib/mappings.wasm": "https://cdn.jsdelivr.net/npm/source-map@0.7.3/lib/mappings.wasm"
});

export const readSourceMap = async rawSourceMap => {
  const consumer = await new SourceMapConsumer(rawSourceMap);
  if (!consumer.hasContentsOfAllSources()) {
    await new Promise(resolve => {
      fetchSources(consumer, resolve)
    })
  }
  return consumer
}

export const isValidSourceMap = async (rawSourceMap) => {
  try {
    const consumer = await new SourceMapConsumer(rawSourceMap);
    const ret = consumer.hasContentsOfAllSources()
    consumer.destroy();
    return true
  } catch(e) {
    console.log(e)
  }
  return false;
}
