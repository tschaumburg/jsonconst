namespace dk.schaumburgit.jsonconst
{
    export class ISchema
    {
        type: string;
        items?: ISchema;
        $schema?: string;
        title: string = null;
        description: string = null;
        classname?: string = null;
        generating?: boolean;
        properties?: { [name: string]: ISchema; };
        required?: string[];
    }

    export class Generate
    {
        public generate(
            schema: ISchema,
            instance: {},
            language: string,
            _namespace: string,
            rootName: string
        ): [{ filename: string, contents: string }]
        {
            if (language.toLowerCase() === 'typescript')
            {
                var gen = new GenerateTypescript();
                return gen.generate(schema, instance, _namespace, rootName);
            }

            return null;
        }
    }

    export var generate = new Generate();
}