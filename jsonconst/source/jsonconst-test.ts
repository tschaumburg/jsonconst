/// <reference path="jsonconst" />
import jsonconst from "./jsonconst";

console.log('Hello world');

jsonconst.resolveJsonPointer(
    "./jsonconst/source/testdata/referenced2.json#",
    ".",
    (err, json) =>
    {
        var tmp = json;
    }
);

jsonconst.generate(
    "./source/testdata/testValues.json",
    "typescript",
    (err, code: string) =>
    {
        console.log(code);
    }
);

var finish: boolean = false;
(function wait()
{
    if (!finish) setTimeout(wait, 1000);
})();