NProgress.start()
import('./app.js').then(() => {
  NProgress.done()
  NProgress.remove()
})
