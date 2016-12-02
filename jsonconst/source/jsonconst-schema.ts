export enum SchemaKind
{
    unsupportedKind,
    booleanKind,
    integerKind,
    numberKind,
    stringKind,
    nullKind,
    arrayKind,
    objectKind,
}

export interface ISchema
{
    getTitle(): string;
    getDescription(): string;
    getKind(): SchemaKind;
    getPropertyNames(): string[];
    getPropertySchema(propertyName: string): ISchema;
    isPropertyOverride(propertyName: string): boolean;
    getItems(): ISchema;

    getInterfaceName(): string;
    getClassName(jsonInstance: {}): string;
    getBaseclassName(): string;
    getGenerating() : boolean;
    setGenerating(value: boolean);
}

export interface ISchemaManager
{
    getSchemaInfo(schema: Object, callback: (err, schemainfo: ISchema) => void): void;
}


class Schema implements ISchema
{
    constructor(private _verbatim: JSONSchema)
    {
    }

    public getTitle(): string
    {
        return this._verbatim.title;
    };

    public getDescription(): string
    {
        return this._verbatim.description;
    };

    public getKind(): SchemaKind
    {
        if (this._verbatim.type === "string")
            return SchemaKind.stringKind;
        else if (this._verbatim.type === "boolean")
            return SchemaKind.booleanKind;
        else if (this._verbatim.type === "integer")
            return SchemaKind.integerKind;
        else if (this._verbatim.type === "number")
            return SchemaKind.numberKind;
        else if (this._verbatim.type === "null")
            return SchemaKind.nullKind;
        else if (this._verbatim.type === "array")
            return SchemaKind.arrayKind;
        else if (this._verbatim.type === "object")
            return SchemaKind.objectKind;
        else 
            return SchemaKind.unsupportedKind;
    };

    public getPropertyNames(): string[]
    {
        if (!this._verbatim.properties)
            return [];

        return Object.keys(this._verbatim.properties);
    };

    public getPropertySchema(propertyName: string): ISchema
    {
        if (!this._verbatim.properties)
            return null;

        var jsonSchema = this._verbatim.properties[propertyName];
        if (!jsonSchema)
            return null;

        return new Schema(jsonSchema);
    }

    public isPropertyOverride(propertyName: string): boolean
    {
        if (!this._verbatim.properties)
            return false;

        var jsonSchema = this._verbatim.properties[propertyName];
        if (!jsonSchema)
            return false;

        return !!(jsonSchema.$override);
    }

    public getItems(): ISchema
    {
        if (!this._verbatim.items)
            return null;

        return new Schema(this._verbatim.items);
    };

    public getInterfaceName(): string
    {
        if (this.getKind() !== SchemaKind.objectKind)
            return "unknown";

        if (!this._verbatim.$interface)
            this._verbatim.$interface = Schema.uniqueClassName();

        return this._verbatim.$interface;
    }

    public getClassName(jsonInstance: {}): string
    {
        if (this.getKind() !== SchemaKind.objectKind)
            return "unknown";

        if (!this._verbatim.$class)
            this._verbatim.$class = Schema.uniqueClassName();

        return this.expandTemplate(this._verbatim.$class, jsonInstance);
    }

    public getBaseclassName(): string
    {
        if (this.getKind() !== SchemaKind.objectKind)
            return null;

        return this._verbatim.$baseclass;
    }

    private expandTemplate(template: string, values: Object): string
    {
        return template.replace("{claimName}", values["claimName"]);
    }

    private static _classNo = 1;
    private static uniqueClassName(): string
    {
        return "Class" + Schema._classNo++;
    }

    private static _generating: JSONSchema[] = [];
    public getGenerating(): boolean
    {
        return (Schema._generating.indexOf(this._verbatim) > -1);
    }
    public setGenerating()
    {
        Schema._generating.push(this._verbatim);
    }
}

//parser.$refs._root$Ref.path
var $RefParser = require('json-schema-ref-parser');
const commentedJsonParser = require('./commented-json-parser');
class SchemaManager implements ISchemaManager
{
    public getSchemaInfo(dereferencedSchema: Object, callback: (err, schemainfo: ISchema) => void): void
    {
        if (!dereferencedSchema)
            return callback(null, null);

        var jsonSchema = dereferencedSchema as JSONSchema;

        if (!jsonSchema)
            callback("Malformed schema: " + JSON.stringify(dereferencedSchema), null);

        callback(null, new Schema(jsonSchema));

        return;

        //var options = {
        //    parse: {
        //        json: commentedJsonParser
        //    }
        //};
        //$RefParser.dereference(dereferencedSchema, options, function (err, dereferencedSchema2)
        //{
        //    if (err)
        //    {
        //        callback(err, null);
        //    }
        //    else
        //    {
        //        var jsonSchema = dereferencedSchema2 as JSONSchema;

        //        if (!jsonSchema)
        //            callback("Malformed schema: " + JSON.stringify(dereferencedSchema), null);

        //        callback(null, new Schema(jsonSchema));
        //    }
        //});
    }
}

class JSONSchema
{
    public type: string;
    public items?: JSONSchema;
    public title: string = null;
    public description: string = null;
    //public classname?: string = null;
    //public generating?: boolean;
    public properties?: { [name: string]: JSONSchema; };
    public $schema?: string;
    public $class?: string;
    public $interface?: string;
    public $baseclass?: string;
    public $override?: boolean;
    public required?: string[];
}

var manager: ISchemaManager = new SchemaManager();
export { manager };

var testSchema: JSONSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "title": "Root schema.",
    "description": "An explanation about the purpose of this instance.",
    "properties": {
        "name": {
            "type": "string",
            "title": "Name schema.",
            "description": "An explanation about the purpose of this instance."
        },
        "images": {
            "type": "array",
            "title": "Images schema.",
            "description": "An explanation about the purpose of this instance.",
            "items": {
                "$class": "ImageMetaData",
                "type": "object",
                "title": "0 schema.",
                "description": "An explanation about the purpose of this instance.",
                "properties": {
                    "date": {
                        "type": "string",
                        "title": "Date schema.",
                        "description": "An explanation about the purpose of this instance."
                    },
                    "photographer": {
                        "type": "string",
                        "title": "Photographer schema.",
                        "description": "An explanation about the purpose of this instance."
                    }
                },
                "required": [
                    "date",
                    "photographer"
                ]
            }
        }
    },
    "required": [
        "name",
        "images"
    ]
}

