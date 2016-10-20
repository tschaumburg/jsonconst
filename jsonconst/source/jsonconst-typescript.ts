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
        filecontents = filecontents + "{\n";
        filecontents = filecontents + this.generateClass(schema) + "\n";
        filecontents = filecontents + this.generateInstance(schema, instance, "Root") + "\n";
        filecontents = filecontents + "    export var root = new Root();" + "\n";

        return filecontents;
    }

    private schemas: jsonconstSchema.ISchema[] = [];
    private generateClass(schema: jsonconstSchema.ISchema): string
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

        for (var n = 0; n < this.schemas.length; n++)
        {
            result = result + this.generateClass(this.schemas[n]);
        }

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

        switch (propSchema.getKind())
        {
            case jsonconstSchema.SchemaKind.arrayKind:
                result = result + "        public abstract get " + propname + "(): " + this.getTypename(propSchema) + "[];" + "\n";
                this.schemas.push(propSchema.getItems());
                break;
            case jsonconstSchema.SchemaKind.objectKind:
                result = result + "        public abstract get " + propname + "(): " + this.getTypename(propSchema) + ";" + "\n";
                this.schemas.push(propSchema);
                break;
            default:
                result = result + "        public abstract get " + propname + "(): " + this.getTypename(propSchema) + ";" + "\n";
                break;
        }

        return result;
    }

    private getTypename(schema: jsonconstSchema.ISchema)
    {
        var typeKind = schema.getKind();

        if (typeKind == jsonconstSchema.SchemaKind.stringKind)
        {
            return "string";
        }

        if (typeKind == jsonconstSchema.SchemaKind.arrayKind)
        {
            return this.getTypename(schema.getItems());
        }

        if (typeKind == jsonconstSchema.SchemaKind.objectKind)
        {
            return schema.getClassname();
        }

        return "<unknown>";
    }

    private _instanceNo = 1;
    private uniqueInstanceClassName(schema: jsonconstSchema.ISchema): string
    {
        return schema.getClassname() + this._instanceNo++;
    }

    private generateInstance(schema: jsonconstSchema.ISchema, instance: any, classname: string): string
    {
        var result = "    class " + classname + " extends " + this.getTypename(schema) + "\n";
        result = result + "    {" + "\n";

        var instances: { name: string, schema: jsonconstSchema.ISchema, value: any }[] = [];
        for (var propname in instance)
        {
            if (propname === '$schema')
                continue;

            var propSchema = schema.getPropertySchema(propname);
            var propValue = instance[propname];

            if (!propSchema)
                continue;

            if (propSchema.getKind() == jsonconstSchema.SchemaKind.arrayKind)
            {
                result = result + "        public get " + propname + "(): " + this.getTypename(propSchema) + "[] { return [" + "\n";
                var arr: any[] = propValue as any[];
                var itemSchema = propSchema.getItems();
                if (arr && itemSchema)
                {
                    for (var m = 0; m < arr.length; m++)
                    {
                        var propertyClassName: string = this.uniqueInstanceClassName(itemSchema);
                        result = result + "            new " + propertyClassName + "()," + "\n";
                        instances.push({ name: propertyClassName, schema: itemSchema, value: arr[m] });
                    }
                }
                result = result + "        ];}" + "\n";
            }
            else if (propSchema.getKind() === jsonconstSchema.SchemaKind.objectKind)
            {
                var propertyClassName: string = this.uniqueInstanceClassName(propSchema);
                result = result + "        public get " + propname + "(): " + this.getTypename(propSchema) + "\n";
                result = result + "        {\n";
                result = result + "            return new " + propertyClassName + "();\n";
                result = result + "        }\n";

                instances.push({ name: propertyClassName, schema: propSchema, value: propValue });
            }
            else if (propSchema.getKind() === jsonconstSchema.SchemaKind.stringKind)
            {
                result = result + "        public get " + propname + "(): " + this.getTypename(propSchema) + "\n";
                result = result + "        {\n";
                result = result + "            return '" + propValue + "';\n";
                result = result + "        }\n";
            }
            else
            {
            }
        }

        result = result + "    }" + "\n";
        result = result + "" + "\n";

        for (var n = 0; n < instances.length; n++)
        {
            result = result + this.generateInstance(instances[n].schema, instances[n].value, instances[n].name);
        }

        return result;
    }
}
