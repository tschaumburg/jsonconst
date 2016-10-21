/// <reference path="jsonconst-schema" />
/// <reference path="jsonconst-typescript" />
import * as schema from "./jsonconst-schema";
import * as typescript from "./jsonconst-typescript";
import * as csharp from "./jsonconst-csharp";
var $RefParser = require('json-schema-ref-parser');
var fs = require('fs');
const url = require('url');
const path = require('path');

/**
 * 
 */
export class JsonConst
{
    public xx = 5;
    /**
     * Resolves a JSON reference and loads the referenced JSON
     * @param jsonPointer The reference string being resolved.
     * @param baseUrl
     * @param callback
     */
    public resolveJsonPointer(jsonPointer: string, baseUrl: string, callback: (err, result) => void): void
    {
        try
        {
            jsonPointer = jsonPointer.replace(/\?reload$/, ""); // basename

            var reference = { $ref: jsonPointer };
            var options = {};
            $RefParser.dereference(
                baseUrl,
                reference,
                options,
                function (err, resolvedReference)
                {
                    callback(err, resolvedReference);
                }
            );
        }
        catch (err)
        {
            callback(err, null);
        }
    }

    private getJSON(jsonUrl: string)
    {
        var _url = url.parse(jsonUrl);

        if (!url.protocol)
            return JSON.parse(fs.readFileSync(jsonUrl, 'utf8'));
        else if (url.protocol === 'file:')
            return JSON.parse(fs.readFileSync(_url.path, 'utf8'));

        throw new Error("Cannot read JSON file " + jsonUrl);
    }

    private getBasename(jsonUrl: string): string
    {
        var _url = url.parse(jsonUrl); // file://path/basename.extension
        var _path = _url.path; // /path/basename.extension
        var _filename: string = path.basename(_path); // basename.extension
        var _basename = _filename.replace(/\.[^/.]+$/, ""); // basename

        return _basename;
    }

    public generate(
        //jsonInstance: {},
        //baseUrl: string,
        jsonUrl: string,
        language: string,
        _namespace: string,
        rootName: string,
        callback: (err, code: string) => void
    ): void
    {
        try
        {
            var jsonInstance = this.getJSON(jsonUrl);
            var basename = this.getBasename(jsonUrl);
            var baseUrl = jsonUrl;

            var schemaRef = jsonInstance['$schema'] as string;
            if (!schemaRef)
            {
                this.doGenerate(jsonInstance, null, language, _namespace, rootName, callback);
            }
            else
            {
                var self = this;
                this.resolveJsonPointer(
                    schemaRef,
                    baseUrl,
                    (err, schema) =>
                    {
                        if (err)
                            callback(err, null);
                        else
                            self.doGenerate(jsonInstance, schema, language, _namespace, rootName, callback);
                    }
                );
            }
        }
        catch (err)
        {
            callback(err, null);
        }
    }

    doGenerate(
        jsonInstance: {},
        jsonSchema: {},
        language: string,
        _namespace: string,
        rootName: string,
        callback: (err, code: string) => void
    ): void
    {
        var mgr = schema.manager;
        mgr.getSchemaInfo(
            jsonSchema,
            function (err, dereferencedSchema: schema.ISchema)
            {
                if (!dereferencedSchema)
                {
                    console.warn(
                        "WARNING: The JSON file is not associated with a JSON schema. " +
                        "Using a schema gives many advantages (stronger typing, Intellisense support and more).\n" +
                        "An seed schema can be generated using one of the many online JSON schema generators\n" +
                        "The JSON file is associated with its schema by setting the $schema property.\n" +
                        ""
                    );
                }

                try
                {
                    if (err)
                    {
                        callback(err, null);
                    }
                    else if (language.toLowerCase() === 'typescript')
                    {
                        var tsgen = new typescript.GenerateTypescript();
                        var code = tsgen.generate(dereferencedSchema, jsonInstance, _namespace);
                        callback(null, code);
                    }
                    else if (language.toLowerCase() === 'csharp' || language.toLowerCase() === 'c#')
                    {
                        var csgen = new csharp.GenerateCSharp();
                        var code = csgen.generate(dereferencedSchema, jsonInstance, _namespace, rootName);
                        callback(null, code);
                    }
                    else
                    {
                        callback("Unsupported language " + language, null);
                    }
                }
                catch (err)
                {
                    callback("" + err, null);
                }
            }
        );

        return null;
    }
}
var jsonconst: JsonConst = new JsonConst();
const tmp: number = 4;
export default jsonconst;

