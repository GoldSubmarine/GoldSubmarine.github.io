const glob = require("glob");
const fs = require("fs");

const cdn = "https://gcore.jsdelivr.net/gh/goldsubmarine/goldsubmarine.github.io@master"

glob("./public/**/*.html", {}, function(er, files) {
    files.forEach(page => {
        let buffer = fs.readFileSync(page, {})
        let str = buffer.toString()
        str = str.replace(/src="\/js\//g, `src="${cdn}/js/`)
        str = str.replace(/src="\/images\//g, `src="${cdn}/images/`)
        str = str.replace(/href="\/css\//g, `href="${cdn}/css/`)
        str = str.replace(/href="\/images\//g, `href="${cdn}/images/`)
        fs.writeFileSync(page, str, {})
        console.log("页面 cdn 成功：", page)
    })
});
