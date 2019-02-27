const fs = require('fs');
const path = require('path')
const baseUrl = 'https://github.com/cwj0130/cwj0130.github.io/blob/master';

let mdArr = [];
let urlArr = [];
let readme = '# 博客\n';

fs.existsSync('./README.md') ? fs.unlinkSync('./README.md') : '';

function getMd(dirPath) {

    let dirArr = fs.readdirSync(dirPath);

    dirArr.forEach(async item => {
        let itemPath = path.resolve(dirPath, item);
        if (fs.statSync(itemPath).isDirectory() && /^[^\.]/.test(item)) {
            await getMd(itemPath);
        } else {
            if (/\.md$/g.test(item)) mdArr.push(itemPath)
        }
    })
}

getMd('.')

urlArr = mdArr.map(item => {
    return baseUrl + item.replace(/.+github\.io/g, '').replace(/(\\|\/\/)/g, '/');
});

urlArr.forEach(item => {
    let dir = item.replace(/.+github\.io\/blob\/master\/(.+?)\/.+/, '$1');
    if (readme.indexOf(`## ${dir}`) === -1) {
        readme += `\n## ${dir}\n\n`;
    }
    let name = item.replace(/.+\/(.+)\.md$/, '$1');
    readme += `- [${name}](${encodeURI(item)})\n`;
})
// console.log('---------------')
// console.log(readme)

fs.writeFile('README.md', readme, (err) => {
    if (err) throw err;
    console.log('create readme success 🎉🎉🎉');
});