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

    grunt.registerMultiTask('jsonconst', 'The best Grunt plugin ever.', function ()
    {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            language: 'typescript',
            namespace: 'my.module',
            rootname: 'root',
            punctuation: '.',
            separator: ', '
        });

        var done = this.async();

        var nPendingTasks = this.files.length;
        this.files.forEach(function (f)
        {
            var filepath = path.normalize(f.src);
            try
            {
                new jsonconst.JsonConst().generate(
                    filepath,
                    "typescript",
                    function (err, code)
                    {
                        if (err)
                            grunt.log.writeln(err);

                        if (code)
                            grunt.log.writeln(code);

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