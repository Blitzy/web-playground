// @ts-check
import external from 'rollup-plugin-peer-deps-external';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import url from '@rollup/plugin-url';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';
import chalk from 'chalk';

const path = require('path');

const MODES = {
  _DEFAULT_: 'prod',
  PROD: 'prod',
  DEV: 'dev',
  QA: 'qa',
};

const WEBGLINSPECTOR = {
  _DEFAULT_: 'off',
  ON: 'on',
  OFF: 'off'
}

/**
 * The mode that rollup was intiated with.
 */
var mode;

/**
 * The webgl inspector on or off.
 */
var webglInspector;

/**
 * Load argument value using the given options object as valid values. If the arg is not one of the given option values then
 * the _DEFAULT_ property is used from the options object.
 */
function loadArg(arg, options) {
  let value = arg;

  // Verify that the arg value is one of the options provided.
  const optionKeys = Object.getOwnPropertyNames(options);
  for (const optionKey of optionKeys) {
    if (optionKey === '_DEFAULT_') {
      // Ignore the _DEFAULT_ key.
      continue;
    }

    const optionValue = options[optionKey];
    if (value === optionValue) {
      // Arg value matches one of the options!
      return value;
    }
  }

  // Arg is not one of the options.
  // Use the default value from the options object.
  value = options._DEFAULT_;
  
  if (value === undefined || value === null) {
    throw new Error(`[Colorful Farm Rollup] Invalid arg '${arg}' given and no default value was provided in options:\n${JSON.stringify(options)}`);
  }

  return value;
}

/**
 * Load argument value using the given options object as valid values. If the arg is not one of the given option keys then
 * the _DEFAULT_ property is used from the options object.
 */
function loadArgByKey(key, options) {
  let value = options[key];

  if (value === undefined || value === null) {
    // Key is not in the options object.
    // Use the default value from the options object.
    value = options._DEFAULT_;

    if (value === undefined || value === null) {
      throw new Error(`[Colorful Farm Rollup] Invalid arg key '${key}' given and no default value was provided in options:\n${JSON.stringify(options)}`);
    }
  }

  return value;
}

function buildMode() {
  if (mode === MODES.PROD) {
    return 'Production';
  } else if (mode === MODES.DEV) {
    return 'Development';
  } else if (mode === MODES.QA) {
    return 'Quality Assurance';
  } else {
    console.error(chalk.red(`Build mode is not implemented in build mode string function.`));
  }
}

function nodeEnv() {
  if (mode === MODES.DEV) {
    return 'development';
  } else {
    return 'production'
  }
}

function shouldMinify() {
  if (mode === MODES.PROD) {
    return true;
  } else if (mode === MODES.QA) {
    return true;
  } else if (mode === MODES.DEV) {
    return false;
  } else {
    console.error(chalk.red(`Build mode is not implemented in should minify function.`));
  }
}

function tsConfig() {
  if (mode === MODES.PROD) {
    return 'tsconfig-prod.json';
  } else if (mode === MODES.QA) {
    return 'tsconfig.json';
  } else if (mode === MODES.DEV) {
    return 'tsconfig.json';
  } else {
    console.error(chalk.red(`Build mode is not implemented in should minify function.`));
  }
}

function shouldHaveSourceMaps() {
  if (mode === MODES.PROD) {
    return false;
  } else if (mode === MODES.QA) {
    return true;
  } else if (mode === MODES.DEV) {
    return true;
  } else {
    console.error(chalk.red(`Build mode is not implemented in should minify function.`));
  }
}

function shouldCleanCache() {
  if (mode === MODES.PROD) {
    return true;
  } else if (mode === MODES.QA) {
    return true;
  } else if (mode === MODES.DEV) {
    return false;
  } else {
    console.error(chalk.red(`Build mode is not implemented in should minify function.`));
  }
}

function getWebGLInspector() {
  if (webglInspector === WEBGLINSPECTOR.ON) {
    return '<script src="http://benvanik.github.com/WebGL-Inspector/core/embed.js"></script>';
  } else {
    return '';
  }
}

export default async function start(args) {
  console.log('============================================');
  console.log('=        Rollup Three JS Playground        =');
  console.log('============================================');

  mode = loadArg(args.configMode, MODES);
  console.log(`Build Three JS Playground in ${mode} mode.`);

  webglInspector = loadArg(args.configGLI, WEBGLINSPECTOR);
  console.log(`Setting WebGL Inspector to ${webglInspector}.`);

  let input = 'src/index.ts';
  let output = {
    dir: 'dist',
    format: 'es',
    exports: 'named',
    entryFileNames: '[name]-[hash].js',
    sourcemap: shouldHaveSourceMaps(),
  };

  let manualChunks = (id) => {
    if (id.includes('node_modules')) {
      const nodeModules = 'node_modules' + path.sep;
      let startIndex = id.indexOf(nodeModules) + nodeModules.length;
      let lastIndex = id.indexOf(path.sep, startIndex);
      let module = id.substring(startIndex, lastIndex);
      return module;
    }
  }

  let plugins = [];

  plugins.push(
    del({
      targets: ['dist']
    })
  );

  plugins.push(
    external()
  );

  plugins.push(
    nodeResolve({
      rootDir: '.',
      mainFields: [ 'module', 'browser', 'main' ]
    })
  );

  plugins.push(
    commonjs({
      include: /node_modules/
    })
  );

  plugins.push(
    typescript({
      tsconfig: tsConfig(),
      check: true,
      clean: shouldCleanCache(),
      verbosity: 2,
    })
  );

  plugins.push(
    url({
      limit: 0,
      publicPath: 'public/assets/',
      destDir: 'dist/public/assets/',
      include: [
        '**/*.svg',
        '**/*.png',
        '**/*.jpg',
        '**/*.gif',
        '**/*.glb',
        '**/*.gltf',
        '**/*.bin',
        '**/*.mp3',
        '**/*.json',
      ]
    })
  );

  plugins.push(
    postcss()
  );

  plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv()),
    })
  );

  if (shouldHaveSourceMaps()) {
    plugins.push(
      sourcemaps({
      })
    );
  }
  
  plugins.push(
    copy({
      targets: [
        { src: 'src/public/', dest: 'dist' }, // copy the public folder to dist.
      ],
      verbose: true,
    })
  );
  
  if (shouldMinify()) {
    plugins.push(
      terser({
        sourcemap: shouldHaveSourceMaps(),
        warnings: 'verbose',
      })
    );
  }

  plugins.push(
    htmlTemplate({
      template: 'src/index.html',
      dest: 'dist/index.html',
      attrs: [ `type="module"` ],
      replaceVars: {
        '<!-- WebGL Inspector Placeholder -->': getWebGLInspector(),
      }
    })
  )

  return {
    input,
    output,
    manualChunks,
    plugins,
    preserveEntrySignatures: false,
    watch: {
      include: 'src/**',
    }
  };
}