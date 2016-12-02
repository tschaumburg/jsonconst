/// <reference path="jsonconst-schema" />
import * as jsonconstSchema from "./jsonconst-schema";
export class GenerateTypescript
{
    public generate(
        schema: jsonconstSchema.ISchema,
        instance: {},
        _namespace: string,
        rootName: string
    ): string
    {
        var filecontents = "";
        var useExport = false;
        rootName = rootName || "root";
        if (_namespace && _namespace.length > 0)
        {
            filecontents = filecontents + "namespace " + _namespace + "\n";
            filecontents = filecontents + "{" + "\n";
            useExport = true;
        }
        filecontents = filecontents + this.generateClasses(schema, useExport) + "\n";
        filecontents = filecontents + this.generateInstances(schema, instance) + "\n";
        filecontents = filecontents + "    " + (useExport ? "export " : "") + "const " + rootName + ": " + this.getTypename(schema, instance) + " = " + this.createValueExpresssion(schema, instance) + ";" + "\n";
        if (_namespace && _namespace.length > 0)
        {
            filecontents = filecontents + "}" + "\n";
            //filecontents = filecontents + "export default " + _namespace + "." + rootName + ";" + "\n";
        }

        return filecontents;
    }

    private generateClasses(rootSchema: jsonconstSchema.ISchema, useExport: boolean): string
    {
        this.schemas.push(rootSchema);

        var result = "";
        while (this.schemas.length > 0)
        {
            var nextSchema = this.schemas.shift();
            result = result + this._generateClass(nextSchema, useExport);
        }

        return result;
    }

    private schemas: jsonconstSchema.ISchema[] = [];
    private _generateClass(schema: jsonconstSchema.ISchema, useExport: boolean): string
    {
        var result = "";

        if (schema.getKind() != jsonconstSchema.SchemaKind.objectKind)
            return "";

        if (schema.getGenerating())
            return "";

        schema.setGenerating(true);

        // JSDOC:
        var title = schema.getTitle();
        var description = schema.getDescription();
        result = result + "    /**" + "\n";
        if (title)
            result = result + "     * " + title + ":\n";
        if (description)
            result = result + "     * " + description + "\n";
        result = result + "     */" + "\n";

        var _export = useExport ? "export " : "";
        result = result + "    " + _export + "abstract class " + this.getTypename(schema, null) + "\n";
        result = result + "    {" + "\n";

        var propertyNames = schema.getPropertyNames();
        for (var n = 0; n < propertyNames.length; n++ )
        {
            var propname = propertyNames[n];

            if (propname === '$schema')
                continue;

            var propSchema = schema.getPropertySchema(propname);

            if (!propSchema)
                continue;

            result = result + this.declareProperty(propname, propSchema, propSchema.getTitle(), propSchema.getDescription());
        }

        result = result + "    }" + "\n";
        result = result + "" + "\n";

        return result;
    }

    private declareProperty(propname: string, propSchema: jsonconstSchema.ISchema, title: string, description: string): string
    {
        var result = "";

        // JSDOC:
        result = result + "        /**" + "\n";
        if (title)
            result = result + "         * " + title + ":\n";
        if (description)
            result = result + "         * " + description + "\n";
        result = result + "         */" + "\n";

        result = result + "        public abstract get " + propname + "(): " + this.getTypename(propSchema, null) + ";" + "\n";

        // remember to generate code for referenced typess:
        switch (propSchema.getKind())
        {
            case jsonconstSchema.SchemaKind.arrayKind:
                this.schemas.push(propSchema.getItems());
                break;
            case jsonconstSchema.SchemaKind.objectKind:
                this.schemas.push(propSchema);
                break;
        }

        return result;
    }

    private getTypename(schema: jsonconstSchema.ISchema, instance: any)
    {
        if (schema)
        {
            switch (schema.getKind())
            {
                case jsonconstSchema.SchemaKind.booleanKind:
                    return "boolean";
                case jsonconstSchema.SchemaKind.integerKind:
                    return "number";
                case jsonconstSchema.SchemaKind.numberKind:
                    return "number";
                case jsonconstSchema.SchemaKind.stringKind:
                    return "string";
                case jsonconstSchema.SchemaKind.arrayKind:
                    return this.getTypename(schema.getItems(), null) + "[]";
                case jsonconstSchema.SchemaKind.objectKind:
                    return schema.getInterfaceName();
                default:
                    return "<unknown1>";
            }
        }

        if (instance)
        {
            var instanceKind = typeof instance;

            if (instanceKind === 'number')
                return 'number';

            if (instanceKind === 'string')
                return 'string';

            if (instanceKind === 'boolean')
                return 'boolean';

            if (instanceKind === 'array')
            {
                var memberKind = 'any';
                var arr = instance as any[];
                if (arr && arr.length > 0 && arr[0])
                    memberKind = this.getTypename(null, arr[0]);
                return memberKind + '[]';
            }

            if (instanceKind === 'object')
                return 'object';

            return "<unknown2>";
        }

        return "<unknown3>";
    }

    private generateInstances(rootSchema: jsonconstSchema.ISchema, rootInstance: any): string
    {
        this.instances.push({ schema: rootSchema, value: rootInstance });

        var result = "";
        while (this.instances.length > 0)
        {
            var nextInstance = this.instances.shift();
            result = result + this._generateInstance(nextInstance.schema, nextInstance.value);
        }

        return result;
    }

    private instances: { schema: jsonconstSchema.ISchema, value: any }[] = [];
    private _generateInstance(schema: jsonconstSchema.ISchema, instance: any): string
    {
        var result = "    class " + this.getInstanceClassname(schema, instance) + " extends " + schema.getInterfaceName() + "\n";
        result = result + "    {" + "\n";

        var schemaPropertyNames = schema.getPropertyNames();
        var instancePropertyNames = Object.keys(instance);
        var undeclaredPropertyNames = instancePropertyNames.filter(item => schemaPropertyNames.indexOf(item) < 0);
        var allPropertyNames = schemaPropertyNames.concat(undeclaredPropertyNames);

        for (var n = 0; n < allPropertyNames.length; n++)
        {
            var propname = allPropertyNames[n];

            if (propname === '$schema')
                continue;

            if (propname === '$class')
                continue;

            var propSchema = schema.getPropertySchema(propname);
            var propValue = instance[propname];

            //if (!propSchema)
            //    continue;

            result = result + "        public get " + propname + "(): " + this.getTypename(propSchema, propValue) + "\n";
            result = result + "        {\n";
            result = result + "            return " + this.createValueExpresssion(propSchema, propValue) + ";\n";
            result = result + "        }\n";
            // speculative: intercept and reject attempts to set using Javascripts
            //    obj['propname'] = 1234
            result = result + "        public set " + propname + "(value: " + this.getTypename(propSchema, propValue) + ")\n";
            result = result + "        {\n";
            result = result + "            throw new Error('Illegally trying to set JSonConst generated const property " + propname + "');\n";
            result = result + "        }\n";
        }

        result = result + "    }" + "\n";
        result = result + "" + "\n";

        return result;
    }

    private createValueExpresssion(schema: jsonconstSchema.ISchema, instance: any): string
    {
        if (schema)
        {
            switch (schema.getKind())
            {
                case jsonconstSchema.SchemaKind.arrayKind:
                    if (!instance)
                        return "null";
                    var result = "";
                    result = result + "[";
                    var memberInstances1 = instance;
                    var memberSchema = schema.getItems();
                    if (memberInstances1 && memberSchema)
                    {
                        for (var m = 0; m < memberInstances1.length; m++)
                        {
                            result = result + this.createValueExpresssion(memberSchema, memberInstances1[m]) + ", ";
                        }
                    }
                    result = result + "]";
                    return result;
                case jsonconstSchema.SchemaKind.objectKind:
                    if (!instance)
                        return "null";
                    this.instances.push({ schema: schema, value: instance });
                    return "new " + this.getInstanceClassname(schema, instance) + "()";
                case jsonconstSchema.SchemaKind.booleanKind:
                    return (instance ? "true" : "false");
                case jsonconstSchema.SchemaKind.numberKind:
                    if (!instance)
                        return "0";
                    return instance;
                case jsonconstSchema.SchemaKind.integerKind:
                    if (!instance)
                        return "0";
                    return instance;
                case jsonconstSchema.SchemaKind.stringKind:
                    if (!instance)
                        return "null";
                    return '"' + instance + '"';
                default:
                    return "unsupported value";
            }
        }

        if (instance)
        {
            var instanceKind = typeof instance;

            if (instanceKind === 'number')
                return '' + (instance as number);

            if (instanceKind === 'string')
                return '"' + (instance as string) + '"';

            if (instanceKind === 'boolean')
                return (instance as boolean) ? 'true' : 'false';

            if (instanceKind === 'array')
            {
                var result = "";
                result = result + "[";
                var memberInstances: any[] = instance as any[];
                if (memberInstances)
                {
                    for (var m = 0; m < memberInstances.length; m++)
                    {
                        result = result + this.createValueExpresssion(null, memberInstances[m]) + ", ";
                    }
                }
                result = result + "]";
                return result;
            }

            if (instanceKind === 'object')
            {
                var result = "";
                result = result + "{";

                var obj = instance as Object;
                var propertyNames = Object.keys(instance);
                for (var m = 0; m < propertyNames.length; m++)
                {
                    var propName = propertyNames[m];
                        result = result + propName + ": " + this.createValueExpresssion(null, obj[propName]) + ", ";
                }

                result = result + "}";
                return result;
            }

            return "null";
        }
    }

    private _instanceNo = 1;
    private getInstanceClassname(schema: jsonconstSchema.ISchema, instance: Object): string
    {
        if (!instance["$class"])
            instance["$class"] = schema.getInterfaceName() + "_Impl" + this._instanceNo++;

        return instance["$class"];
    }
}
