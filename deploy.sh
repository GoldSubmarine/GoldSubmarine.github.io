export TZ='Asia/Shanghai' &&
git config --global user.email 997462392@qq.com &&
git config --global user.name vinsoncho &&


# 使用已部署文件初始化目标
git clone --depth 1 --branch=master https://github.com/vinsoncho/vinsoncho.github.io.git .deploy_git
# cd .deploy_git
# find . -path ./.git -prune -o -exec rm -rf {} \; 2> /dev/null
# cd ../

# 部署
yarn build &&
cp -r .circleci public/.circleci && 
cp README.md public/README.md &&
ls public -a &&
yarn deploy