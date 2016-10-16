    
var testSchema = {
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
                "classname": "ImageMetaData",
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

var testValues = {
    "name": "Album 1",
    "images": [
        {
            "date": "March 72",
            "photographer": "Thomas"
        }
    ]
}

console.log('Hello world');

var files = new dk.schaumburgit.jsonconst.Generate().generate(testSchema, testValues, "typescript", "test.module", "config");

console.log(files[0].contents);