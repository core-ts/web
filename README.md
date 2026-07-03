# web-one

A lightweight, dependency-free TypeScript utility library for modern web applications.

This library provides a collection of reusable utilities commonly required by CRUD applications, especially those built with **Next.js**, **React**, and server-side TypeScript frameworks.

Unlike general-purpose utility libraries (such as Lodash), this package focuses on solving practical web application problems:

- FormData parsing
- URL/SearchParams processing
- Pagination
- Sorting
- Filtering
- Date conversion
- Number formatting
- Phone formatting
- Menu building
- Permission loading
- Deep cloning

---

## Features

- ✅ Zero runtime dependencies
- ✅ Works in Browser and Node.js
- ✅ Next.js App Router friendly
- ✅ Edge Runtime compatible
- ✅ High-performance implementations
- ✅ Generic TypeScript APIs
- ✅ Small bundle size
- ✅ Tree-shakeable

---

## Installation

```bash
npm install web-one
```

or

```bash
yarn add web-one
```

---

## Modules

### FormData Utilities

Convert browser `FormData` into strongly typed objects.

```ts
interface User {
    name: string
    age: number
    active: boolean
}

const attrs = {
    age: { type: "integer" },
    active: { type: "boolean" }
}

const user = fromFormData<User>(formData, attrs)
```

Supported data types:

- string
- text
- boolean
- integer
- number
- date
- datetime
- object
- array
- strings
- integers
- numbers

---

### Search Parameters

Convert URL parameters into typed objects.

```ts
const filter = fromParams(searchParams)
```

Supports

```
?page=2
&sort=name
&category=book
```

Result

```ts
{
    page: "2",
    sort: "name",
    category: "book"
}
```

---

### Filter Builder

Automatically converts URL parameters into application filters.

```ts
const filter = buildFilter<SearchFilter>(
    searchParams,
    20,
    ["createdDate"],
    ["price"]
)
```

Produces

```ts
{
    page: 1,
    limit: 20,
    createdDate: Date,
    price: 100
}
```

---

## Sorting

Generate sortable table links.

```ts
const sorts = buildSortSearch(
    searchParams,
    ["name", "age", "createdDate"]
)
```

Useful for

- Data tables
- Admin pages
- Search pages

---

## Pagination

Utilities for pagination.

```ts
const page = getPage(searchParams.page)

const limit = getLimit(searchParams.limit, 20)

const offset = getOffset(limit, page)
```

---

## Number Utilities

Normalize user input.

```ts
normalizeInteger("12,345")
// 12345
```

```ts
normalizeNumber("12,345.67")
// 12345.67
```

Supports Arabic decimal separator.

---

## Number Formatting

```ts
formatInteger(1234567)
```

Result

```
1,234,567
```

---

```ts
formatNumber(12345.678, 2)
```

Result

```
12,345.68
```

Supports

- custom decimal separator
- custom group separator

---

## Date Utilities

Format dates.

```ts
formatDate(date, "yyyy-MM-dd")
```

```
2025-05-10
```

---

```ts
formatDateTime(date, "yyyy/MM/dd")
```

```
2025/05/10 13:45
```

---

```ts
formatFullDateTime(date)
```

```
2025-05-10 13:45:20.125
```

---

Convert Date to string.

```ts
datetimeToString(date)
```

Result

```
2025-05-10T13:45:20
```

---

## Phone Utilities

Normalize phone numbers.

```ts
normalizePhone("(+1) 555-123-4567")
```

Result

```
+15551234567
```

---

Format phone numbers.

```ts
formatPhone("5551234567")
```

Result

```
555 123-4567
```

---

## Menu Builder

Convert flat menu structures into tree structures.

Input

```ts
[
    {
        id: "1",
        name: "Products"
    },
    {
        id: "2",
        parent: "1",
        name: "Books"
    }
]
```

Output

```text
Products
└── Books
```

Functions

- toMenuItems()
- rebuildPath()
- localize()

---

## Deep Clone

Clone objects.

```ts
const copy = clone(original)
```

Supports

- Object
- Array
- Date

---

## Validation

Validate URL paths.

```ts
isValidPath("/products/book-1")
```

Validate slugs.

```ts
isValidSlug("book-1")
```

---

## Permission Loader

Utility class for loading user permissions from any SQL database.

```ts
const loader = new PrivilegeLoader(sql, query)

const permissions = await loader.getPrivilege(
    userId,
    privilegeId
)
```

Works with

- PostgreSQL
- MySQL
- SQL Server
- Oracle
- SQLite

---

## Utility Functions

The library also provides helpers including

- getNumber()
- getPage()
- getLimit()
- getOffset()
- removePage()
- removeLimit()
- removeSort()
- buildSort()
- buildSortSearch()
- getSortText()
- setValue()
- format()
- clone()

---

## Design Goals

This library is designed with the following principles:

- Minimal dependencies
- High performance
- Small bundle size
- Framework independent
- Generic APIs
- Strong TypeScript support
- Suitable for both frontend and backend

---

## Performance

Many functions are manually optimized.

Examples include

- Character scanning instead of regular expressions
- Preallocated buffers
- Minimal allocations
- Manual number formatting
- Fast string normalization

The goal is to provide predictable performance while keeping the implementation lightweight.

---

## Typical Next.js Workflow

```text
Browser

    │
    ▼

URL Search Params
FormData

    │
    ▼

fromParams()
fromFormData()

    │
    ▼

buildFilter()

    │
    ▼

Repository

    │
    ▼

Database
```

---

## Browser Support

- Chrome
- Edge
- Firefox
- Safari

---

## Runtime Support

- Node.js
- Bun
- Deno
- Next.js
- React
- Express
- Edge Runtime

---

## TypeScript

The library is fully written in TypeScript and provides generic APIs whenever possible.

Example

```ts
const filter = buildFilter<UserFilter>(params, 20)
```

---

## Philosophy

Most utility libraries provide generic algorithms.

This library focuses on **web application development** by providing practical utilities that are repeatedly needed in CRUD applications.

The goal is to eliminate boilerplate code while remaining lightweight, dependency-free, and framework agnostic.
