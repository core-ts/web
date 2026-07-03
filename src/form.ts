export type DataType = 'ObjectId' | 'date' | 'datetime' | 'time'
  | 'boolean' | 'number' | 'integer' | 'string' | 'text'
  | 'object' | 'array' | 'binary'
  | 'primitives' | 'booleans' | 'numbers' | 'integers' | 'strings' | 'dates' | 'datetimes' | 'times';

export function normalizeInteger(s?: string | null): string {
  if (!s) {
    return ""
  }
  const len = s.length
  const buf = new Array<string>(len)
  let j = 0
  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i)
    if (c >= 48 && c <= 57) {
      buf[j++] = s[i]
    }
  }
  return j === len ? buf.join("") : buf.slice(0, j).join("")
}

// Keep a single dot
export function removeSeparators(s?: string | null): string {
  if (!s) {
    return ""
  }
  const len = s.length
  const buffer = new Uint16Array(len) // preallocate max possible
  let write = 0

  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i)
    // '0'–'9' (48–57), '.' (46)
    if ((c >= 48 && c <= 57) || c === 46) {
      buffer[write++] = c
    }
  }
  // Convert only the used portion to string
  return String.fromCharCode.apply(null, buffer.subarray(0, write) as any)
}
// Keep digits 0–9 ; Replace , and ٫ (Arabic decimal separator) → . ; Remove everything else => < 100 char: Array<string> version can actually be just as fast or faster due to lower overhead
export function normalizeNumber(s?: string | null): string {
  if (!s) {
    return ""
  }
  const len = s.length
  const buf = new Array<string>(len)
  let j = 0
  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i)

    if (c >= 48 && c <= 57) {
      buf[j++] = s[i]
    } else if (c === 44 || c === 1643) {
      buf[j++] = "."
    }
  }
  return j === len ? buf.join("") : buf.slice(0, j).join("")
}

export interface Attribute {
  type?: DataType;
}
export interface Attributes {
  [key: string]: Attribute;
}
export function fromFormData<T>(formData: FormData, attrs?: Attributes, decimalSeparator?: string, includeUndefine?: boolean, includeErrorForNumbers?: boolean): T {
  if (!attrs) {
    return fromFormDataWithAttributes(formData, {}, decimalSeparator, includeUndefine, includeErrorForNumbers)
  }
  return fromFormDataWithAttributes(formData, attrs, decimalSeparator, includeUndefine, includeErrorForNumbers)
}
export function fromFormDataWithAttributes<T>(formData: FormData, attrs: Attributes, decimalSeparator?: string, includeUndefine?: boolean, includeErrorForNumbers?: boolean): T {
  const obj = {} as any
  const keys = formData.keys()
  for (const key of keys) {
    const attr: Attribute = attrs[key]
    const v = formData.get(key)
    if (attr) {
      obj[key] = v
      if (v && typeof v === "string") {
        if (attr.type === "integer") {
          const n = normalizeInteger(v)
          if (!isNaN(n as any)) {
            obj[key] = parseFloat(n)
          }
        } else if (attr.type === "number") {
          const n = decimalSeparator === "," || decimalSeparator === "٫" ? normalizeNumber(v) : removeSeparators(v)
          if (!isNaN(n as any)) {
            obj[key] = parseFloat(n)
          }
        } else if (attr.type === "datetime" || attr.type === "date") {
          const d = new Date(v)
          if (d.toString() !== "Invalid Date") {
            obj[key] = d
          }
        } else if (attr.type === "boolean") {
          obj[key] = v === "true"
        } else if (attr.type === "strings") {
          obj[key] = v.split(",")
        } else if (attr.type === "integers" || attr.type === "numbers") {
          const s = v.split(",")
          const nums = []
          for (let i = 0; i < s.length; i++) {
            if (!isNaN(s[i] as any)) {
              const num = parseFloat(s[i])
              nums.push(num)
            } else if (includeErrorForNumbers) {
              nums.push(s[i])
            }
          }
          obj[key] = nums
        }
      }
    } else if (includeUndefine) {
      obj[key] = v
    }
  }
  return obj
}
