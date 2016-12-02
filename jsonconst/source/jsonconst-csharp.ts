/// <reference path="jsonconst-schema" />
import * as jsonconstSchema from "./jsonconst-schema";
export class GenerateCSharp
{
    public generate(
        schema: jsonconstSchema.ISchema,
        instance: {},
        _namespace: string,
        rootName: string
    ): string
    {
        var filecontents = "";
        if (_namespace)
        {
            filecontents = filecontents + "namespace " + _namespace + "\n";
            filecontents = filecontents + "{" + "\n";
        }

        filecontents = filecontents + this.generateClasses(schema) + "\n";
        filecontents = filecontents + this.generateInstances(schema, instance) + "\n";

        //rootName = rootName || "root";
        //filecontents = filecontents + "    public const " + this.getTypename(schema) + " " + rootName + " = " + this.createValueExpresssion(schema, instance) + ";" + "\n";

        rootName = rootName || "JsonConst.Current";
        var constClass = "JsonConst";
        var constMember = "Current";
        if (rootName)
        {
            [constClass, constMember] = rootName.split('.', 2);
        }

        filecontents =
            filecontents
            + "    public static class " + constClass + "\n"
            + "    {" + "\n"
            + "        public readonly static " + this.getTypename(schema) + " " + constMember + " = " + this.createValueExpresssion(schema, instance) + ";" + "\n"
            + "    }" + "\n";

        if (_namespace)
        {
            filecontents = filecontents + "}" + "\n";
        }

        return filecontents;
    }

    private generateClasses(rootSchema: jsonconstSchema.ISchema): string
    {
        this.schemas.push(rootSchema);

        var result = "";
        while (this.schemas.length > 0)
        {
            var nextSchema = this.schemas.shift();
            result = result + this._generateClass(nextSchema);
        }

        return result;
    }

    private schemas: jsonconstSchema.ISchema[] = [];
    private _generateClass(schema: jsonconstSchema.ISchema): string
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
        result = result + "    /// <summary>" + "\n";
        if (title)
            result = result + "    /// " + title + ":\n";
        if (description)
            result = result + "    /// " + description + "\n";
        result = result + "    /// </summary>" + "\n";

        result = result + "    public interface " + this.getTypename(schema) + "\n";
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
        result = result + "        /// <summary>" + "\n";
        if (title)
            result = result + "        /// " + title + ":\n";
        if (description)
            result = result + "        /// " + description + "\n";
        result = result + "        /// </summary>" + "\n";

        result = result + "        " + this.getTypename(propSchema) + " " + propname + " { get; } " + "\n";

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

    private getTypename(schema: jsonconstSchema.ISchema)
    {
        switch (schema.getKind())
        {
            case jsonconstSchema.SchemaKind.booleanKind:
                return "bool";
            case jsonconstSchema.SchemaKind.integerKind:
                return "int";
            case jsonconstSchema.SchemaKind.numberKind:
                return "double";
            case jsonconstSchema.SchemaKind.stringKind:
                return "string";
            case jsonconstSchema.SchemaKind.arrayKind:
                return this.getTypename(schema.getItems()) + "[]";
            case jsonconstSchema.SchemaKind.objectKind:
                return schema.getInterfaceName();
            default:
                return "<unknown>";
        }
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
        var baseclass = schema.getBaseclassName();
        var baseclassTerm = "";
        if (!!baseclass)
            baseclassTerm = baseclass + ", ";

        var result = "    class " + this.getInstanceClassname(schema, instance) + ": " + baseclassTerm + schema.getInterfaceName() + "\n";
        result = result + "    {" + "\n";

        for (var propname in instance)
        {
            if (propname === '$schema')
                continue;

            if (propname === '$class')
                continue;

            var propSchema = schema.getPropertySchema(propname);
            var propValue = instance[propname];
            var overrideTerm = schema.isPropertyOverride(propname) ? "override " : "";

            if (!propSchema)
                continue;

            result = result + "        public " + overrideTerm + this.getTypename(propSchema) + " " + propname + "\n";
            result = result + "        {\n";
            result = result + "            get\n";
            result = result + "            {\n";
            result = result + "                return " + this.createValueExpresssion(propSchema, propValue) + ";\n";
            result = result + "            }\n";
            result = result + "        }\n";
            result = result + "        \n";
        }

        result = result + "    }" + "\n";
        result = result + "" + "\n";

        return result;
    }

    private createValueExpresssion(schema: jsonconstSchema.ISchema, instance: any): string
    {
        var result = "";

        switch (schema.getKind())
        {
            case jsonconstSchema.SchemaKind.arrayKind:
                result = result + "new " + this.getTypename(schema) + " { ";
                var memberInstances: any[] = instance as any[];
                var memberSchema = schema.getItems();
                if (memberInstances && memberSchema)
                {
                    for (var m = 0; m < memberInstances.length; m++)
                    {
                        result = result + this.createValueExpresssion(memberSchema, memberInstances[m]) + ", ";
                        //this.instances.push({ schema: memberSchema, value: memberInstances[m] });
                    }
                }
                result = result + "}";
                return result;
            case jsonconstSchema.SchemaKind.objectKind:
                this.instances.push({ schema: schema, value: instance });
                return "new " + this.getInstanceClassname(schema, instance) + "()";
            case jsonconstSchema.SchemaKind.booleanKind:
                return (instance ? "true" : "false");
            case jsonconstSchema.SchemaKind.numberKind:
                return instance;
            case jsonconstSchema.SchemaKind.integerKind:
                return instance;
            case jsonconstSchema.SchemaKind.stringKind:
                return '"' + instance + '"';
            default:
                return "unsupported value";
        }
    }

    private _instanceNo = 1;
    private getInstanceClassname(schema: jsonconstSchema.ISchema, instance: Object): string
    {
        //if (!instance["$class"])
        //    instance["$class"] = schema.getInterfaceName() + this._instanceNo++;

        //return instance["$class"];
        return schema.getClassName(instance);
    }
}
