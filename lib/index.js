"use strict";
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./form"));
class resources {
}
exports.resources = resources;
resources.limits = [12, 24, 60, 100, 120, 180, 300, 600];
resources.page = "page";
resources.limit = "limit";
resources.defaultLimit = 12;
resources.sort = "sort";
function removePage(obj) {
  const arr = [];
  const keys = Object.keys(obj);
  for (const k of keys) {
    if (k !== resources.page) {
      const v = obj[k];
      if (typeof v === "string") {
        arr.push(`${k}=${encodeURI(v)}`);
      }
      else if (Array.isArray(v)) {
        const x = v;
        if (x.length > 0) {
          arr.push(`${k}=${encodeURI(x[x.length - 1])}`);
        }
      }
    }
  }
  return arr.length === 0 ? "" : arr.join("&");
}
exports.removePage = removePage;
function removeSort(obj) {
  const arr = [];
  const keys = Object.keys(obj);
  for (const k of keys) {
    if (k !== resources.sort) {
      const v = obj[k];
      if (typeof v === "string") {
        arr.push(`${k}=${encodeURI(v)}`);
      }
      else if (Array.isArray(v)) {
        const x = v;
        if (x.length > 0) {
          arr.push(`${k}=${encodeURI(x[x.length - 1])}`);
        }
      }
    }
  }
  return arr.length === 0 ? "" : arr.join("&");
}
exports.removeSort = removeSort;
function getSortString(field, sort) {
  if (field === sort.field) {
    return sort.type === "-" ? field : "-" + field;
  }
  return field;
}
exports.getSortString = getSortString;
function buildFilter(obj, dates, nums, arr) {
  const filter = fromParams(obj, arr);
  filter[resources.page] = getPage(filter[resources.page]);
  filter[resources.limit] = getLimit(filter[resources.limit]);
  format(filter, dates, nums);
  return filter;
}
exports.buildFilter = buildFilter;
function fromParams(obj, arr) {
  const s = {};
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (inArray(key, arr)) {
      const v = obj[key];
      if (typeof v === "string") {
        const x = v.split(",");
        setValue(s, key, x);
      }
      else if (Array.isArray(v)) {
        const x = v;
        setValue(s, key, x);
      }
    }
    else {
      const v = obj[key];
      if (typeof v === "string") {
        setValue(s, key, v);
      }
      else if (Array.isArray(v)) {
        const x = v;
        if (x.length > 0) {
          setValue(s, key, x[x.length - 1]);
        }
      }
    }
  }
  return s;
}
exports.fromParams = fromParams;
function inArray(s, arr) {
  if (!arr || arr.length === 0) {
    return false;
  }
  for (const a of arr) {
    if (s === a) {
      return true;
    }
  }
  return false;
}
exports.inArray = inArray;
function setValue(o, key, value) {
  const obj = o;
  let replaceKey = key.replace(/\[/g, ".[").replace(/\.\./g, ".");
  if (replaceKey.indexOf(".") === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length);
  }
  const keys = replaceKey.split(".");
  const firstKey = keys.shift();
  if (!firstKey) {
    return;
  }
  const isArrayKey = /\[([0-9]+)\]/.test(firstKey);
  if (keys.length > 0) {
    const firstKeyValue = obj[firstKey] || {};
    const returnValue = setValue(firstKeyValue, keys.join("."), value);
    return setKey(obj, isArrayKey, firstKey, returnValue);
  }
  return setKey(obj, isArrayKey, firstKey, value);
}
exports.setValue = setValue;
const setKey = (_object, _isArrayKey, _key, _nextValue) => {
  if (_isArrayKey) {
    if (_object.length > _key) {
      _object[_key] = _nextValue;
    }
    else {
      _object.push(_nextValue);
    }
  }
  else {
    _object[_key] = _nextValue;
  }
  return _object;
};
const _datereg = "/Date(";
const _re = /-?\d+/;
function toDate(v) {
  if (!v) {
    return null;
  }
  if (v instanceof Date) {
    return v;
  }
  else if (typeof v === "number") {
    return new Date(v);
  }
  const i = v.indexOf(_datereg);
  if (i >= 0) {
    const m = _re.exec(v);
    if (m !== null) {
      const d = parseInt(m[0], 10);
      return new Date(d);
    }
    else {
      return null;
    }
  }
  else {
    if (isNaN(v)) {
      return new Date(v);
    }
    else {
      const d = parseInt(v, 10);
      return new Date(d);
    }
  }
}
function format(obj, dates, nums) {
  const o = obj;
  if (dates && dates.length > 0) {
    for (const s of dates) {
      const v = o[s];
      if (v) {
        if (v instanceof Date) {
          continue;
        }
        if (typeof v === "string" || typeof v === "number") {
          const d = toDate(v);
          if (d) {
            if (!(d instanceof Date) || d.toString() === "Invalid Date") {
              delete o[s];
            }
            else {
              o[s] = d;
            }
          }
        }
        else if (typeof v === "object") {
          const keys = Object.keys(v);
          for (const key of keys) {
            const v2 = v[key];
            if (v2 instanceof Date) {
              continue;
            }
            if (typeof v2 === "string" || typeof v2 === "number") {
              const d2 = toDate(v2);
              if (d2) {
                if (!(d2 instanceof Date) || d2.toString() === "Invalid Date") {
                  delete v[key];
                }
                else {
                  v[key] = d2;
                }
              }
            }
          }
        }
      }
    }
  }
  if (nums && nums.length > 0) {
    for (const s of nums) {
      const v = o[s];
      if (v) {
        if (v instanceof Date) {
          delete o[s];
          continue;
        }
        if (typeof v === "number") {
          continue;
        }
        if (typeof v === "string") {
          if (!isNaN(v)) {
            delete o[s];
            continue;
          }
          else {
            const i = parseFloat(v);
            o[s] = i;
          }
        }
        else if (typeof v === "object") {
          const keys = Object.keys(v);
          for (const key of keys) {
            const v2 = v[key];
            if (v2 instanceof Date) {
              delete o[key];
              continue;
            }
            if (typeof v2 === "number") {
              continue;
            }
            if (typeof v2 === "string") {
              if (!isNaN(v2)) {
                delete v[key];
              }
              else {
                const i = parseFloat(v2);
                v[key] = i;
              }
            }
          }
        }
      }
    }
  }
  return o;
}
exports.format = format;
function buildSort(s) {
  if (!s || s.indexOf(",") >= 0) {
    return {};
  }
  if (s.startsWith("-")) {
    return { field: s.substring(1), type: "-" };
  }
  else {
    return { field: s.startsWith("+") ? s.substring(1) : s, type: "+" };
  }
}
exports.buildSort = buildSort;
function buildSortFromParams(params) {
  const s = params[resources.sort];
  if (s !== undefined) {
    if (typeof s === "string") {
      return buildSort(s);
    }
    else if (Array.isArray(s)) {
      const x = s;
      if (x.length > 0) {
        return buildSort(x[x.length - 1]);
      }
    }
  }
  return buildSort(undefined);
}
exports.buildSortFromParams = buildSortFromParams;
function renderSort(field, sort) {
  if (field === sort.field) {
    return sort.type === "-" ? "<i class='sort-down'></i>" : "<i class='sort-up'></i>";
  }
  return "";
}
exports.renderSort = renderSort;
function buildSortSearch(params, fields, sortStr) {
  const search = removeSort(params);
  const sort = buildSort(sortStr);
  let sorts = {};
  const prefix = search.length > 0 ? "?" + search + "&" : "?";
  for (let i = 0; i < fields.length; i++) {
    sorts[fields[i]] = {
      url: prefix + resources.sort + "=" + getSortString(fields[i], sort),
      tag: renderSort(fields[i], sort),
    };
  }
  return sorts;
}
exports.buildSortSearch = buildSortSearch;
function formatInteger(v, groupSeparator = ",") {
  if (v == null || !Number.isFinite(v)) {
    return "";
  }
  const isNegative = v < 0;
  let n = Math.abs(Math.trunc(v));
  if (n < 1000) {
    return isNegative ? `-${n}` : `${n}`;
  }
  let result = "";
  let count = 0;
  while (n > 0) {
    const digit = n % 10;
    n = (n / 10) | 0;
    if (count > 0 && count % 3 === 0) {
      result = groupSeparator + result;
    }
    result = digit + result;
    count++;
  }
  return isNegative ? `-${result}` : result;
}
exports.formatInteger = formatInteger;
function formatNumber(v, scale, d, g) {
  if (v == null) {
    return "";
  }
  if (!d && !g) {
    g = ",";
    d = ".";
  }
  else if (!g) {
    g = d === "," ? "." : ",";
  }
  const s = scale === 0 || scale ? v.toFixed(scale) : v.toString();
  const x = s.split(".", 2);
  const y = x[0];
  const arr = [];
  const len = y.length - 1;
  for (let k = 0; k < len; k++) {
    arr.push(y[len - k]);
    if ((k + 1) % 3 === 0) {
      arr.push(g);
    }
  }
  arr.push(y[0]);
  if (x.length === 1) {
    return arr.reverse().join("");
  }
  else {
    return arr.reverse().join("") + d + x[1];
  }
}
exports.formatNumber = formatNumber;
function getPage(page) {
  const num = getNumber(page);
  return num === undefined || num < 1 ? 1 : num;
}
exports.getPage = getPage;
function getLimit(limit) {
  const num = getNumber(limit);
  return num === undefined || num < 1 ? resources.defaultLimit : num;
}
exports.getLimit = getLimit;
function getNumber(num, defaultNum) {
  return !num || num.length === 0 ? defaultNum : isNaN(num) ? undefined : parseInt(num, 10);
}
exports.getNumber = getNumber;
function clone(obj) {
  if (!obj) {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    const arr = [];
    for (const sub of obj) {
      const c = clone(sub);
      arr.push(c);
    }
    return arr;
  }
  const x = {};
  const keys = Object.keys(obj);
  for (const k of keys) {
    const v = obj[k];
    if (v instanceof Date) {
      x[k] = new Date(v.getTime());
    }
    else {
      switch (typeof v) {
        case "object":
          x[k] = clone(v);
          break;
        default:
          x[k] = v;
          break;
      }
    }
  }
  return x;
}
exports.clone = clone;
function datetimeToString(date) {
  if (!date || date === "") {
    return undefined;
  }
  const d2 = typeof date !== "string" ? date : new Date(date);
  const year = d2.getFullYear();
  const month = pad(d2.getMonth() + 1);
  const day = pad(d2.getDate());
  const hours = pad(d2.getHours());
  const minutes = pad(d2.getMinutes());
  const seconds = pad(d2.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
exports.datetimeToString = datetimeToString;
function formatDate(d, format) {
  if (!d || !format) {
    return "";
  }
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  let out = "";
  let i = 0;
  while (i < format.length) {
    const c = format.charCodeAt(i);
    if (c === 121) {
      const len = count(format, i, 121);
      if (len >= 4) {
        out += y.toString();
        i += 4;
      }
      else {
        out += shortYear(y);
        i += 2;
      }
      continue;
    }
    if (c === 77) {
      const len = count(format, i, 77);
      out += len >= 2 ? pad(m) : m.toString();
      i += len >= 2 ? 2 : 1;
      continue;
    }
    if (c === 100) {
      const len = count(format, i, 100);
      out += len >= 2 ? pad(day) : day.toString();
      i += len >= 2 ? 2 : 1;
      continue;
    }
    out += format[i];
    i++;
  }
  return out;
}
exports.formatDate = formatDate;
function shortYear(y) {
  return (y % 100 + 100) % 100 < 10
    ? "0" + ((y % 100 + 100) % 100)
    : "" + ((y % 100 + 100) % 100);
}
function count(s, i, ch) {
  let n = 0;
  while (i + n < s.length && s.charCodeAt(i + n) === ch) {
    n++;
  }
  return n;
}
function formatDateTime(date, dateFormat) {
  if (!date) {
    return "";
  }
  const sd = formatDate(date, dateFormat);
  if (sd.length === 0) {
    return sd;
  }
  return sd + " " + formatTime(date);
}
exports.formatDateTime = formatDateTime;
function formatLongDateTime(date, dateFormat) {
  if (!date) {
    return "";
  }
  const sd = formatDate(date, dateFormat);
  if (sd.length === 0) {
    return sd;
  }
  return sd + " " + formatLongTime(date);
}
exports.formatLongDateTime = formatLongDateTime;
function formatFullDateTime(date, dateFormat, s) {
  if (!date) {
    return "";
  }
  const sd = formatDate(date, dateFormat);
  if (sd.length === 0) {
    return sd;
  }
  return sd + " " + formatFullTime(date, s);
}
exports.formatFullDateTime = formatFullDateTime;
function formatTime(d) {
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
}
exports.formatTime = formatTime;
function formatLongTime(d) {
  return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
}
exports.formatLongTime = formatLongTime;
function formatFullTime(d, s) {
  const se = s && s.length > 0 ? s : ".";
  return formatLongTime(d) + se + pad3(d.getMilliseconds());
}
exports.formatFullTime = formatFullTime;
function dateToString(d, milli) {
  const s = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  if (milli) {
    return s + pad3(d.getMilliseconds());
  }
  return s;
}
exports.dateToString = dateToString;
function pad(n) {
  return n < 10 ? "0" + n : n.toString();
}
function pad3(n) {
  if (n >= 100) {
    return n.toString();
  }
  return n < 10 ? "00" + n : "0" + n.toString();
}
class formatter {
  static removePhoneFormat(phone) {
    if (phone) {
      return phone.replace(formatter.phone, "");
    }
    else {
      return phone;
    }
  }
  static formatPhone(phone) {
    if (!phone) {
      return "";
    }
    let s = phone;
    const x = formatter.removePhoneFormat(phone);
    if (x.length === 10) {
      const USNumber = x.match(formatter.usPhone);
      if (USNumber != null) {
        s = `${USNumber[1]} ${USNumber[2]}-${USNumber[3]}`;
      }
    }
    else if (x.length <= 3 && x.length > 0) {
      s = x;
    }
    else if (x.length > 3 && x.length < 7) {
      s = `${x.substring(0, 3)} ${x.substring(3, x.length)}`;
    }
    else if (x.length >= 7 && x.length < 10) {
      s = `${x.substring(0, 3)} ${x.substring(3, 6)}-${x.substring(6, x.length)}`;
    }
    else if (x.length >= 11) {
      const l = x.length;
      s = `${x.substring(0, l - 7)} ${x.substring(l - 7, l - 4)}-${x.substring(l - 4, l)}`;
    }
    return s;
  }
}
exports.formatter = formatter;
formatter.phone = / |\-|\.|\(|\)/g;
formatter.usPhone = /(\d{3})(\d{3})(\d{4})/;
function formatPhone(phone) {
  return formatter.formatPhone(phone);
}
exports.formatPhone = formatPhone;
function rebuildPath(items, lang) {
  for (const item of items) {
    item.path = item.type === "content" ? `/${lang}${item.path}` : `${item.path}?lang=${lang}`;
    const children = item.children;
    if (children && children.length > 0) {
      rebuildPath(children, lang);
    }
  }
}
exports.rebuildPath = rebuildPath;
function sub(n1, n2) {
  if (!n1 && !n2) {
    return 0;
  }
  else if (n1 && n2) {
    return n1 - n2;
  }
  else if (n1) {
    return n1;
  }
  else if (n2) {
    return -n2;
  }
  return 0;
}
exports.sub = sub;
function subMenuItem(p1, p2) {
  return sub(p1.sequence, p2.sequence);
}
function toMenuItems(m) {
  const ps = getRoot(m);
  for (const p of ps) {
    getChildren(p, m);
  }
  return ps.sort(subMenuItem);
}
exports.toMenuItems = toMenuItems;
function getRoot(ms) {
  const ps = [];
  for (const m of ms) {
    if (!m.parent || m.parent.length === 0) {
      delete m.parent;
      ps.push(m);
    }
  }
  return ps.sort(subMenuItem);
}
function getChildren(m, all) {
  const children = [];
  for (const s of all) {
    if (s.parent === m.id) {
      delete s.parent;
      children.push(s);
      getChildren(s, all);
    }
  }
  if (children.length > 0) {
    children.sort(subMenuItem);
    m.children = children;
  }
}
