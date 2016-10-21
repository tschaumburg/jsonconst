#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var http = require('http');
var program = require('commander');
var jsonconst = require("jsonconst");
var _jsonfile = null;
program
    .description('Converts a JSON file into a strongly typed constant in the target language (currently supported: Typescript and C#)')
    .arguments('<jsonfile>')
    .action(function (jsonfile) {
    _jsonfile = path.normalize(jsonfile);
})
    .option('-l, --language <language>', 'The target language (currently supported: typescript, csharp')
    .option('-n, --namespace <namespace>', 'The namespace to encapsulate the generated code in (if applicable for the target language)')
    .option('-r, --root <root>', 'The name of the root const (if applicable for the target language)')
    .action(function (file) {
    if (!_jsonfile)
        program.help();
    var language = program["language"];
    var namespace = program["namespace"];
    var rootName = program["root"];
    //console.log('jsonfile: %s', _jsonfile);
    //console.log('language: %s', language);
    generate(_jsonfile, language, namespace, rootName);
})
    .parse(process.argv);
function generate(jsonfile, language, namespace, rootName) {
    try {
        new jsonconst.JsonConst().generate(jsonfile, language, namespace, rootName, function (err, code) {
            if (code)
                console.log(code);
            if (err)
                console.log(err);
        });
    }
    catch (err) {
        console.log("err " + JSON.stringify(err));
    }
    var finish = false;
    (function wait() {
        if (!finish)
            setTimeout(wait, 1000);
    })();
}
//# sourceMappingURL=app.js.map