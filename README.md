# The jsonconst suite

This is the home of *the jsonconst suite*, a collection of 3 closely related npm packages created in response 
to a specific software development problem: how to manage system configuration in a multi-platform system.

The jsonconst solution is to define the configuration in a JSON file which is then compiled into native
code for each platform.

The packages of the jsonconst suite each implement this compilation, differing only in the way you invoke it:

- **grunt-jsonconst:** By installing the grunt-jsonconst package, you can invoke jsonconst from you Grunt build script:
   ```json
    "jsonconst": {
       "fooConfig": {
          "options": {
             "language": ["javascript", "c#"],
          },
          "src": "foo.json"
       }
    }
   ```

- **jsonconst-cli:** Installing the jsonconst-cli package lets you run the jsonconst compiler from the command line:
   ```
   C:> jsonconst -language typescript foo.json > foo.ts
   ```
   
- **jsonconst:** This package provides a Javascript library that you can call from your own code
   ```javascript
   const file = require("file");
   function compile_config()
   {
       var json = file.read("foo.json");
       var ts = jsonconst.generate(json, "typescript", null, null);
       file.write("foo.ts", ts);
   }
   ```
   
This document describes the problem and how jsonconst solves it, including code examples
