/// <reference path="jsonconst-schema" />
import * as jsonconstSchema from "./jsonconst-schema";
export class GenerateTypescript
{
    public generate(
        schema: jsonconstSchema.ISchema,
        instance: {}
    ): string
    {
        var filecontents = "";
        filecontents = filecontents + this.generateClasses(schema) + "\n";
        filecontents = filecontents + this.generateInstances(schema, instance) + "\n";
        filecontents = filecontents + "    export default " + this.createValueExpresssion(schema, instance) + ";" + "\n";

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
            throw new Error("Cannot generate class for a " + schema.getKind());

        if (schema.getGenerating())
            return;

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

        result = result + "    export abstract class " + this.getTypename(schema) + "\n";
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

        result = result + "        public abstract get " + propname + "(): " + this.getTypename(propSchema) + ";" + "\n";

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
                return "boolean";
            case jsonconstSchema.SchemaKind.integerKind:
                return "number";
            case jsonconstSchema.SchemaKind.numberKind:
                return "number";
            case jsonconstSchema.SchemaKind.stringKind:
                return "string";
            case jsonconstSchema.SchemaKind.arrayKind:
                return this.getTypename(schema.getItems()) + "[]";
            case jsonconstSchema.SchemaKind.objectKind:
                return schema.getClassname();
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
        var result = "    class " + this.getInstanceClassname(schema, instance) + " extends " + schema.getClassname() + "\n";
        result = result + "    {" + "\n";

        for (var propname in instance)
        {
            if (propname === '$schema')
                continue;

            if (propname === '$classname')
                continue;

            var propSchema = schema.getPropertySchema(propname);
            var propValue = instance[propname];

            if (!propSchema)
                continue;

            result = result + "        public get " + propname + "(): " + this.getTypename(propSchema) + "\n";
            result = result + "        {\n";
            result = result + "            return " + this.createValueExpresssion(propSchema, propValue) + ";\n";
            result = result + "        }\n";
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
                result = result + "[";
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
                result = result + "]";
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
        if (!instance["$classname"])
            instance["$classname"] = schema.getClassname() + this._instanceNo++;

        return instance["$classname"];
    }
}
