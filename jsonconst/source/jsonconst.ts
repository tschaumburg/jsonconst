/// <reference path="jsonconst-schema" />
/// <reference path="jsonconst-typescript" />
import * as schema from "./jsonconst-schema";
import * as typescript from "./jsonconst-typescript";
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
        //basename: string,
        callback: (err, code: string) => void
    ): void
    {
        var jsonInstance = this.getJSON(jsonUrl);
        var basename = this.getBasename(jsonUrl);
        var baseUrl = jsonUrl;

        var schemaRef = jsonInstance['$schema'] as string;
        if (!schemaRef)
        {
            this.doGenerate(jsonInstance, null, language, callback);
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
                        self.doGenerate(jsonInstance, schema, language, callback);
                }
            );
        }
    }

    doGenerate(
        jsonInstance: {},
        jsonSchema: {},
        language: string,
        //basename: string,
        callback: (err, code: string) => void
    ): void
    {
        var mgr = schema.manager;
        mgr.getSchemaInfo(
            jsonSchema,
            function (err, dereferencedSchema: schema.ISchema)
            {
                try
                {
                    if (err)
                    {
                        callback(err, null);
                    }
                    else if (language.toLowerCase() === 'typescript')
                    {
                        var gen = new typescript.GenerateTypescript();
                        var code = gen.generate(dereferencedSchema, jsonInstance);
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

