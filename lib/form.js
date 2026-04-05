"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fromFormData(formData, attrs, includeUndefine, includeErrorForNumbers) {
  if (!attrs) {
    return fromFormDataWithAttributes(formData, {}, includeUndefine, includeErrorForNumbers);
  }
  return fromFormDataWithAttributes(formData, attrs, includeUndefine, includeErrorForNumbers);
}
exports.fromFormData = fromFormData;
function fromFormDataWithAttributes(formData, attrs, includeUndefine, includeErrorForNumbers) {
  var obj = {};
  var keys = formData.keys();
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    var attr = attrs[key];
    var v = formData.get(key);
    if (attr) {
      obj[key] = v;
      if (v && typeof v === "string") {
        if (attr.type === "number" || attr.type === "integer") {
          if (!isNaN(v)) {
            obj[key] = parseFloat(v);
          }
        }
        else if (attr.type === "datetime" || attr.type === "date") {
          var d = new Date(v);
          if (d.toString() !== "Invalid Date") {
            obj[key] = d;
          }
        }
        else if (attr.type === "boolean") {
          obj[key] = v === "true";
        }
        else if (attr.type === "strings") {
          obj[key] = v.split(",");
        }
        else if (attr.type === "integers" || attr.type === "numbers") {
          var s = v.split(",");
          var nums = [];
          for (var i = 0; i < s.length; i++) {
            if (!isNaN(s[i])) {
              var num = parseFloat(s[i]);
              nums.push(num);
            }
            else if (includeErrorForNumbers) {
              nums.push(s[i]);
            }
          }
          obj[key] = nums;
        }
      }
    }
    else if (includeUndefine) {
      obj[key] = v;
    }
  }
  return obj;
}
exports.fromFormDataWithAttributes = fromFormDataWithAttributes;
