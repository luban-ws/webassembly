[![Build status](https://github.com/saschazar21/webassembly/actions/workflows/build-and-test.yml/badge.svg)
](https://github.com/saschazar21/webassembly/actions) ![Github lerna version](https://img.shields.io/github/lerna-json/v/saschazar21/webassembly)

# 📦 WebAssembly Monorepo

> 一个无依赖的 WebAssembly 项目 Monorepo。支持浏览器、Web Worker 和 Node.js 运行时。

以下列出的所有包都可以独立使用，无需任何外部依赖。唯一的前提条件是在使用打包工具（如 [Webpack](https://webpack.js.org/) 或 [Rollup](https://rollupjs.org/guide/en/) 等）时，需要将 `.wasm` 文件包含到分发中。

## 📚 文档

- [开发指南](./DEV_GUIDE.md) - 详细的开发文档，包括项目结构、构建流程、创建新包等

## 📦 包列表

- **[`@saschazar/wasm-avif`](https://github.com/saschazar21/webassembly/tree/master/packages/avif)** - 将原始 RGB(A) 图像数据编码为 [AVIF](https://aomediacodec.github.io/av1-avif/) 格式，或从 AVIF 格式解码为原始 RGB(A) 图像数据。
- **[`@saschazar/wasm-exif`](https://github.com/saschazar21/webassembly/tree/master/packages/exif)** - 读取 JPEG 编码数据并返回包含的 EXIF 信息作为 JavaScript 对象。
- **[`@saschazar/wasm-heif`](https://github.com/saschazar21/webassembly/tree/master/packages/heif)** - 将 [HEIF/HEIC](http://nokiatech.github.io/heif/technical.html) 编码图像解码为原始 RGB 数据。
- **[`@saschazar/wasm-image-loader`](https://github.com/saschazar21/webassembly/tree/master/packages/image-loader)** - 解码 JPEG 和 PNG 编码图像数据，并可选择性地调整图像大小。
- **[`@saschazar/wasm-mean-color`](https://github.com/saschazar21/webassembly/tree/master/packages/mean-color)** - 从原始 RGB/A 图像数据计算平均颜色，并返回十六进制字符串。
- **[`@saschazar/wasm-mozjpeg`](https://github.com/saschazar21/webassembly/tree/master/packages/mozjpeg)** - 使用 [MozJPEG](https://github.com/mozilla/mozjpeg) 编码器将原始 RGB 图像数据编码为 JPEG 格式。
- **[`@saschazar/wasm-webp`](https://github.com/saschazar21/webassembly/tree/master/packages/webp)** - 将原始 RGB(A) 图像数据编码为 [WebP](https://github.com/webmproject/libwebp) 格式，或从 WebP 格式解码为原始 RGB(A) 图像数据。

## 🚀 快速开始

### 安装

```bash
# 使用 yarn
yarn add @saschazar/wasm-avif

# 或使用 npm
npm install --save @saschazar/wasm-avif
```

### 使用示例

```javascript
// Node.js
import wasm_avif from '@saschazar/wasm-avif';

// 初始化 WebAssembly 模块
const avifModule = await wasm_avif({
  noInitialRun: true,
});

// 解码 AVIF 图像
const encodedImage = new Uint8Array(/* AVIF 图像数据 */);
const decoded = avifModule.decode(encodedImage, encodedImage.length, true);

// 清理内存
avifModule.free();
```

更多使用示例请参考各个包的 README 文档。

## 🛠️ 开发

### 环境要求

- Node.js >= 12.x
- Yarn >= 1.22.0
- Docker >= 20.10（用于构建 WebAssembly）

### 快速设置

运行设置脚本自动配置开发环境：

```bash
yarn setup
# 或直接运行
node setup.js
```

设置脚本会：
- ✅ 检查必需工具（Node.js, Yarn, Docker）
- ✅ 拉取 Docker 镜像（emscripten/emsdk:latest）
- ✅ 安装项目依赖

### 手动安装

如果设置脚本失败，可以手动安装：

```bash
# 安装依赖
yarn install

# 拉取 Docker 镜像
docker pull emscripten/emsdk:latest
```

### 构建所有包

```bash
yarn build
```

**注意**：构建需要 Docker，确保 Docker 正在运行。

### 运行测试

```bash
yarn test
```

### 代码检查

```bash
yarn lint
```

更多开发信息请参阅 [开发指南](./DEV_GUIDE.md)。

## 📄 许可证

本项目采用 MIT 许可证。

Copyright ©️ 2020—2021 [Sascha Zarhuber](https://sascha.work)
