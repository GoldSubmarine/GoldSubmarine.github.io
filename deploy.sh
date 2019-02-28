git config --global user.email 997462392@qq.com &&
git config --global user.name vinsoncho &&
git fetch &&
yarn build &&
cp -r .circleci public/.circleci && 
yarn deploy