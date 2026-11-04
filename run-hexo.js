const Hexo = require('hexo');
const fs = require('fs');

const hexo = new Hexo(__dirname, {
  debug: true,
  silent: false
});

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = Object.keys({...pkg.dependencies, ...pkg.devDependencies});

hexo.init().then(() => {
  const promises = deps
    .filter(name => name.startsWith('hexo-generator') || name.startsWith('hexo-') && !name.startsWith('hexo-cli'))
    .map(name => hexo.loadPlugin(require.resolve(name)).catch(() => {}));
  
  return Promise.all(promises);
}).then(() => {
  console.log('Generators:', Object.keys(hexo.extend.generator.store));
  console.log('Theme:', hexo.config.theme);
  
  // Check posts directly in the posts collection
  const posts = hexo.model('Post');
  console.log('Posts model:', posts ? posts.length : 'null');
  
  return hexo.call('generate');
}).then(() => {
  console.log('Build complete!');
  return hexo.exit();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});