const fs = require('fs');
const path = require('path');

class FileListPlugin {
  static name = 'demo-webpack-plugin';
  static defaultOptions = {
    outputFile: 'assets.md',
  };

  // Any options should be passed in the constructor of your plugin,
  // (this is a public API of your plugin).
  constructor(options = {}) {
    // Applying user-specified options over the default options
    // and making merged options further available to the plugin methods.
    // You should probably validate all the options here as well.
    this.options = { ...FileListPlugin.defaultOptions, ...options };
  }

  apply(compiler) {
    const pluginName = FileListPlugin.name;

    // webpack module instance can be accessed from the compiler object,
    // this ensures that correct version of the module is used
    // (do not require/import the webpack or any symbols from it directly).
    const { webpack } = compiler;

    // Compilation object gives us reference to some useful constants.
    const { Compilation } = webpack;

    // RawSource is one of the "sources" classes that should be used
    // to represent asset sources in compilation.
    const { RawSource } = webpack.sources;

    // Tapping to the "thisCompilation" hook in order to further tap
    // to the compilation process on an earlier stage.
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      // Tapping to the assets processing pipeline on a specific stage.
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,

          // Using one of the later asset processing stages to ensure
          // that all assets were already added to the compilation by other plugins.
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          // "assets" is an object that contains all assets
          // in the compilation, the keys of the object are pathnames of the assets
          // and the values are file sources.

          // Iterating over all the assets and
          // generating content for our Markdown file.
          const content =
            '# In this build:\n\n' +
            Object.keys(assets)
              .map((filename) => `- ${filename}`)
              .join('\n');


          fs.writeFileSync(this.options.outputFile, content, {encoding: 'utf-8'});
          console.log(`\n======= 输出文件 ==========================`);
          // Adding new asset to the compilation, so it would be automatically
          // generated by the webpack in the output directory.
          // compilation.emitAsset(
          //   this.options.outputFile,
          //   new RawSource(content)
          // );
        }
      );
    });
  }
}

let show = true;

class FileListPlugin2 {
  static name = 'demo-webpack-plugin';
  static defaultOptions = {
    outputFile: 'assets.md',
  };

  // Any options should be passed in the constructor of your plugin,
  // (this is a public API of your plugin).
  constructor(options = {}) {
    // Applying user-specified options over the default options
    // and making merged options further available to the plugin methods.
    // You should probably validate all the options here as well.
    this.options = { ...FileListPlugin.defaultOptions, ...options };
  }

  apply(compiler) {
    const pluginName = FileListPlugin.name;

    // webpack module instance can be accessed from the compiler object,
    // this ensures that correct version of the module is used
    // (do not require/import the webpack or any symbols from it directly).
    const { webpack } = compiler;

    // Compilation object gives us reference to some useful constants.
    const { Compilation } = webpack;

    // RawSource is one of the "sources" classes that should be used
    // to represent asset sources in compilation.
    const { RawSource } = webpack.sources;



    debugger;
    let content = '';
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {

      compilation.hooks.buildModule.tap(
        pluginName,
        (module) => {
          // console.log(`\n============= module =====\n%s`, JSON.stringify({...module, parser:null, resourceResolveData: null, loaders: null}, null, 2) )
          // rawRequest
          content = `\n===============================
            context: ${module.context}
            userRequest: ${module.userRequest}
            resource: ${module.resource}
          `;
          if (!module.context.includes('node_modules')) {
            debugger;
          }
          if (/test.scss$/.test(module.resource)) {
            // console.log('\n🔥 module:\n%o\n\n', module);
          }
          // fs.writeFileSync('zz-log.txt', content, {encoding: 'utf-8'});
          // show = false;
          // module.useSourceMap = true;
        }
      )


      false && compilation.hooks.finishModules.tapPromise(
        pluginName,
        (modules) => {
          return new Promise((resolve) => {
            const module = modules.filter(item => /test.scss$/.test(item.resource))[0];
            console.log(module);
            false && modules.forEach(module => {
              if (module.context.includes('node_modules')) {
                return;
              }
              const str = `\n===============================
                context: ${module.context}
                userRequest: ${module.userRequest.split('tensor-frontend-2').pop()}
                resource:    ${module.resource.split('tensor-frontend-2').pop()}
              `;
              console.log(str);
            })
            // console.log('===== finishModules: %d ====\n%o', modules.length, modules[0]);
            // fs.writeFileSync('zz-log.txt', content, {encoding: 'utf-8'});
            resolve();
          });
        }
      );
    });


    // compilation.hooks.processAssets.tap(
      //   {
      //     name: pluginName,
      //
      //     // Using one of the later asset processing stages to ensure
      //     // that all assets were already added to the compilation by other plugins.
      //     stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      //   },
      //   (assets) => {
      //     // "assets" is an object that contains all assets
      //     // in the compilation, the keys of the object are pathnames of the assets
      //     // and the values are file sources.
      //
      //     // Iterating over all the assets and
      //     // generating content for our Markdown file.
      //     const content =
      //       '# In this build:\n\n' +
      //       Object.keys(assets)
      //         .map((filename) => `- ${filename}`)
      //         .join('\n');
      //
      //
      //     fs.writeFileSync(this.options.outputFile, content, {encoding: 'utf-8'});
      //     console.log(`\n======= 输出文件 ==========================`);
      //     // Adding new asset to the compilation, so it would be automatically
      //     // generated by the webpack in the output directory.
      //     // compilation.emitAsset(
      //     //   this.options.outputFile,
      //     //   new RawSource(content)
      //     // );
      //   }
      // );
  };
}

module.exports = FileListPlugin2;