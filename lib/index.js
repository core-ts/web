"use strict";
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./form"));
var resources = (function () {
  function resources() {
  }
  resources.limits = [12, 24, 60, 100, 120, 180, 300, 600];
  resources.page = "page";
  resources.limit = "limit";
  resources.defaultLimit = 12;
  resources.sort = "sort";
  return resources;
}());
exports.resources = resources;
function removePage(obj) {
  var arr = [];
  var keys = Object.keys(obj);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var k = keys_1[_i];
    if (k !== resources.page) {
      var v = obj[k];
      arr.push(k + "=" + encodeURI(v));
    }
  }
  return arr.length === 0 ? "" : arr.join("&");
}
exports.removePage = removePage;
function removeSort(obj) {
  var arr = [];
  var keys = Object.keys(obj);
  for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
    var k = keys_2[_i];
    if (k !== resources.sort) {
      var v = obj[k];
      arr.push(k + "=" + encodeURI(v));
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
  var filter = fromParams(obj, arr);
  filter[resources.page] = getPage(filter[resources.page]);
  filter[resources.limit] = getLimit(filter[resources.limit]);
  format(filter, dates, nums);
  return filter;
}
exports.buildFilter = buildFilter;
function fromParams(obj, arr) {
  var s = {};
  var keys = Object.keys(obj);
  for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
    var key = keys_3[_i];
    if (inArray(key, arr)) {
      var x = obj[key].split(",");
      setValue(s, key, x);
    }
    else {
      setValue(s, key, obj[key]);
    }
  }
  return s;
}
exports.fromParams = fromParams;
function inArray(s, arr) {
  if (!arr || arr.length === 0) {
    return false;
  }
  for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
    var a = arr_1[_i];
    if (s === a) {
      return true;
    }
  }
  return false;
}
exports.inArray = inArray;
function setValue(o, key, value) {
  var obj = o;
  var replaceKey = key.replace(/\[/g, ".[").replace(/\.\./g, ".");
  if (replaceKey.indexOf(".") === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length);
  }
  var keys = replaceKey.split(".");
  var firstKey = keys.shift();
  if (!firstKey) {
    return;
  }
  var isArrayKey = /\[([0-9]+)\]/.test(firstKey);
  if (keys.length > 0) {
    var firstKeyValue = obj[firstKey] || {};
    var returnValue = setValue(firstKeyValue, keys.join("."), value);
    return setKey(obj, isArrayKey, firstKey, returnValue);
  }
  return setKey(obj, isArrayKey, firstKey, value);
}
exports.setValue = setValue;
var setKey = function (_object, _isArrayKey, _key, _nextValue) {
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
var _datereg = "/Date(";
var _re = /-?\d+/;
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
  var i = v.indexOf(_datereg);
  if (i >= 0) {
    var m = _re.exec(v);
    if (m !== null) {
      var d = parseInt(m[0], 10);
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
      var d = parseInt(v, 10);
      return new Date(d);
    }
  }
}
function format(obj, dates, nums) {
  var o = obj;
  if (dates && dates.length > 0) {
    for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
      var s = dates_1[_i];
      var v = o[s];
      if (v) {
        if (v instanceof Date) {
          continue;
        }
        if (typeof v === "string" || typeof v === "number") {
          var d = toDate(v);
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
          var keys = Object.keys(v);
          for (var _a = 0, keys_4 = keys; _a < keys_4.length; _a++) {
            var key = keys_4[_a];
            var v2 = v[key];
            if (v2 instanceof Date) {
              continue;
            }
            if (typeof v2 === "string" || typeof v2 === "number") {
              var d2 = toDate(v2);
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
    for (var _b = 0, nums_1 = nums; _b < nums_1.length; _b++) {
      var s = nums_1[_b];
      var v = o[s];
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
            var i = parseFloat(v);
            o[s] = i;
          }
        }
        else if (typeof v === "object") {
          var keys = Object.keys(v);
          for (var _c = 0, keys_5 = keys; _c < keys_5.length; _c++) {
            var key = keys_5[_c];
            var v2 = v[key];
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
                var i = parseFloat(v2);
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
  var s = params[resources.sort];
  return buildSort(s);
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
  var search = removeSort(params);
  var sort = buildSort(sortStr);
  var sorts = {};
  var prefix = search.length > 0 ? "?" + search + "&" : "?";
  for (var i = 0; i < fields.length; i++) {
    sorts[fields[i]] = {
      url: prefix + resources.sort + "=" + getSortString(fields[i], sort),
      tag: renderSort(fields[i], sort),
    };
  }
  return sorts;
}
exports.buildSortSearch = buildSortSearch;
function formatInteger(v, groupSeparator) {
  if (groupSeparator === void 0) { groupSeparator = ","; }
  if (v == null || !Number.isFinite(v)) {
    return "";
  }
  var isNegative = v < 0;
  var n = Math.abs(Math.trunc(v));
  if (n < 1000) {
    return isNegative ? "-" + n : "" + n;
  }
  var result = "";
  var count = 0;
  while (n > 0) {
    var digit = n % 10;
    n = (n / 10) | 0;
    if (count > 0 && count % 3 === 0) {
      result = groupSeparator + result;
    }
    result = digit + result;
    count++;
  }
  return isNegative ? "-" + result : result;
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
  var s = scale === 0 || scale ? v.toFixed(scale) : v.toString();
  var x = s.split(".", 2);
  var y = x[0];
  var arr = [];
  var len = y.length - 1;
  for (var k = 0; k < len; k++) {
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
function getDateFormat(profile) {
  return "M/D/YYYY";
}
exports.getDateFormat = getDateFormat;
function getPage(page) {
  var num = getNumber(page);
  return num === undefined || num < 1 ? 1 : num;
}
exports.getPage = getPage;
function getLimit(limit) {
  var num = getNumber(limit);
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
    var arr = [];
    for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
      var sub = obj_1[_i];
      var c = clone(sub);
      arr.push(c);
    }
    return arr;
  }
  var x = {};
  var keys = Object.keys(obj);
  for (var _a = 0, keys_6 = keys; _a < keys_6.length; _a++) {
    var k = keys_6[_a];
    var v = obj[k];
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
  var d2 = typeof date !== "string" ? date : new Date(date);
  var year = d2.getFullYear();
  var month = pad(d2.getMonth() + 1);
  var day = pad(d2.getDate());
  var hours = pad(d2.getHours());
  var minutes = pad(d2.getMinutes());
  var seconds = pad(d2.getSeconds());
  return year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds;
}
exports.datetimeToString = datetimeToString;
function formatDate(d, format) {
  if (!d || !format) {
    return "";
  }
  var y = d.getFullYear();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  var out = "";
  var i = 0;
  while (i < format.length) {
    var c = format.charCodeAt(i);
    if (c === 121) {
      var len = count(format, i, 121);
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
      var len = count(format, i, 77);
      out += len >= 2 ? pad(m) : m.toString();
      i += len >= 2 ? 2 : 1;
      continue;
    }
    if (c === 100) {
      var len = count(format, i, 100);
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
  var n = 0;
  while (i + n < s.length && s.charCodeAt(i + n) === ch) {
    n++;
  }
  return n;
}
function formatDateTime(date, dateFormat) {
  if (!date) {
    return "";
  }
  var sd = formatDate(date, dateFormat);
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
  var sd = formatDate(date, dateFormat);
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
  var sd = formatDate(date, dateFormat);
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
  var se = s && s.length > 0 ? s : ".";
  return formatLongTime(d) + se + pad3(d.getMilliseconds());
}
exports.formatFullTime = formatFullTime;
function dateToString(d, milli) {
  var s = "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
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
var formatter = (function () {
  function formatter() {
  }
  formatter.removePhoneFormat = function (phone) {
    if (phone) {
      return phone.replace(formatter.phone, "");
    }
    else {
      return phone;
    }
  };
  formatter.formatPhone = function (phone) {
    if (!phone) {
      return "";
    }
    var s = phone;
    var x = formatter.removePhoneFormat(phone);
    if (x.length === 10) {
      var USNumber = x.match(formatter.usPhone);
      if (USNumber != null) {
        s = USNumber[1] + " " + USNumber[2] + "-" + USNumber[3];
      }
    }
    else if (x.length <= 3 && x.length > 0) {
      s = x;
    }
    else if (x.length > 3 && x.length < 7) {
      s = x.substring(0, 3) + " " + x.substring(3, x.length);
    }
    else if (x.length >= 7 && x.length < 10) {
      s = x.substring(0, 3) + " " + x.substring(3, 6) + "-" + x.substring(6, x.length);
    }
    else if (x.length >= 11) {
      var l = x.length;
      s = x.substring(0, l - 7) + " " + x.substring(l - 7, l - 4) + "-" + x.substring(l - 4, l);
    }
    return s;
  };
  formatter.phone = / |\-|\.|\(|\)/g;
  formatter.usPhone = /(\d{3})(\d{3})(\d{4})/;
  return formatter;
}());
exports.formatter = formatter;
function formatPhone(phone) {
  return formatter.formatPhone(phone);
}
exports.formatPhone = formatPhone;
