# 开发指南

本文档为 WebAssembly Monorepo 项目的开发指南，帮助开发者理解项目结构、构建流程和开发规范。

## 目录

- [项目概述](#项目概述)
- [环境要求](#环境要求)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [开发流程](#开发流程)
- [创建新包](#创建新包)
- [构建系统](#构建系统)
- [测试](#测试)
- [代码规范](#代码规范)
- [发布流程](#发布流程)
- [常见问题](#常见问题)

## 项目概述

这是一个基于 Lerna 的 WebAssembly Monorepo 项目，包含多个独立的图像处理包。所有包都使用 Emscripten 将 C/C++ 代码编译为 WebAssembly，支持浏览器、Web Worker 和 Node.js 环境。

### 核心特性

- **无依赖设计**：每个包都可以独立使用，无需外部依赖
- **跨平台支持**：浏览器、Web Worker、Node.js
- **类型安全**：完整的 TypeScript 类型定义
- **内存管理**：提供显式的内存清理方法

## 环境要求

### 必需工具

- **Node.js**: >= 12.x（推荐使用 14.x 或 16.x）
- **Yarn**: >= 1.22.0（包管理器）
- **Docker**: >= 20.10（用于构建 WebAssembly，使用 Emscripten 官方镜像）
- **Git**: >= 2.20

### 可选工具

- **CMake**: >= 3.10（仅在构建 `git` 包时需要，其他包在 Docker 容器内构建不需要）
  - **macOS**: `brew install cmake`
  - **Linux (Debian/Ubuntu)**: `sudo apt-get update && sudo apt-get install cmake`
  - **Linux (CentOS/RHEL)**: `sudo yum install cmake` 或 `sudo dnf install cmake`
  - **Windows**: 从 [CMake 官网](https://cmake.org/download/) 下载安装程序，或使用 `choco install cmake`（需要 Chocolatey）
- **VS Code** 或 **Cursor**（推荐 IDE）
- **Docker Desktop**（用于本地构建）

## 项目结构

```
webassembly/
├── packages/              # 所有包的目录
│   ├── avif/             # AVIF 编解码器
│   ├── exif/             # EXIF 数据读取
│   ├── heif/             # HEIF 解码器
│   ├── image-loader/     # 图像加载和缩放
│   ├── mean-color/       # 平均颜色计算
│   ├── mozjpeg/          # MozJPEG 编码器
│   └── webp/             # WebP 编解码器
├── utils/                # 共享工具函数
│   └── request.ts        # 测试用图像获取工具
├── package.json          # 根包配置
├── lerna.json            # Lerna 配置
├── tsconfig.json         # TypeScript 配置
├── jest.config.js        # Jest 测试配置
└── README.md             # 项目说明文档
```

### 单个包的标准结构

```
packages/[package-name]/
├── main.cpp              # C++ 源代码（Emscripten 绑定）
├── build.sh              # 构建脚本
├── package.json          # 包配置
├── wasm_[name].js        # 生成的 JavaScript 包装器
├── wasm_[name].wasm      # 生成的 WebAssembly 二进制文件
├── wasm_[name].d.ts      # TypeScript 类型定义
├── options.js            # 默认选项配置
├── options.d.ts          # 选项类型定义
├── tests/                # 测试文件
│   └── wasm_[name].test.ts
└── README.md             # 包说明文档
```

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/saschazar21/webassembly.git
cd webassembly
```

### 2. 运行设置脚本（推荐）

```bash
yarn setup
# 或直接运行
node setup.js
```

设置脚本会自动：
- 检查必需工具（Node.js, Yarn, Docker, Git）
- 检查 Docker 是否运行
- 拉取 `emscripten/emsdk:latest` Docker 镜像
- 安装项目依赖

### 3. 手动安装（如果设置脚本失败）

如果设置脚本遇到问题，可以手动执行：

```bash
# 安装依赖
yarn install

# 拉取 Docker 镜像
docker pull emscripten/emsdk:latest
```

### 4. 构建所有包

```bash
yarn build
```

**注意**：构建需要 Docker，因为需要使用 Emscripten 官方镜像。确保 Docker 正在运行。

### 5. 运行测试

```bash
yarn test
```

这会先运行 ESLint 检查，然后运行 Jest 测试。

## 开发流程

### 日常开发工作流

1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **安装依赖**（如果添加了新依赖）
   ```bash
   yarn install
   ```

3. **开发代码**
   - 修改 C++ 源代码（`main.cpp`）
   - 更新 TypeScript 类型定义（`.d.ts`）
   - 编写或更新测试

4. **构建单个包**（在包目录下）
   ```bash
   cd packages/avif
   yarn build
   ```

5. **运行单个包的测试**
   ```bash
   cd packages/avif
   yarn test
   ```

6. **代码检查**
   ```bash
   yarn lint
   ```

7. **提交更改**
   - 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
   - 使用 `git commit` 或 `git commit -m "feat: 添加新功能"`

### 开发单个包

在开发特定包时，可以进入该包目录进行独立开发：

```bash
cd packages/avif

# 安装依赖（如果需要）
yarn install

# 构建
yarn build

# 运行测试（如果包有测试脚本）
# 注意：大多数测试在根目录运行
```

## 创建新包

### 步骤 1: 创建包目录结构

```bash
mkdir -p packages/your-package-name/tests
cd packages/your-package-name
```

### 步骤 2: 创建 package.json

参考现有包的 `package.json`，例如 `packages/avif/package.json`：

```json
{
  "name": "@saschazar/wasm-your-package",
  "version": "1.0.0",
  "description": "你的包描述",
  "main": "wasm_your_package.js",
  "scripts": {
    "build": "napa && docker run --rm -v $(pwd):/src emscripten/emsdk:latest ./build.sh"
  },
  "napa": {
    "your-dependency": "repo/name#tag"
  },
  "devDependencies": {
    "napa": "^3.0.0"
  }
}
```

### 步骤 3: 创建 C++ 源代码

创建 `main.cpp` 文件，使用 Emscripten 绑定：

```cpp
#include <emscripten/bind.h>
#include <emscripten/val.h>

using namespace emscripten;

// 你的函数实现
val yourFunction(std::string input) {
  // 实现逻辑
  return val::object();
}

EMSCRIPTEN_BINDINGS(YOUR_MODULE) {
  function("yourFunction", &yourFunction);
}
```

### 步骤 4: 创建构建脚本

创建 `build.sh` 文件：

```bash
#!/bin/bash
set -e

export OPTIMIZE="-Oz"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

export CMAKE_TOOLCHAIN_FILE=/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake

echo "构建你的包..."

emcc \
  --llvm-lto 3 \
  --llvm-opts 3 \
  --bind \
  ${OPTIMIZE} \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s 'EXPORT_NAME="wasm_your_package"' \
  --std=c++11 \
  -o ./wasm_your_package.js \
  -x c++ \
  main.cpp
```

### 步骤 5: 创建 TypeScript 类型定义

创建 `wasm_your_package.d.ts`：

```typescript
export interface YourPackageModule extends EmscriptenModule {
  free(): void;
  yourFunction(input: BufferSource): BufferSource;
}

export default function (
  moduleOverrides?: Partial<YourPackageModule>
): Promise<YourPackageModule>;
```

### 步骤 6: 创建测试文件

创建 `tests/wasm_your_package.test.ts`：

```typescript
import wasm_your_package, { YourPackageModule } from '../wasm_your_package';

describe('YourPackage', () => {
  let module: YourPackageModule;

  beforeEach(async () => {
    module = (await wasm_your_package({
      noInitialRun: true,
    })) as YourPackageModule;
  });

  afterEach(() => {
    module.free();
  });

  it('should work correctly', () => {
    // 测试代码
  });
});
```

### 步骤 7: 更新根目录配置

在根目录的 `package.json` 中添加模块别名：

```json
{
  "_moduleAliases": {
    "@saschazar/wasm-your-package": "packages/your-package-name"
  }
}
```

### 步骤 8: 构建和测试

```bash
# 在包目录下
yarn build

# 在根目录下
yarn test
```

## 构建系统

### Emscripten 构建流程

所有包使用 Emscripten 将 C/C++ 编译为 WebAssembly：

1. **下载依赖**：使用 `napa` 下载 C/C++ 库（如 libavif、libwebp）
2. **编译依赖**：在 Docker 容器中编译 C/C++ 库为静态库（`.a` 文件）
3. **编译主模块**：使用 `emcc` 将 `main.cpp` 和静态库链接为 WebAssembly

### 构建选项说明

- `--llvm-lto 3`: 启用最高级别的链接时优化
- `--bind`: 启用 Emscripten 绑定，自动生成 JavaScript 包装器
- `-Oz`: 优化代码大小
- `-s ALLOW_MEMORY_GROWTH=1`: 允许内存动态增长
- `-s MODULARIZE=1`: 生成模块化代码
- `-s 'EXPORT_NAME="wasm_xxx"'`: 设置导出名称

### 跳过依赖构建

某些包支持跳过依赖构建以加快开发速度：

```bash
# AVIF 包
SKIP_LIBAVIF=1 yarn build

# WebP 包
SKIP_LIBWEBP=1 yarn build
```

## 测试

### 运行所有测试

```bash
yarn test
```

这会：
1. 运行 ESLint 检查
2. 运行所有 Jest 测试

### 运行单个包的测试

测试文件位于 `packages/[package-name]/tests/` 目录，但需要在根目录运行：

```bash
# 运行特定包的测试
jest packages/avif/tests/wasm_avif.test.ts
```

### 测试工具

项目使用 `utils/request.ts` 中的 `unsplashRequest` 函数获取测试图像：

```typescript
import { unsplashRequest } from '../../../utils/request';

const image = await unsplashRequest({
  format: 'jpg',
  width: 1800,
  height: 1200
});
```

### 测试最佳实践

1. **内存管理**：每个测试后调用 `module.free()` 清理内存
2. **异步初始化**：使用 `noInitialRun: true` 和 Promise 等待模块初始化
3. **类型安全**：使用 TypeScript 类型断言确保类型正确
4. **错误处理**：测试错误情况，检查返回的错误对象

## 代码规范

### TypeScript 规范

- 使用 TypeScript 3.7.5+
- 遵循 `tsconfig.json` 中的配置
- 所有导出函数和接口必须有类型定义

### ESLint 规范

项目使用 ESLint 进行代码检查：

```bash
yarn lint
```

主要规则：
- 使用 TypeScript ESLint 插件
- 遵循 Jest 测试规范
- 禁止使用 `any` 类型（除非必要）

### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```
feat(avif): 添加 AVIF 编码器支持
fix(webp): 修复内存泄漏问题
docs: 更新 README
```

## 发布流程

### 自动发布

项目使用 [auto](https://github.com/intuit/auto) 进行自动化版本管理和发布：

1. **创建 PR**：提交更改并创建 Pull Request
2. **CI 检查**：GitHub Actions 自动构建和测试
3. **合并到 main**：合并 PR 后，auto 会根据提交信息自动：
   - 更新版本号
   - 生成 CHANGELOG
   - 创建 Git tag
   - 发布到 NPM

### 手动发布

如果需要手动发布：

```bash
# 安装 auto（如果未安装）
npm install -g auto

# 创建发布
npx auto shipit
```

### 版本管理

- 使用 Lerna 独立版本管理（`lerna.json` 中 `version: "independent"`）
- 每个包独立版本号
- 版本号遵循 [语义化版本](https://semver.org/)

## 常见问题

### Q: 构建失败，提示 Docker 错误

**A**: 确保 Docker 正在运行，并且有足够的磁盘空间。尝试：

```bash
# 运行设置脚本自动检查和修复
yarn setup

# 或手动检查
docker ps  # 检查 Docker 是否运行
docker pull emscripten/emsdk:latest  # 拉取镜像
docker system prune  # 清理未使用的 Docker 资源
```

### Q: Docker 无法找到 'emscripten/emsdk:latest' 镜像

**A**: 这是最常见的设置问题。解决方案：

```bash
# 方法 1: 使用设置脚本（推荐）
yarn setup

# 方法 2: 手动拉取镜像
docker pull emscripten/emsdk:latest

# 方法 3: 检查镜像是否存在
docker images | grep emscripten
```

### Q: 构建时间很长

**A**: 这是正常的，因为需要编译大型 C/C++ 库。可以：

1. 使用 `SKIP_*` 环境变量跳过依赖构建（如果依赖已构建）
2. 只构建你正在开发的包
3. 使用 CI/CD 进行构建

### Q: AVIF 包构建失败，出现 C/C++ 编译错误

**A**: 如果看到类似以下错误：

1. `mixing declarations and code is incompatible with standards before C99`
2. `implicit conversion when assigning to 'uint8_t *' from type 'void *'`
3. `implicit conversion from 'int' to enumeration type 'enum aom_rc_mode' is invalid in C++`

**根本原因**：
- libavif 是用 C 语言编写的，但 Emscripten 编译器在某些情况下使用 C++ 的严格类型检查
- C 语言允许从 `int` 到 `enum` 的隐式转换，但 C++ 不允许
- C 语言允许在代码中间声明变量（C99 特性），但旧标准不允许

**解决方案**：
构建脚本已经修复，添加了以下编译选项：
- `-DCMAKE_C_STANDARD=99` - 设置 C99 标准
- `-Wno-error=implicit-int-enum-cast` - 允许从整数到枚举的隐式转换（合法的 C 代码）
- `-Wno-error=declaration-after-statement` - 允许 C99 变量声明
- 其他相关的警告抑制选项

如果问题仍然存在，可以尝试：
```bash
cd packages/avif
SKIP_LIBAVIF=1 yarn build  # 如果之前构建过依赖
```

### Q: 构建卡住或失败（特别是 heif 包）

**A**: heif 包需要编译 libde265 和 libheif，这可能需要很长时间（30分钟到1小时）。如果卡住：

**方法 1: 跳过 heif 包构建**
```bash
# 只构建其他包，跳过 heif
cd packages/avif && yarn build
cd ../webp && yarn build
# ... 其他包
```

**方法 2: 使用 SKIP 环境变量（如果之前构建过）**
```bash
# 如果依赖已经构建过，可以跳过
SKIP_LIBHEIF=1 cd packages/heif && yarn build
```

**方法 3: 检查构建日志**
```bash
# 查看详细的构建输出
cd packages/heif
docker run --rm -v $(pwd):/src emscripten/emsdk:latest ./build.sh
```

**方法 4: 增加 Docker 资源**
- 确保 Docker Desktop 有足够的内存（建议至少 4GB）
- 确保有足够的磁盘空间（至少 10GB 可用）

**方法 5: 单独构建特定包**
```bash
# 只构建你需要的包
yarn workspace @saschazar/wasm-webp build
yarn workspace @saschazar/wasm-avif build
```

### Q: 测试失败，提示找不到模块

**A**: 确保：

1. 已运行 `yarn install`
2. 已构建包（`yarn build`）
3. 模块别名配置正确

### Q: 如何调试 WebAssembly 代码？

**A**: 

1. 在浏览器中使用 Chrome DevTools
2. 使用 `console.log` 在 C++ 代码中（通过 `printf`）
3. 检查生成的 `.wasm` 文件
4. 使用 Emscripten 的调试选项（移除 `-Oz`，添加 `-g`）

### Q: 如何添加新的 C/C++ 依赖？

**A**:

1. 在 `package.json` 的 `napa` 字段中添加依赖
2. 在 `build.sh` 中下载和编译依赖
3. 在 `emcc` 命令中链接静态库

### Q: 内存泄漏问题

**A**: 

1. 确保每次使用后调用 `free()` 方法
2. 检查 C++ 代码中的内存分配和释放
3. 使用浏览器内存分析工具

### Q: 如何安装 CMake？

**A**: CMake 仅在构建 `git` 包时需要。以下是各平台的安装方法：

**macOS (使用 Homebrew)**:
```bash
brew install cmake
```

**Linux (Debian/Ubuntu)**:
```bash
sudo apt-get update
sudo apt-get install cmake
```

**Linux (CentOS/RHEL/Fedora)**:
```bash
# CentOS/RHEL 7
sudo yum install cmake

# CentOS/RHEL 8+ 或 Fedora
sudo dnf install cmake
```

**Windows**:

方法 1: 使用安装程序（推荐）
1. 访问 [CMake 官网下载页面](https://cmake.org/download/)
2. 下载 Windows x64 Installer
3. 运行安装程序，选择 "Add CMake to system PATH"
4. 重启终端

方法 2: 使用 Chocolatey
```powershell
choco install cmake
```

方法 3: 使用 Scoop
```powershell
scoop install cmake
```

**验证安装**:
```bash
cmake --version
```

应该显示类似 `cmake version 3.x.x` 的输出。

## 参考资料

- [Emscripten 文档](https://emscripten.org/docs/getting_started/index.html)
- [WebAssembly 文档](https://webassembly.org/)
- [Lerna 文档](https://lerna.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)

## 贡献指南

欢迎贡献代码！请：

1. Fork 仓库
2. 创建功能分支
3. 提交更改（遵循 Conventional Commits）
4. 创建 Pull Request
5. 等待代码审查

## 许可证

MIT License

Copyright ©️ 2020—2021 [Sascha Zarhuber](https://sascha.work)

