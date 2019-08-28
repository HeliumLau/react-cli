# 1.引言

自己配置的webpack + react的脚手架。

# 2.已完成

 - [x] start.js启动开发脚本
 - [x] webpack开发配置
 - [x] webpack构建配置
 - [x] git ignore文件
 - [x] Eslint
 - [x] EditorConfig
 - [x] ES6语法确认
 - [x] less是否可读
 - [x] url/img loader
 - [x] postcss
 - [ ] typescript
 - [ ] commitizen提交规范

# 3.Webpack性能优化

 1. 优化构建速度
	- 缩小文件的搜索范围
		- resolve字段，alias、extensions
		- loader的test、include、exclude
		- module.noParse
	- DllPlugin
	- HappyPack
  - ParallelUglifyPlugin
 2. 优化输出质量
	- definePlugin
	- 压缩代码
 3. 加速网络资源
	- CDN
	- 提取公共代码
 4. 切割代码按需加载
