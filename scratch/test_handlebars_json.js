const Handlebars = require("handlebars");

const JsonHandlebars = Handlebars.create();
JsonHandlebars.Utils.escapeExpression = function(value) {
    if (value === undefined || value === null) {
        return "";
    }
    const stringValue = String(value);
    return stringValue
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/[\b]/g, "\\b")
        .replace(/\f/g, "\\f");
};

const templateStr = `{
  "content": "{{message}}"
}`;

const context = {
    message: 'Hello "World"\nThis is a test.'
};

const compiled = JsonHandlebars.compile(templateStr)(context);
console.log("Compiled string:\n", compiled);

try {
    const parsed = JSON.parse(compiled);
    console.log("Parsed object:", parsed);
} catch (e) {
    console.error("Parse error:", e);
}
