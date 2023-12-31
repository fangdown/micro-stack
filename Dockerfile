FROM node:16-alpine as builder

WORKDIR /code

# 单独分离 package.json，是为了安装依赖可最大限度利用缓存
ADD package.json yarn.lock /code/
# 此时，yarn 可以利用缓存，如果 yarn.lock 内容没有变化，则不会重新依赖安装
RUN yarn

# 单独分离 public/src，是为了避免 ADD . /code 时，因为 Readme/nginx.conf 的更改避免缓存生效
# 也是为了 yarn build 可最大限度利用缓存
ADD . /code
RUN yarn build

# 选择更小体积的基础镜像
FROM nginx:alpine
ADD nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder code/dist /usr/share/nginx/html