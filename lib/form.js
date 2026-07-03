"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function normalizeInteger(s) {
  if (!s) {
    return "";
  }
  const len = s.length;
  const buf = new Array(len);
  let j = 0;
  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i);
    if (c >= 48 && c <= 57) {
      buf[j++] = s[i];
    }
  }
  return j === len ? buf.join("") : buf.slice(0, j).join("");
}
exports.normalizeInteger = normalizeInteger;
function removeSeparators(s) {
  if (!s) {
    return "";
  }
  const len = s.length;
  const buffer = new Uint16Array(len);
  let write = 0;
  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i);
    if ((c >= 48 && c <= 57) || c === 46) {
      buffer[write++] = c;
    }
  }
  return String.fromCharCode.apply(null, buffer.subarray(0, write));
}
exports.removeSeparators = removeSeparators;
function normalizeNumber(s) {
  if (!s) {
    return "";
  }
  const len = s.length;
  const buf = new Array(len);
  let j = 0;
  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i);
    if (c >= 48 && c <= 57) {
      buf[j++] = s[i];
    }
    else if (c === 44 || c === 1643) {
      buf[j++] = ".";
    }
  }
  return j === len ? buf.join("") : buf.slice(0, j).join("");
}
exports.normalizeNumber = normalizeNumber;
function fromFormData(formData, attrs, decimalSeparator, includeUndefine, includeErrorForNumbers) {
  if (!attrs) {
    return fromFormDataWithAttributes(formData, {}, decimalSeparator, includeUndefine, includeErrorForNumbers);
  }
  return fromFormDataWithAttributes(formData, attrs, decimalSeparator, includeUndefine, includeErrorForNumbers);
}
exports.fromFormData = fromFormData;
function fromFormDataWithAttributes(formData, attrs, decimalSeparator, includeUndefine, includeErrorForNumbers) {
  const obj = {};
  const keys = formData.keys();
  for (const key of keys) {
    const attr = attrs[key];
    const v = formData.get(key);
    if (attr) {
      obj[key] = v;
      if (v && typeof v === "string") {
        if (attr.type === "integer") {
          const n = normalizeInteger(v);
          if (!isNaN(n)) {
            obj[key] = parseFloat(n);
          }
        }
        else if (attr.type === "number") {
          const n = decimalSeparator === "," || decimalSeparator === "٫" ? normalizeNumber(v) : removeSeparators(v);
          if (!isNaN(n)) {
            obj[key] = parseFloat(n);
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
