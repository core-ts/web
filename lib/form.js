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
  const obj = {};
  const keys = formData.keys();
  for (const key of keys) {
    const attr = attrs[key];
    const v = formData.get(key);
    if (attr) {
      obj[key] = v;
      if (v && typeof v === "string") {
        if (attr.type === "number" || attr.type === "integer") {
          if (!isNaN(v)) {
            obj[key] = parseFloat(v);
          }
        }
        else if (attr.type === "datetime" || attr.type === "date") {
          const d = new Date(v);
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
          const s = v.split(",");
          const nums = [];
          for (let i = 0; i < s.length; i++) {
            if (!isNaN(s[i])) {
              const num = parseFloat(s[i]);
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
