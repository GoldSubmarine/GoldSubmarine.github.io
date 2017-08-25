const newMd = require('./article-info/newArticleInfo.js');

let moduleExport = {};

moduleExport[`${newMd.name}`] = `./src/component/index.js`;

module.exports = moduleExport;
