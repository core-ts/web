export * from "./form"

export class resources {
  static limits = [12, 24, 60, 100, 120, 180, 300, 600]
  static page = "page"
  static limit = "limit"
  static defaultLimit = 12
  static sort = "sort"
}
export function getRecordValue(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") {
    return v
  } else if (Array.isArray(v)) {
    return v.length > 0 ? v[v.length - 1] : undefined
  }
  return undefined
}
// export type StringMap = Record<string, string | string[] | undefined>
export function removePage(obj: Record<string, string | string[] | undefined>, pageKey?: string): string {
  const arr: string[] = []
  const keys = Object.keys(obj)
  const page = pageKey ? pageKey : resources.page
  for (const k of keys) {
    if (k !== page) {
      const v = obj[k]
      if (typeof v === "string") {
        arr.push(`${k}=${encodeURI(v)}`)
      } else if (Array.isArray(v)) {
        const x = v as string[]
        if (x.length > 0) {
          arr.push(`${k}=${encodeURI(x[x.length - 1])}`)
        }
      }
    }
  }
  return arr.length === 0 ? "" : arr.join("&")
}

export function removeSort(obj: Record<string, string | string[] | undefined>, sortKey?: string): string {
  const arr: string[] = []
  const keys = Object.keys(obj)
  const sort = sortKey ? sortKey : resources.sort
  for (const k of keys) {
    if (k !== sort) {
      const v = obj[k]
      if (typeof v === "string") {
        arr.push(`${k}=${encodeURI(v)}`)
      } else if (Array.isArray(v)) {
        const x = v as string[]
        if (x.length > 0) {
          arr.push(`${k}=${encodeURI(x[x.length - 1])}`)
        }
      }
    }
  }
  return arr.length === 0 ? "" : arr.join("&")
}
export function removeLimit(obj: Record<string, string | string[] | undefined>, limitKey?: string, pageKey?: string): string {
  const arr: string[] = []
  const keys = Object.keys(obj)
  const page = pageKey ? pageKey : resources.page
  const limit = limitKey ? limitKey : resources.limit
  for (const k of keys) {
    if (k !== page && k !== limit) {
      const v = obj[k]
      if (typeof v === "string") {
        arr.push(`${k}=${encodeURI(v)}`)
      } else if (Array.isArray(v)) {
        const x = v as string[]
        if (x.length > 0) {
          arr.push(`${k}=${encodeURI(x[x.length - 1])}`)
        }
      }
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
  type?: "+" | "-"
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
export function buildFilter<T>(obj: Record<string, string | string[] | undefined>, defaultLimit: number,dates?: string[], nums?: string[], arr?: string[], limitKey?: string, pageKey?: string): T {
  const filter: any = fromParams<T>(obj, arr)
  const page = pageKey ? pageKey : resources.page
  const limit = limitKey ? limitKey : resources.limit
  filter[page] = getPage(filter[page] as string)
  filter[limit] = getLimit(filter[limit] as string, defaultLimit)
  format(filter, dates, nums)
  return filter
}
export function fromParams<T>(obj: Record<string, string | string[] | undefined>, arr?: string[]): T {
  const s: any = {}
  const keys = Object.keys(obj)
  for (const key of keys) {
    if (inArray(key, arr)) {
      const v = obj[key]
      if (typeof v === "string") {
        const x = v.split(",")
        setValue(s, key, x)
      } else if (Array.isArray(v)) {
        const x: string[] = v as string[]
        setValue(s, key, x)
      }
      
    } else {
      const v = obj[key]
      if (typeof v === "string") {
        setValue(s, key, v)
      } else if (Array.isArray(v)) {
        const x: string[] = v as string[]
        if (x.length > 0) {
          setValue(s, key, x[x.length - 1])
        }
      }
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
export function buildSortFromParams(params: Record<string, string | string[] | undefined>): Sort {
  const s = params[resources.sort]
  if (s !== undefined) {
    if (typeof s === "string") {
      return buildSort(s)  
    } else if (Array.isArray(s)) {
      const x: string[] = s as string[]
      if (x.length > 0) {
        return buildSort(x[x.length - 1])    
      }
    }
  }
  return buildSort(undefined)
}
export function getSortType(field: string, sort: Sort): "-" | "+" | undefined {
  if (field === sort.field) {
    return sort.type === "-" ? "-" : "+"
  }
  return undefined
}
export function buildSortSearch(params: Record<string, string | string[] | undefined>, fields: string[], sortStr?: string): SortMap {
  const search = removeSort(params)
  const sort = buildSort(sortStr)
  let sorts: SortMap = {}
  const prefix = search.length > 0 ? "?" + search + "&" : "?"
  for (let i = 0; i < fields.length; i++) {
    sorts[fields[i]] = {
      url: prefix + resources.sort + "=" + getSortString(fields[i], sort),
      type: getSortType(fields[i], sort),
    }
  }
  return sorts
}
export interface Item {
  id?: string
  value: string
  text?: string
  fulltext?: string
}
export function buildSorts(sorts: Item[], prefix: string) {
  const l = sorts.length
  for (let i = 0; i < l; i++) {
    sorts[i].value = prefix + sorts[i].value
  }
}
export function getSortText(sorts: Item[], sort: string | undefined, defaultText?: string, textOnly?: boolean): string | undefined {
  if (!sort) {
    return defaultText
  }
  const l = sorts.length
  if (textOnly) {
    for (let i = 0; i < l; i++) {
      if (sorts[i].value === sort) {
        return sorts[i].text
      }
    }
  } else {
    for (let i = 0; i < l; i++) {
      if (sorts[i].value === sort) {
        return sorts[i].fulltext
      }
    }
  }
  return defaultText
}
export function formatInteger(v?: number | null, groupSeparator: string = ","): string {
  if (v == null || !Number.isFinite(v)) {
    return ""
  }

  const isNegative = v < 0
  let n = Math.abs(Math.trunc(v))

  // Fast path for small numbers (no separator needed)
  if (n < 1000) {
    return isNegative ? `-${n}` : `${n}`
  }

  let result = ""
  let count = 0

  while (n > 0) {
    const digit = n % 10
    n = (n / 10) | 0 // faster floor for positive integers

    if (count > 0 && count % 3 === 0) {
      result = groupSeparator + result
    }

    result = digit + result
    count++
  }

  return isNegative ? `-${result}` : result
}
export function formatNumber(v?: number | null, scale?: number, d?: string | null, g?: string): string {
  if (v == null) {
    return ""
  }
  if (!d && !g) {
    g = ","
    d = "."
  } else if (!g) {
    g = d === "," ? "." : ","
  }
  const s = scale === 0 || scale ? v.toFixed(scale) : v.toString()
  const x = s.split(".", 2)
  const y = x[0]
  const arr: string[] = []
  const len = y.length - 1
  for (let k = 0; k < len; k++) {
    arr.push(y[len - k])
    if ((k + 1) % 3 === 0) {
      arr.push(g)
    }
  }
  arr.push(y[0])
  if (x.length === 1) {
    return arr.reverse().join("")
  } else {
    return arr.reverse().join("") + d + x[1]
  }
}

export function getPage(page?: string): number {
  const num = getNumber(page)
  return num === undefined || num < 1 ? 1 : num
}
export function getLimit(limit: string | undefined, defaultLimit: number): number {
  const num = getNumber(limit)
  return num === undefined || num < 1 ? defaultLimit : num
}
export function getNumber(num?: string, defaultNum?: number): number | undefined {
  return !num || num.length === 0 ? defaultNum : isNaN(num as any) ? undefined : parseInt(num, 10)
}
export function clone<T>(obj: T): T {
  if (!obj) {
    return obj
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
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
    return arr as any
  }
  const x: any = {}
  const keys = Object.keys(obj)
  for (const k of keys) {
    const v = (obj as any)[k]
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

export function formatDate(d: Date | null | undefined, format?: string): string {
  if (!d || !format) {
    return ""
  }
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()

  let out = ""
  let i = 0

  while (i < format.length) {
    const c = format.charCodeAt(i)

    // yyyy / yy
    if (c === 121 /* y */) {
      const len = count(format, i, 121)
      if (len >= 4) {
        out += y.toString()
        i += 4
      } else {
        out += shortYear(y)
        i += 2
      }
      continue
    }

    // MM / M
    if (c === 77 /* M */) {
      const len = count(format, i, 77)
      out += len >= 2 ? pad(m) : m.toString()
      i += len >= 2 ? 2 : 1
      continue
    }

    // dd / d
    if (c === 100 /* d */) {
      const len = count(format, i, 100)
      out += len >= 2 ? pad(day) : day.toString()
      i += len >= 2 ? 2 : 1
      continue
    }

    // literal char
    out += format[i]
    i++
  }
  return out
}
function shortYear(y: number): string {
  return (y % 100 + 100) % 100 < 10
    ? "0" + ((y % 100 + 100) % 100)
    : "" + ((y % 100 + 100) % 100)
}
function count(s: string, i: number, ch: number): number {
  let n = 0
  while (i + n < s.length && s.charCodeAt(i + n) === ch) {
    n++
  }
  return n
}
export function formatDateTime(date: Date | null | undefined, dateFormat?: string): string {
  if (!date) {
    return ""
  }
  const sd = formatDate(date, dateFormat)
  if (sd.length === 0) {
    return sd
  }
  return sd + " " + formatTime(date)
}
export function formatLongDateTime(date: Date | null | undefined, dateFormat?: string): string {
  if (!date) {
    return ""
  }
  const sd = formatDate(date, dateFormat)
  if (sd.length === 0) {
    return sd
  }
  return sd + " " + formatLongTime(date)
}
export function formatFullDateTime(date: Date | null | undefined, dateFormat?: string, s?: string): string {
  if (!date) {
    return ""
  }
  const sd = formatDate(date, dateFormat)
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

export interface MenuItem {
  id?: string
  name: string
  path: string
  resource?: string
  icon?: string
  sequence?: number
  prefetch?: boolean
  type?: string
  children?: MenuItem[]
}
export interface Category {
  id: string
  name: string
  path: string
  resource?: string
  icon?: string
  sequence?: number
  prefetch?: boolean
  type?: string
  parent?: string
  children?: MenuItem[]
}
export function rebuildPath(items: MenuItem[], lang: string) {
  for (const item of items) {
    item.path = item.type === "content" ? `/${lang}${item.path}` : `${item.path}?lang=${lang}`
    const children = item.children
    if (children && children.length > 0) {
      rebuildPath(children, lang)
    }
  }
}
interface StringMap2 {
  [key: string]: string;
}
export function localize(items: MenuItem[], resource: StringMap2): MenuItem[] {
  for (const item of items) {
    if (item.resource) {
      const text = resource[item.resource];
      if (text) {
        item.name = text;
      }
    }

    const children = item.children;
    if (children && children.length > 0) {
      localize(children, resource);
    }
  }

  return items;
}

export function sub(n1?: number, n2?: number): number {
  if (!n1 && !n2) {
    return 0
  } else if (n1 && n2) {
    return n1 - n2
  } else if (n1) {
    return n1
  } else if (n2) {
    return -n2
  }
  return 0
}
function subMenuItem(p1: MenuItem, p2: MenuItem): number {
  return sub(p1.sequence, p2.sequence)
}
export function toMenuItems(m: Category[]): MenuItem[] {
  const ps: Category[] = getRoot(m)
  for (const p of ps) {
    getChildren(p, m)
  }
  return ps.sort(subMenuItem)
}
function getRoot(ms: Category[]): Category[] {
  const ps: Category[] = []
  for (const m of ms) {
    if (!m.parent || m.parent.length === 0) {
      delete m.parent
      ps.push(m)
    }
  }
  return ps.sort(subMenuItem)
}
function getChildren(m: Category, all: Category[]) {
  const children: MenuItem[] = []
  for (const s of all) {
    if (s.parent === m.id) {
      delete s.parent
      children.push(s)
      getChildren(s, all)
    }
  }
  if (children.length > 0) {
    children.sort(subMenuItem)
    m.children = children
  }
}

export function getOffset(limit: number, page?: number, firstLimit?: number): number {
  const p = page && page > 0 ? page : 1
  if (firstLimit && firstLimit > 0) {
    const offset = limit * (p - 2) + firstLimit
    return offset < 0 ? 0 : offset
  } else {
    const offset = limit * (p - 1)
    return offset < 0 ? 0 : offset
  }
}

export function isValidPath(path: string): boolean {
  const len = path.length;
  if (len === 0) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const c = path.charCodeAt(i);
    // a-z
    if (c >= 97 && c <= 122) continue;
    // A-Z
    if (c >= 65 && c <= 90) continue;
    // 0-9
    if (c >= 48 && c <= 57) continue;
    // _, -, /
    if (c === 95 || c === 45 || c === 47) continue;
    return false;
  }
  return true;
}
export function isValidSlug(path: string): boolean {
  const len = path.length;
  if (len === 0) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const c = path.charCodeAt(i);
    // a-z
    if (c >= 97 && c <= 122) continue;
    // A-Z
    if (c >= 65 && c <= 90) continue;
    // 0-9
    if (c >= 48 && c <= 57) continue;
    // _, -, /
    if (c === 95 || c === 45) continue;
    return false;
  }
  return true;
}
