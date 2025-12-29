#!/usr/bin/env node

/* eslint-env node, es6 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * WebAssembly Monorepo 环境设置脚本
 * 此脚本用于检查和设置开发环境
 */

const { execSync, spawn } = require('child_process');

// 颜色输出（使用 ANSI 转义码）
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// 打印带颜色的消息
const print = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => {
    console.log('');
    console.log(
      `${colors.blue}========================================${colors.reset}`
    );
    console.log(`${colors.blue}${msg}${colors.reset}`);
    console.log(
      `${colors.blue}========================================${colors.reset}`
    );
    console.log('');
  },
};

// 执行命令并返回结果
function execCommand(command, options = {}) {
  try {
    const execOptions = {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      timeout: options.timeout || 30000, // 默认30秒超时
      ...options,
    };
    const result = execSync(command, execOptions);
    return { success: true, output: result };
  } catch (error) {
    // 超时错误
    if (error.signal === 'SIGTERM') {
      return {
        success: false,
        error: '命令执行超时',
        output: '',
      };
    }
    return {
      success: false,
      error: error.message,
      output: error.stdout || '',
    };
  }
}

// 检查命令是否存在
function checkCommand(command, getVersion = true) {
  try {
    if (getVersion) {
      const result = execCommand(`${command} --version`, {
        silent: true,
        timeout: 5000, // 5秒超时
      });

      if (result.success) {
        const version = result.output.trim().split('\n')[0];
        print.success(`${command} 已安装: ${version}`);
        return true;
      }
    } else {
      // 只检查命令是否存在，不获取版本
      // 跨平台兼容：Windows 使用 where，Unix 使用 which
      const isWindows = process.platform === 'win32';
      const checkCmd = isWindows ? `where ${command}` : `which ${command}`;
      const result = execCommand(checkCmd, {
        silent: true,
        timeout: 3000, // 3秒超时
      });

      if (result.success) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

// 检查 Node.js 版本
function checkNodeVersion() {
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);

    if (major >= 12) {
      print.success(`Node.js 版本符合要求: ${version}`);
      return true;
    } else {
      print.error(`Node.js 版本过低: ${version}，需要 >= 12.x`);
      return false;
    }
  } catch (error) {
    print.error('Node.js 版本检查失败');
    return false;
  }
}

// 检查 Docker 是否运行
function checkDockerRunning() {
  try {
    print.info('检查 Docker 状态...');
    const result = execCommand('docker info', {
      silent: true,
      timeout: 10000, // 10秒超时
    });

    if (result.success) {
      print.success('Docker 正在运行');
      return true;
    } else {
      print.error('Docker 未运行，请启动 Docker Desktop 或 Docker 服务');
      return false;
    }
  } catch (error) {
    print.error('Docker 未运行，请启动 Docker Desktop 或 Docker 服务');
    return false;
  }
}

// 检查 Docker 镜像是否存在
function checkDockerImage(image) {
  try {
    const result = execCommand(`docker image inspect ${image}`, {
      silent: true,
    });
    return result.success;
  } catch (error) {
    return false;
  }
}

// 拉取 Docker 镜像
async function pullDockerImage(image) {
  print.info(`检查 Docker 镜像: ${image}`);

  if (checkDockerImage(image)) {
    print.success(`Docker 镜像已存在: ${image}`);
    return true;
  }

  print.info(`正在拉取 Docker 镜像: ${image}（这可能需要几分钟）...`);

  return new Promise((resolve) => {
    const docker = spawn('docker', ['pull', image], {
      stdio: 'inherit',
    });

    docker.on('close', (code) => {
      if (code === 0) {
        print.success(`Docker 镜像拉取成功: ${image}`);
        resolve(true);
      } else {
        print.error('Docker 镜像拉取失败');
        resolve(false);
      }
    });

    docker.on('error', (error) => {
      print.error(`Docker 命令执行失败: ${error.message}`);
      resolve(false);
    });
  });
}

// 安装依赖
function installDependencies() {
  const packageManager = checkCommand('yarn', false) ? 'yarn' : 'npm';

  print.info(`使用 ${packageManager} 安装依赖...`);

  const result = execCommand(`${packageManager} install`);

  if (result.success) {
    print.success('依赖安装成功');
    return true;
  } else {
    print.error('依赖安装失败');
    return false;
  }
}

// 主函数
async function main() {
  print.header('WebAssembly Monorepo 环境设置');

  let errors = 0;

  // 检查必需工具
  print.header('检查必需工具');

  if (!checkCommand('git')) {
    errors++;
  }

  if (!checkNodeVersion()) {
    errors++;
  }

  print.info('检查包管理器...');
  const hasYarn = checkCommand('yarn', false);
  const hasNpm = checkCommand('npm', false);

  if (!hasYarn && !hasNpm) {
    print.error('Yarn 或 npm 未安装');
    errors++;
  } else if (hasYarn) {
    print.success('Yarn 已安装');
  } else if (hasNpm) {
    print.warning('Yarn 未安装，将使用 npm');
    print.success('npm 已安装');
  }

  // 检查可选工具（用于构建 git 包）
  print.info('检查可选工具...');
  const hasCmake = checkCommand('cmake', false);
  if (!hasCmake) {
    print.warning('CMake 未安装（可选，仅构建 git 包时需要）');
    print.info(
      '  安装方法: brew install cmake (macOS) 或访问 https://cmake.org/download'
    );
  } else {
    print.success('CMake 已安装');
  }

  // 检查 Docker
  print.header('检查 Docker');

  if (!checkCommand('docker', false)) {
    print.error(
      'Docker 未安装，请访问 https://www.docker.com/get-started 安装'
    );
    errors++;
  } else {
    if (checkDockerRunning()) {
      const image = 'emscripten/emsdk:latest';
      const pulled = await pullDockerImage(image);
      if (!pulled) {
        errors++;
      }
    } else {
      errors++;
    }
  }

  // 如果有错误，退出
  if (errors > 0) {
    print.header('设置失败');
    print.error(`发现 ${errors} 个问题，请先解决这些问题`);
    console.log('');
    print.info('常见解决方案：');
    console.log('  1. 安装缺失的工具（Node.js, Yarn, Docker）');
    console.log('  2. 启动 Docker Desktop 或 Docker 服务');
    console.log('  3. 检查网络连接（用于拉取 Docker 镜像）');
    console.log('  4. CMake 是可选的，仅在构建 git 包时需要');
    process.exit(1);
  }

  // 安装依赖
  print.header('安装项目依赖');

  if (!installDependencies()) {
    process.exit(1);
  }

  // 完成
  print.header('设置完成');
  print.success('开发环境已就绪！');
  console.log('');
  print.info('下一步：');
  console.log("  - 运行 'yarn build' 构建所有包");
  console.log("  - 运行 'yarn test' 运行测试");
  console.log('  - 查看 DEV_GUIDE.md 了解更多信息');
  console.log('');
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    print.error(`设置过程中发生错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };
