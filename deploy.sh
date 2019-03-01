export TZ='Asia/Shanghai' &&
git config --global user.email 997462392@qq.com &&
git config --global user.name vinsoncho &&


# 使用已部署文件初始化目标
git clone --depth 1 --branch=master https://github.com/vinsoncho/vinsoncho.github.io.git .deploy_git &&

# 部署
yarn build &&
cp -r .circleci public/.circleci && 
cp -r .circleci .deploy_git/.circleci && 
cp README.md public/README.md &&
yarn deploy