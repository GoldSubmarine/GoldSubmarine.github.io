const fs = require("fs");
const path = require('path');
const colors = require('colors');
const Glob = require('glob').Glob;

const mdArr = new Glob('*.md', {
    cwd: path.resolve('./src/createMd'),
    sync: true
}).found;

//控制台打印颜色的配置
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});


//复制文件的数据
function cutFile(osrc, odist) {
    console.log(`-- 开始移动${osrc} -- 移动到${odist}`.info);
    if ( !fs.existsSync(osrc) ) {
        console.log('-- 该文件不存在'.error);
        return;
    }
    fs.readFile(osrc, 'utf-8', function (err, data) {
        if (err) {
            console.log("-- 读取失败!!!!!".error);
            throw err;
        } else {
            console.log('-- 读取成功'.info);
            writeFile(data, odist, osrc);
            return data;
        }
    });
}

//写入文件数据
function writeFile(data, odist, osrc) {
    fs.writeFile(odist, data, 'utf8', function (error) {
        if (error) {
            console.log('-- 复制文件失败'.error);
            throw error;
        } else {
            console.log(`-- 已将${mdArr[0]}复制到md文件夹`.info);
            deleteFile(osrc);
        }
    });
}

//删除源文件
function deleteFile(osrc) {
    fs.unlink(osrc, (err) => {
        if (err) {
            console.log('-- 删除数据失败'.error);
            throw err;
        } else {
            console.log(`-- 已将createMd文件夹下的${mdArr[0]}删除`.info);
            console.log(`**************剪切文件成功***********`.rainbow);
        }
    })
}

let src = path.resolve(`./src/createMd/${mdArr[0]}`); //准备移动的文件路径
let dist = path.resolve(`./src/md/${mdArr[0]}`); //移动文件的目的地

cutFile(src, dist);