const path = require('path');
const Glob = require('glob').Glob;

const mdArr = new Glob('*.md', {
    cwd: path.resolve('./src/createMd'),
    sync: true
}).found;

console.log(mdArr);

let moduleExport = {
    name: mdArr[0].split('.')[0],
    filename: `${mdArr[0]}`,
    src: path.resolve(`./src/createMd/${mdArr[0]}`)
};



module.exports = moduleExport;
