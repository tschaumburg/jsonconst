/*
 * grunt-jsonconst
 * https://github.com/Thomas/grunt-jsonconst
 *
 * Copyright (c) 2016 tschaumburg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt)
{

    var jsonconst = require('jsonconst');
    //var jsonconst = require("./jsonconst");
    grunt.log.writeln("jsonconst = " + JSON.stringify(jsonconst));

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('jsonconst', 'The best Grunt plugin ever.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      language: 'typescript',
      namespace: 'my.module',
      rootname: 'root',
      punctuation: '.',
      separator: ', '
    });

    // Iterate over all specified file groups.
    this.filesSrc.filter(function (filepath)
    {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath))
        {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
        } else
        {
            return true;
        }
    }).forEach(function (filepath)
    {
        var json = grunt.file.read(filepath);
        var generator = new jsonconst.Generate();
        var typescript =
            generator.generate(
                json,
                options.language,
                options.namespace,
                options.rootname
            );

        for (var n = 0; n < typescript.length; n++)
        {
            grunt.file.write(typescript[n].filename, typescript[n].contents);
            grunt.log.writeln('File "' + typescript[n].filename + '" created.');
        }
    });
  });

};
