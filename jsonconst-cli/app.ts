#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var http = require('http');
var program = require('commander');
var jsonconst = require("jsonconst");

var _jsonfile = null;
program
    .description('descr')
    .arguments('<jsonfile>')
    .action(function (jsonfile)
    {
        _jsonfile = path.normalize(jsonfile);
    })
    .option('-l, --language <language>', 'The name of the language')
    .action(function (file)
    {
        if (!_jsonfile)
            program.help();
        var language = program["language"];

        //console.log('jsonfile: %s', _jsonfile);
        //console.log('language: %s', language);

        generate(_jsonfile, language);
    })
    .parse(process.argv);

function generate(jsonfile, language)
{
    try
    {
        new jsonconst.JsonConst().generate(
            jsonfile,
            language,
            function (err, code)
            {
                if (code)
                    console.log(code);
                if (err)
                    console.log(err);
            }
        );
    }
    catch (err)
    {
        console.log("err " + JSON.stringify(err));
        //finish = true;
    }

    var finish: boolean = false;
    (function wait()
    {
        if (!finish) setTimeout(wait, 1000);
    })();
}