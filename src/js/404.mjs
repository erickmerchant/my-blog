export default Promise.resolve({
  location: '/404.html',
  title: 'Page Not Found',
  error: Error('That page doesn\'t exist. It was either moved, removed, or never existed.')
})
