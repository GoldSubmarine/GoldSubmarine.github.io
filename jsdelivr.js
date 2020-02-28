const glob = require("glob");
const fs = require("fs");

const cdn = "https://cdn.jsdelivr.net/gh/goldsubmarine/goldsubmarine.github.io@master"

glob("./public/**/*.html", {}, function(er, files) {
    files.forEach(page => {
        let buffer = fs.readFileSync(page, {})
        let str = buffer.toString()
        str = str.replace(/src="\/js\//, `src="${cdn}/js/`)
        str = str.replace(/src="\/images\//, `src="${cdn}/images/`)
        str = str.replace(/href="\/css\//, `href="${cdn}/css/`)
        str = str.replace(/href="\/images\//, `href="${cdn}/images/`)
        fs.writeFileSync(page, str, {})
    })
});
