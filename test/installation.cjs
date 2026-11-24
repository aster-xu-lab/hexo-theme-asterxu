const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const repository = path.resolve(__dirname, '..')
const example = path.join(repository, 'example')
const modules = path.join(example, 'node_modules')
const hexo = path.join(modules, 'hexo', 'bin', 'hexo')
assert.ok(fs.existsSync(hexo), 'Run npm ci --prefix example first.')

for (const root of ['/', '/notes/']) {
  const site = fs.mkdtempSync(path.join(os.tmpdir(), 'asterxu-install-'))
  try {
    fs.copyFileSync(path.join(example, 'package.json'), path.join(site, 'package.json'))
    const siteUrl = 'https://example.test' + root
    const config = fs.readFileSync(path.join(example, '_config.yml'), 'utf8')
      .replace('url: https://example.test', 'url: ' + siteUrl)
      .replace('root: /', 'root: ' + root)
    fs.writeFileSync(path.join(site, '_config.yml'), config)
    fs.cpSync(path.join(example, 'source'), path.join(site, 'source'), { recursive: true })
    fs.symlinkSync(modules, path.join(site, 'node_modules'), 'junction')
    fs.mkdirSync(path.join(site, 'themes'))
    execFileSync('git', ['clone', '--quiet', '--local', '--', repository, path.join(site, 'themes', 'asterxu')])

    const log = execFileSync(process.execPath, [hexo, 'generate'], {
      cwd: site,
      encoding: 'utf8',
      timeout: 30000,
      env: { ...process.env, TZ: 'UTC' }
    })
    assert.doesNotMatch(log, /\b(?:ERROR|FATAL)\b/)
    assert.doesNotMatch(log, /Use _config\.asterxu|建议在 _config\.asterxu/)

    const out = path.join(site, 'public')
    const read = file => fs.readFileSync(path.join(out, file), 'utf8')
    const home = read('index.html')
    const article = read('welcome/index.html')
    assert.match(home, /<h1[^>]*>[\s\S]*?<span>Example Notebook<\/span>[\s\S]*?<\/h1>/)
    assert.match(article, /<article[\s\S]*?This article renders with theme defaults\./)
    assert.match(read('archives/index.html'), /Welcome to the Example Notebook/)
    assert.match(read('categories/index.html'), /Notes/)
    assert.match(read('tags/index.html'), /Example/)
    assert.match(read('local-search.xml'), /A searchable sample sentence\./)
    assert.equal(fs.existsSync(path.join(out, 'xml/local-search.xml')), false)
    assert.ok(read('local-search.xml').includes(root + 'welcome/'))
    assert.ok(home.includes(root + 'lib/bootstrap/4.6.1/css/bootstrap.min.css'))
    assert.ok(home.includes(root + 'img/asterxu/favicon.svg'))

    for (const file of ['index.html', 'welcome/index.html', 'archives/index.html', 'categories/index.html', 'tags/index.html', '404.html']) {
      const html = read(file)
      assert.doesNotMatch(html, /https:\/\/github\.com\/aster-xu-lab|https:\/\/lib\.baomitu\.com|ax-post-series/)
      for (const [, ref] of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
        if (!ref || ref.startsWith('#')) continue
        const uri = new URL(ref, siteUrl + file)
        if (uri.origin !== new URL(siteUrl).origin) continue
        const pathname = decodeURIComponent(uri.pathname)
        assert.ok(pathname.startsWith(root), ref)
        const local = path.join(out, pathname.slice(root.length))
        const output = pathname.endsWith('/') ? path.join(local, 'index.html') : local
        assert.ok(fs.existsSync(output), file + ' references a missing file ' + ref)
      }
    }
    console.log('Standalone installation passed at ' + root)
  } finally {
    fs.rmSync(site, { recursive: true, force: true })
  }
}
