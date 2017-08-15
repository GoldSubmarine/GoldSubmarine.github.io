const newMd = require('./article-info/newArticleInfo.js');

let moduleExport = {};

moduleExport[`${newMd.name}`] = `./src/createMd/content.js`;

module.exports = moduleExport;
