/*
 * grunt-jsonconst
 * https://github.com/Thomas/grunt-jsonconst
 *
 * Copyright (c) 2016 tschaumburg
 * Licensed under the MIT license.
 */

'use strict';
var jsonconst = require('jsonconst');
var path = require('path');

module.exports = function (grunt)
{
    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('jsonconst', 'Task converting a JSON file into a strongly typed constant in the target language (currently supported: Typescript and C#). Intended for cross-platform config files, but useful for any constant definitions.', function ()
    {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            language: 'typescript',
            namespace: 'my.module',
            rootname: 'root',
        });

        var done = this.async();

        var nPendingTasks = this.files.length;
        this.files.forEach(function (f)
        {
            var ext = 'out';
            if (options.language.toLowerCase() === 'typescript')
                ext = 'ts';
            else if (options.language.toLowerCase() === 'csharp' || options.language.toLowerCase() === 'c#')
                ext = 'cs';

            var jsonpath = path.normalize(f.src);
            try
            {
                var outpath = jsonpath.substr(0, jsonpath.lastIndexOf(".")) + "." + ext;
                new jsonconst.JsonConst().generate(
                    jsonpath,
                    options.language,
                    options.namespace,
                    options.rootname,
                    function (err, code)
                    {
                        if (err)
                            grunt.error.writeln(err);

                        if (code)
                        {
                            //grunt.log.writeln(code);
                            //grunt.log.writeln(outpath);
                            grunt.file.write(outpath, code, { encoding: 'utf8' });
                        }

                        if (--nPendingTasks == 0)
                            done();
                    }
                );
            }
            catch (err)
            {
                grunt.log.writeln("err " + JSON.stringify(err));
                if (--nPendingTasks == 0)
                    done();
            }
        });

    });
}