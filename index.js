#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
program.version('0.1.0'); 
// 可以自动的解析命令和参数，用于处理用户输入的命令。
const download = require('download-git-repo');
// 从git上下载模板 download-git-repo
/**
 * download 
 *  第一个参数： 仓库地址 第二个参数： 下载地址
*/
const inquirer = require('inquirer');
// 命令交互 一问一答
const handlebars = require('handlebars');
// 这里用 handlebars 的语法对仓库的模板中的 package.json 文件得一些属性值做一些修改 渲染模板
const ora = require('ora');
// 下载视觉美化 在用户输入答案之后，开始下载模板，这时候使用 ora 来提示用户正在下载中。
const chalk = require('chalk');
/**
 * 然后通过 chalk 来为打印信息加上样式，比如成功信息为绿色，失败信息为红色
 * 这样子会让用户更加容易分辨，同时也让终端的显示更加的好看。
 * */ 
const symbols = require('log-symbols');
// 除了给打印信息加上颜色之外，还可以使用 log-symbols 在信息前面加上 √ 或 × 等的图标 

// abc init vue-element a-name 基于vue-element模板初始化
// abc init libii b-name 基于libii模板初始化
// 定义模板list
const templates = {
   'vue-element': {
      url: 'https://github.com/923630017/vue-element',
      downloadUrl: 'http://github.com:923630017/vue-element#master',
      description: 'element模板',
    },
    'vue-iview': {
        url: 'https://github.com/923630017/libii', // 仓库地址
        downloadUrl: 'http://github.com:923630017/libii#master', // 下载地址
        description: 'iview模板',
    },
}

// init <template> <project>
program
    .command('init <templateName> <projectName>') // 模板 项目名称
    .description('初始化项目模板')
    .action((templateName, projectName) => {
        // 根据模板模下载对应模板到本地
        const { downloadUrl } = templates[templateName];
        inquirer.prompt([
            {
                name: 'description',
                message: '请输入项目描述'
            },
            {
                name: 'author',
                message: '请输入作者名称'
            },
            ]).then((answers) => {
                // 下载之前loading提示
                const spinner = ora('正在下载模板...').start();
                download(downloadUrl, projectName, { clone: true },(err) => {
                    if(err) {
                        spinner.fail(); //下载失败
                        console.log(symbols.error, chalk.red(err));
                       return;
                    }
                    spinner.succeed(); // 下载成功
                    const meta = {
                        name: projectName,
                        description: answers.description,
                        author: answers.author
                    }
                    const fileName = `${projectName}/package.json`;
                    const content = fs.readFileSync(fileName).toString();
                    const result = handlebars.compile(content)(meta);
                    fs.writeFileSync(fileName, result);
                    console.log(symbols.success, chalk.green('项目初始化完成')); // 成功提示
                })
            })
    })
program
    .command('list')
    .description('查看所有模板')
    .action(() => {
        Object.keys(templates).forEach((key) => {
            console.log(`名称${key}, 描述${templates[key].description}`)
        })
    });
program.parse(process.argv);
// npm发布 脚手架名称和package,jsonname名称一致
