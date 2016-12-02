# jsonconst


This package provides a Javascript library that you can call from your own code
   ```javascript
   const file = require("file");
   function compile_config()
   {
       var json = file.read("foo.json");
       var ts = jsonconst.generate(json, "typescript", null, null);
       file.write("foo.ts", ts);
   }
   ```

###JSON schema
``Jsonconst`` allows you to specify the *JSON schema* for your JSON file:

```json
{
   $schema: "./myschema.schema.json",
   'firstname': "John"
}
```

Doing so has a number of advantages, as listed below.

####Catching type errors
Without a schema, any field can take any value:
```json
{
   'numericValue': "foo",
   'stringValue': 41
}
```

With a schema, mistakes like the above are caught during compilation:
```json
{
   $schema: "./myConfig.schema.json",
   'numericValue': "foo",
   'stringValue': 41
}
```

And if your editor supports JSON schemas, you will get error feedback when editing:

FIG

####Intellisense
JSON schemas allow you to add descriptions to fields - and if your editor supports it, these descriptions
willl be displayed:

FIG

The descriptions will also be passed on to code generation:

