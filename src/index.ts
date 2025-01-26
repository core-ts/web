export * from "./form"

export class resources {
  static limits = [12, 24, 60, 100, 120, 180, 300, 600]
  static page = "page"
  static limit = "limit"
  static defaultLimit = 12
  static sort = "sort"
}
export interface StringMap {
  [key: string]: string
}
export interface Params {
  params: StringMap
  searchParams: StringMap
}
export function removePage(obj: StringMap): string {
  const arr: string[] = []
  const keys = Object.keys(obj)
  for (const k of keys) {
    if (k !== resources.page) {
      const v = obj[k]
      arr.push(`${k}=${encodeURI(v)}`)
    }
  }
  return arr.length === 0 ? "" : arr.join("&")
}

export function removeSort(obj: StringMap): string {
  const arr: string[] = []
  const keys = Object.keys(obj)
  for (const k of keys) {
    if (k !== resources.sort) {
      const v = obj[k]
      arr.push(`${k}=${encodeURI(v)}`)
    }
  }
  return arr.length === 0 ? "" : arr.join("&")
}
export type SearchParams = {
  q?: string
  page?: string
  limit?: string
  sort?: string
}
export interface Sort {
  field?: string
  type?: string
}
export interface SortType {
  url: string
  tag: string
}
export interface SortMap {
  [key: string]: SortType
}
export function getSortString(field: string, sort: Sort): string {
  if (field === sort.field) {
    return sort.type === "-" ? field : "-" + field
  }
  return field
}
export function buildFilter<T>(obj: StringMap, dates?: string[], nums?: string[], arr?: string[]): T {
  const filter: any = fromParams<T>(obj, arr)
  filter[resources.page] = getPage(filter[resources.page] as string)
  filter[resources.limit] = getLimit(filter[resources.limit] as string)
  format(filter, dates, nums)
  return filter
}
export function fromParams<T>(obj: StringMap, arr?: string[]): T {
  const s: any = {}
  const keys = Object.keys(obj)
  for (const key of keys) {
    if (inArray(key, arr)) {
      const x = (obj[key] as string).split(",")
      setValue(s, key, x)
    } else {
      setValue(s, key, obj[key] as string)
    }
  }
  return s
}
export function inArray(s: string, arr?: string[]): boolean {
  if (!arr || arr.length === 0) {
    return false
  }
  for (const a of arr) {
    if (s === a) {
      return true
    }
  }
  return false
}
export function setValue<T, V>(o: T, key: string, value: V): any {
  const obj: any = o
  let replaceKey = key.replace(/\[/g, ".[").replace(/\.\./g, ".")
  if (replaceKey.indexOf(".") === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length)
  }
  const keys = replaceKey.split(".")
  const firstKey = keys.shift()
  if (!firstKey) {
    return
  }
  const isArrayKey = /\[([0-9]+)\]/.test(firstKey)
  if (keys.length > 0) {
    const firstKeyValue = obj[firstKey] || {}
    const returnValue = setValue(firstKeyValue, keys.join("."), value)
    return setKey(obj, isArrayKey, firstKey, returnValue)
  }
  return setKey(obj, isArrayKey, firstKey, value)
}
const setKey = (_object: any, _isArrayKey: boolean, _key: string, _nextValue: any) => {
  if (_isArrayKey) {
    if (_object.length > _key) {
      _object[_key] = _nextValue
    } else {
      _object.push(_nextValue)
    }
  } else {
    _object[_key] = _nextValue
  }
  return _object
}
const _datereg = "/Date("
const _re = /-?\d+/
function toDate(v: any): Date | null | undefined {
  if (!v) {
    return null
  }
  if (v instanceof Date) {
    return v
  } else if (typeof v === "number") {
    return new Date(v)
  }
  const i = v.indexOf(_datereg)
  if (i >= 0) {
    const m = _re.exec(v)
    if (m !== null) {
      const d = parseInt(m[0], 10)
      return new Date(d)
    } else {
      return null
    }
  } else {
    if (isNaN(v)) {
      return new Date(v)
    } else {
      const d = parseInt(v, 10)
      return new Date(d)
    }
  }
}
export function format<T>(obj: T, dates?: string[], nums?: string[]): T {
  const o: any = obj
  if (dates && dates.length > 0) {
    for (const s of dates) {
      const v = o[s]
      if (v) {
        if (v instanceof Date) {
          continue
        }
        if (typeof v === "string" || typeof v === "number") {
          const d = toDate(v)
          if (d) {
            if (!(d instanceof Date) || d.toString() === "Invalid Date") {
              delete o[s]
            } else {
              o[s] = d
            }
          }
        } else if (typeof v === "object") {
          const keys = Object.keys(v)
          for (const key of keys) {
            const v2 = v[key]
            if (v2 instanceof Date) {
              continue
            }
            if (typeof v2 === "string" || typeof v2 === "number") {
              const d2 = toDate(v2)
              if (d2) {
                if (!(d2 instanceof Date) || d2.toString() === "Invalid Date") {
                  delete v[key]
                } else {
                  v[key] = d2
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
      const v = o[s]
      if (v) {
        if (v instanceof Date) {
          delete o[s]
          continue
        }
        if (typeof v === "number") {
          continue
        }
        if (typeof v === "string") {
          if (!isNaN(v as any)) {
            delete o[s]
            continue
          } else {
            const i = parseFloat(v)
            o[s] = i
          }
        } else if (typeof v === "object") {
          const keys = Object.keys(v)
          for (const key of keys) {
            const v2 = v[key]
            if (v2 instanceof Date) {
              delete o[key]
              continue
            }
            if (typeof v2 === "number") {
              continue
            }
            if (typeof v2 === "string") {
              if (!isNaN(v2 as any)) {
                delete v[key]
              } else {
                const i = parseFloat(v2)
                v[key] = i
              }
            }
          }
        }
      }
    }
  }
  return o
}

export function buildSort(s?: string): Sort {
  if (!s || s.indexOf(",") >= 0) {
    return {} as Sort
  }
  if (s.startsWith("-")) {
    return { field: s.substring(1), type: "-" }
  } else {
    return { field: s.startsWith("+") ? s.substring(1) : s, type: "+" }
  }
}
export function buildSortFromParams(params: StringMap): Sort {
  const s = params[resources.sort] as string
  return buildSort(s)
}
export function renderSort(field: string, sort: Sort): string {
  if (field === sort.field) {
    return sort.type === "-" ? "<i class='sort-down'></i>" : "<i class='sort-up'></i>"
  }
  return ""
}
export function buildSortSearch(params: StringMap, fields: string[], sortStr?: string): SortMap {
  const search = removeSort(params)
  const sort = buildSort(sortStr)
  let sorts: SortMap = {}
  const prefix = search.length > 0 ? "?" + search + "&" : "?"
  for (let i = 0; i < fields.length; i++) {
    sorts[fields[i]] = {
      url: prefix + resources.sort + "=" + getSortString(fields[i], sort),
      tag: renderSort(fields[i], sort),
    }
  }
  return sorts
}

export function getDateFormat(profile?: string): string {
  return "M/D/YYYY"
}
export function getPage(page?: string): number {
  const num = getNumber(page)
  return num === undefined || num < 1 ? 1 : num
}
export function getLimit(limit?: string): number {
  const num = getNumber(limit)
  return num === undefined || num < 1 ? resources.defaultLimit : num
}
export function getNumber(num?: string, defaultNum?: number): number | undefined {
  return !num || num.length === 0 ? defaultNum : isNaN(num as any) ? undefined : parseInt(num, 10)
}
export function clone(obj: any): any {
  if (!obj) {
    return obj
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  if (typeof obj !== "object") {
    return obj
  }
  if (Array.isArray(obj)) {
    const arr = []
    for (const sub of obj) {
      const c = clone(sub)
      arr.push(c)
    }
    return arr
  }
  const x: any = {}
  const keys = Object.keys(obj)
  for (const k of keys) {
    const v = obj[k]
    if (v instanceof Date) {
      x[k] = new Date(v.getTime())
    } else {
      switch (typeof v) {
        case "object":
          x[k] = clone(v)
          break
        default:
          x[k] = v
          break
      }
    }
  }
  return x
}

export function datetimeToString(date?: Date | string): string | undefined {
  if (!date || date === "") {
    return undefined
  }
  const d2 = typeof date !== "string" ? date : new Date(date)
  const year = d2.getFullYear()
  const month = pad(d2.getMonth() + 1)
  const day = pad(d2.getDate())
  const hours = pad(d2.getHours())
  const minutes = pad(d2.getMinutes())
  const seconds = pad(d2.getSeconds())
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export function formatDate(d: Date | null | undefined, dateFormat?: string, full?: boolean, upper?: boolean): string {
  if (!d) {
    return ""
  }
  let format = dateFormat && dateFormat.length > 0 ? dateFormat : "M/D/YYYY"
  if (upper) {
    format = format.toUpperCase()
  }
  let arr = ["", "", ""]
  const items = format.split(/\/|\.| |-/)
  let iday = items.indexOf("D")
  let im = items.indexOf("M")
  let iyear = items.indexOf("YYYY")
  let fm = full ? full : false
  let fd = full ? full : false
  let fy = true
  if (iday === -1) {
    iday = items.indexOf("DD")
    fd = true
  }
  if (im === -1) {
    im = items.indexOf("MM")
    fm = true
  }
  if (iyear === -1) {
    iyear = items.indexOf("YY")
    fy = full ? full : false
  }
  arr[iday] = getD(d.getDate(), fd)
  arr[im] = getD(d.getMonth() + 1, fm)
  arr[iyear] = getYear(d.getFullYear(), fy)
  const s = detectSeparator(format)
  const e = detectLastSeparator(format)
  const l = items.length === 4 ? format[format.length - 1] : ""
  return arr[0] + s + arr[1] + e + arr[2] + l
}
function detectSeparator(format: string): string {
  const len = format.length
  for (let i = 0; i < len; i++) {
    const c = format[i]
    if (!((c >= "A" && c <= "Z") || (c >= "a" && c <= "z"))) {
      return c
    }
  }
  return "/"
}
function detectLastSeparator(format: string): string {
  const len = format.length - 3
  for (let i = len; i > -0; i--) {
    const c = format[i]
    if (!((c >= "A" && c <= "Z") || (c >= "a" && c <= "z"))) {
      return c
    }
  }
  return "/"
}
export function getYear(y: number, full?: boolean): string {
  if (full || (y <= 99 && y >= -99)) {
    return y.toString()
  }
  const s = y.toString()
  return s.substring(s.length - 2)
}
function getD(n: number, fu: boolean): string {
  return fu ? pad(n) : n.toString()
}
export function formatDateTime(date: Date | null | undefined, dateFormat?: string, full?: boolean, upper?: boolean): string {
  if (!date) {
    return ""
  }
  const sd = formatDate(date, dateFormat, full, upper)
  if (sd.length === 0) {
    return sd
  }
  return sd + " " + formatTime(date)
}
export function formatLongDateTime(date: Date | null | undefined, dateFormat?: string, full?: boolean, upper?: boolean): string {
  if (!date) {
    return ""
  }
  const sd = formatDate(date, dateFormat, full, upper)
  if (sd.length === 0) {
    return sd
  }
  return sd + " " + formatLongTime(date)
}
export function formatFullDateTime(date: Date | null | undefined, dateFormat?: string, s?: string, full?: boolean, upper?: boolean): string {
  if (!date) {
    return ""
  }
  const sd = formatDate(date, dateFormat, full, upper)
  if (sd.length === 0) {
    return sd
  }
  return sd + " " + formatFullTime(date, s)
}
export function formatTime(d: Date): string {
  return pad(d.getHours()) + ":" + pad(d.getMinutes())
}
export function formatLongTime(d: Date): string {
  return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
}
export function formatFullTime(d: Date, s?: string): string {
  const se = s && s.length > 0 ? s : "."
  return formatLongTime(d) + se + pad3(d.getMilliseconds())
}
export function dateToString(d: Date, milli?: boolean): string {
  const s = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  if (milli) {
    return s + pad3(d.getMilliseconds())
  }
  return s
}
function pad(n: number): string {
  return n < 10 ? "0" + n : n.toString()
}
function pad3(n: number): string {
  if (n >= 100) {
    return n.toString()
  }
  return n < 10 ? "00" + n : "0" + n.toString()
}
// tslint:disable-next-line:class-name
export class formatter {
  static phone = / |\-|\.|\(|\)/g
  static usPhone = /(\d{3})(\d{3})(\d{4})/
  static removePhoneFormat(phone: string): string {
    if (phone) {
      return phone.replace(formatter.phone, "")
    } else {
      return phone
    }
  }
  static formatPhone(phone?: string | null): string {
    if (!phone) {
      return ""
    }
    // reformat phone number
    // 555 123-4567 or (+1) 555 123-4567
    let s = phone
    const x = formatter.removePhoneFormat(phone)
    if (x.length === 10) {
      const USNumber = x.match(formatter.usPhone)
      if (USNumber != null) {
        s = `${USNumber[1]} ${USNumber[2]}-${USNumber[3]}`
      }
    } else if (x.length <= 3 && x.length > 0) {
      s = x
    } else if (x.length > 3 && x.length < 7) {
      s = `${x.substring(0, 3)} ${x.substring(3, x.length)}`
    } else if (x.length >= 7 && x.length < 10) {
      s = `${x.substring(0, 3)} ${x.substring(3, 6)}-${x.substring(6, x.length)}`
    } else if (x.length >= 11) {
      const l = x.length
      s = `${x.substring(0, l - 7)} ${x.substring(l - 7, l - 4)}-${x.substring(l - 4, l)}`
      // formatedPhone = `(+${phoneNumber.charAt(0)}) ${phoneNumber.substring(0, 3)} ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6, phoneNumber.length - 1)}`;
    }
    return s
  }
}
export function formatPhone(phone?: string | null): string {
  return formatter.formatPhone(phone)
}
