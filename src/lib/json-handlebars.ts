import Handlebars from "handlebars";

// Create a custom Handlebars environment specifically for compiling JSON templates.
// This environment automatically escapes strings for JSON instead of HTML.
export const jsonHandlebars = Handlebars.create();

jsonHandlebars.Utils.escapeExpression = function (value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }
  const stringValue = String(value);
  return stringValue
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
};

jsonHandlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new jsonHandlebars.SafeString(jsonString);
});
