namespace dk.schaumburgit.jsonconst
{
    export class GenerateTypescript
    {
        public generate(
            schema: ISchema,
            instance: {},
            _namespace: string,
            rootName: string
        ): [{ filename: string, contents: string }]
        {
            var filename = _namespace + ".ts";
            var filecontents = "namespace " + _namespace + "\n";
            filecontents = filecontents + "{\n";
            filecontents = filecontents + this.generateClass(schema) + "\n";
            filecontents = filecontents + this.generateInstance(schema, instance, "Root") + "\n";
            filecontents = filecontents + "    export var " + rootName + " = new Root();" + "\n";
            filecontents = filecontents + "}" + "\n";

            return [{ filename: filename, contents: filecontents }];
        }

        private generateClass(schema: ISchema): string
        {
            if (schema.type !== "object")
                throw new Error("Cannot generate class for a " + schema.type);

            if (schema.generating)
                return;

            schema.generating = true;

            var result = "    export abstract class " + this.getTypename(schema) + "\n";
            result = result + "    {" + "\n";

            var schemas: ISchema[] = [];
            for (var propname in schema.properties)
            {
                var propSchema = schema.properties[propname];

                if (propSchema.type === "array")
                {
                    result = result + "        public abstract get " + propname + "(): " + this.getTypename(propSchema) + "[];" + "\n";
                    schemas.push(propSchema.items);
                }
                else if (propSchema.type === "object")
                {
                    result = result + "        public abstract get " + propname + "(): " + this.getTypename(propSchema) + ";" + "\n";
                    schemas.push(propSchema);
                }
                else
                {
                    result = result + "        public abstract get " + propname + "(): " + this.getTypename(propSchema) + ";" + "\n";
                }
            }

            result = result + "    }" + "\n";
            result = result + "" + "\n";

            for (var n = 0; n < schemas.length; n++)
            {
                result = result + this.generateClass(schemas[n]);
            }

            return result;
        }

        private getTypename(schema: ISchema)
        {
            var typeKind = schema.type;

            if (typeKind === "string")
            {
                return "string";
            }

            if (typeKind === "array")
            {
                return this.getTypename(schema.items);
            }

            if (typeKind === "object")
            {
                if (!schema.classname)
                    schema.classname = this.uniqueClassName();

                return schema.classname;
            }

            return "<unknown>";
        }

        private _classNo = 1;
        private uniqueClassName(): string
        {
            return "Class" + this._classNo++;
        }

        private _instanceNo = 1;
        private uniqueInstanceClassName(schema: ISchema): string
        {
            return schema.classname + this._instanceNo++;
        }

        private generateInstance(schema: ISchema, instance: any, classname: string): string
        {
            var result = "    class " + classname + " extends " + this.getTypename(schema) + "\n";
            result = result + "    {" + "\n";

            var instances: { name: string, schema: ISchema, value: any }[] = [];
            for (var propname in instance)
            {
                var propSchema = schema.properties[propname];
                var propValue = instance[propname];

                if (!propSchema)
                    continue;

                if (propSchema.type === "array")
                {
                    result = result + "        public get " + propname + "(): " + this.getTypename(propSchema) + "[] { return [" + "\n";
                    var arr: any[] = propValue as any[];
                    var itemSchema = propSchema.items;
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
                else if (propSchema.type === "object")
                {
                    var propertyClassName: string = this.uniqueInstanceClassName(propSchema);
                    result = result + "        public get " + propname + "(): " + this.getTypename(propSchema) + "\n";
                    result = result + "        {\n";
                    result = result + "            return new " + propertyClassName + "();\n";
                    result = result + "        }\n";

                    instances.push({ name: propertyClassName, schema: propSchema, value: propValue });
                }
                else if (propSchema.type === "string")
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
}