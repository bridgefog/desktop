function injectLivereload() {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.src = 'http://localhost:35729/livereload.js?snipver=1'
  document.getElementsByTagName('head')[0].appendChild(script)
}

if (process.env.GULP) { injectLivereload() }
