const fs = require('fs');

const tagName = process.argv[2] || process.env.TAG_NAME || '';
const version = tagName.replace(/^v/, '');
let releaseNotes = '';

if (fs.existsSync('CHANGELOG.md')) {
  const content = fs.readFileSync('CHANGELOG.md', 'utf8');
  const escapedVersion = version.replace(/\./g, '\\.');
  const regex = new RegExp(`## \\[[vV]?${escapedVersion}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = content.match(regex);
  if (match && match[1]) {
    releaseNotes = match[1].trim();
  }
}

if (!releaseNotes) {
  releaseNotes = '请查看下方 Assets 下载最新版本。更新日志与详细说明请见 GitHub Release。';
}

console.log(releaseNotes);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `body<<EOF\n${releaseNotes}\nEOF\n`);
}
