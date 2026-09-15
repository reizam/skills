---
description: Schema definition with fluent builder API for @stndrds/schema. Use when defining objects, attributes, views, or working with type inference in any project using the @stndrds/* libraries.
---

# @stndrds/schema - Schema Definition

The `@stndrds/schema` package provides a fluent builder API to define objects, attributes, and views with full TypeScript type inference. It is the foundation of the entire @stndrds ecosystem.

## Key Files (Source Reference)

- `packages/schema/src/builders/object-builder.ts` - ObjectBuilder class and `object()` factory
- `packages/schema/src/builders/attribute-builders.ts` - All attribute builder types
- `packages/schema/src/builders/view-builder.ts` - DetailViewBuilder, ListViewBuilder, GroupBuilder
- `packages/schema/src/types/inference.ts` - ExtractRecord, ExtractRecordInput, etc.
- `packages/schema/src/types/objects.ts` - ObjectDefinition, ObjectRecord
- `packages/schema/src/types/attributes.ts` - Attribute type interfaces
- `packages/schema/src/types/views.ts` - ViewDefinition, Tab types

## Core Concepts

### Object Builder

Objects are defined using the `object()` factory and chaining methods. Every object MUST have a `labelExpression`.

```typescript
import { object, text, number, status, relation } from "@stndrds/schema";
import type { ExtractRecord } from "@stndrds/schema";

const PRODUCT = object({ name: "products", label: "Product" })
  .system()                                // Mark as native (code-defined, protected)
  .icon("box")
  .pluralLabel("Products")
  .labelExpression("{{ name }}")           // REQUIRED - how records display
  .attribute(text({ name: "name", label: "Name" }).required())
  .attribute(number({ name: "price", label: "Price" }).decimal(2))
  .attribute(
    status({ name: "status", label: "Status" })
      .options([
        { id: "active", label: "Active", value: "active", color: "green" },
        { id: "draft", label: "Draft", value: "draft", color: "yellow" },
      ])
      .required()
  );

// Full type inference
type ProductRecord = ExtractRecord<typeof PRODUCT>;
// { name: string; price?: number; status: "active" | "draft"; id: string; createdAt: Date; ... }
```

**Rules:**
- Object names must be kebab-case, max 63 chars: `"products"`, `"user-profiles"`, `"order-items"`
- `labelExpression` is REQUIRED, supports `{{ attribute }}` syntax with pipes: `UPPER`, `LOWER`, `capitalize`, `trim`
- `.system()` marks the object as code-defined and protected from client deletion
- `.shared()` makes the object readable by all tenants, writable only by master tenant
- The builder auto-builds attribute builders (no need to call `.build()` on individual attributes)

### Attribute Types (20 types)

Each attribute is created with a factory function. Common base methods on all builders:
- `.required()` / `.optional()` - set required flag
- `.system()` - mark as system attribute
- `.disabled()` / `.hidden()` - UI hints
- `.placeholder()` / `.description()` / `.icon()`
- `.order()` - display order
- `.defaultValue()` - default value
- `.metadata()` - custom metadata
- `.featureGate(flagName, options?)` - conditional visibility

#### Text Types

```typescript
text({ name: "name", label: "Name" }).required().maxLength(255)
text({ name: "email", label: "Email" }).email().required()
text({ name: "website", label: "Website" }).url()
text({ name: "slug", label: "Slug" }).slug()

textarea({ name: "notes", label: "Notes" }).placeholder("Add notes...")

richtext({ name: "content", label: "Content" })
  .features(["headings", "bold", "italic", "lists", "links", "images"])
  .required()
```

#### Number Types

```typescript
number({ name: "quantity", label: "Qty" }).integer().min(0)
number({ name: "price", label: "Price" }).decimal(2).min(0)
number({ name: "rate", label: "Rate" }).percentage()

currency({ name: "amount", label: "Amount" })
  .defaultCurrency("EUR")
  .allowedCurrencies(["EUR", "USD", "GBP"])

rating({ name: "score", label: "Score" }).max(5).iconType("star")
```

#### Boolean & Date

```typescript
checkbox({ name: "active", label: "Active" }).defaultValue(true)

date({ name: "dueDate", label: "Due Date" })
  .format("date")        // "date" | "datetime" | "time"
  .minDate("2024-01-01")
```

#### Choice Types

```typescript
select({ name: "category", label: "Category" })
  .options([
    { id: "a", label: "Cat A", value: "a" },
    { id: "b", label: "Cat B", value: "b" },
  ])

multiselect({ name: "tags", label: "Tags" })
  .options([
    { id: "urgent", label: "Urgent", value: "urgent", color: "red" },
    { id: "review", label: "Review", value: "review", color: "blue" },
  ])

status({ name: "status", label: "Status" })
  .options([
    { id: "idle", label: "Idle", value: "idle", color: "gray", group: "idle" },
    { id: "active", label: "Active", value: "active", color: "green", group: "in_progress" },
    { id: "done", label: "Done", value: "done", color: "blue", group: "finished" },
  ])
```

Status groups: `"idle" | "in_progress" | "finished"`.
Option shape: `{ id, label, value, color?, icon?, description?, group? }`.

#### Contact & Location

```typescript
phone({ name: "phone", label: "Phone" }).defaultCountry("FRA")

location({ name: "address", label: "Address" })
  .granularity("full")           // "country" | "city" | "full"
  .enableAutocomplete()
  .enableMap()
  .defaultCountry("FRA")
```

#### File & User

```typescript
file({ name: "avatar", label: "Avatar" })
  .maxFiles(1)
  .maxSize(5 * 1024 * 1024)     // 5 MB
  .allowedTypes(["image/png", "image/jpeg"])

file({ name: "attachments", label: "Attachments" }).multiple()

user({ name: "assignee", label: "Assignee" }).required()
user({ name: "watchers", label: "Watchers" }).multiple()

document({ name: "idDoc", label: "ID Document" })
  .templates(["french_id_card", "passport"])
  .autoProcess()
  .required()
```

#### Relations

```typescript
// Single relation (cardinality: "one")
relation({ name: "company", label: "Company" })
  .to("companies")
  .required()

// Multi relation (cardinality: "many")
relation({ name: "contacts", label: "Contacts" })
  .to("contacts")
  .many()

// Polymorphic (multiple targets)
relation({ name: "linkedTo", label: "Linked To" })
  .to("companies")
  .to("contacts")
  .many()

// Universal (any object)
relation({ name: "related", label: "Related" })
  .toAny()
  .many()

// With qualified properties (extra fields on the relation itself)
relation({ name: "members", label: "Members" })
  .to("contacts")
  .many()
  .qualifyWith(
    select({ name: "role", label: "Role" }).options([
      { id: "admin", label: "Admin", value: "admin" },
      { id: "member", label: "Member", value: "member" },
    ]).required(),
    number({ name: "shares", label: "Shares" }).min(0),
  )

// Bilateral (auto-sync inverse relation)
relation({ name: "company", label: "Company" })
  .to("companies")
  .bilateral({ inverseName: "contacts", inverseLabel: "Contacts" })
```

#### Computed Types (read-only)

```typescript
// Formula: server-computed values
formula({ name: "total", label: "Total" })
  .expression("price * quantity")
  .returns("number")
  .decimals(2)

formula({ name: "fullName", label: "Full Name" })
  .expression("CONCAT(firstName, ' ', lastName)")
  .returns("text")

// Rollup: aggregation from related records
rollup({ name: "totalOrders", label: "Total Orders" })
  .from("orders")             // relation attribute name
  .aggregate("amount")        // target attribute on related object
  .using("sum")               // sum, avg, count, earliest, latest, ...
  .decimals(2)

rollup({ name: "orderCount", label: "Order Count" })
  .from("orders")
  .aggregate("id")
  .using("count")

// Rollup functions: sum, avg, earliest, latest, count, countValues,
// countUniqueValues, countEmpty, percentEmpty, percentNotEmpty, original
```

### Type Inference

```typescript
import type {
  ExtractRecord,
  ExtractRecordInput,
  ExtractRecordUpdate,
  ExtractRecordStrict,
  ExtractObjectRecord,
} from "@stndrds/schema";

// Full record with metadata + custom attributes
type Product = ExtractRecord<typeof PRODUCT>;

// For creating (omits system fields: id, createdAt, updatedAt)
type ProductInput = ExtractRecordInput<typeof PRODUCT>;

// For updating (all fields optional, omits system fields)
type ProductUpdate = ExtractRecordUpdate<typeof PRODUCT>;

// Without custom attribute support
type ProductStrict = ExtractRecordStrict<typeof PRODUCT>;

// Raw DB structure with { values: ... } field
type ProductObjectRecord = ExtractObjectRecord<typeof PRODUCT>;
```

### Registry

Register objects and views in a centralized registry for auto-sync:

```typescript
import { registry, viewRegistry } from "@stndrds/schema";

// Register objects
registry.register(PRODUCT);
registry.register(CONTACT);

// Register views
viewRegistry.register(PRODUCT_DETAIL_VIEW);
viewRegistry.register(PRODUCT_LIST_VIEW);
```

## View Builders

### Detail View (Record Edit)

```typescript
import { detailView, group, relationGroup } from "@stndrds/schema";

const CONTACT_VIEW = detailView("detail", "Contact Detail")
  .for("contacts")
  .default()
  .icon("user")

  // Form tab with groups
  .tab("general", "Info").icon("info")
    .form(
      group("identity", "Identity")
        .field("firstName", { span: 6 })
        .field("lastName", { span: 6 })
        .fields("email", "phone")
        .collapsible(),
      group("address", "Address")
        .fields("location")
        .collapsible(true),           // Start collapsed
      relationGroup("companies", "Companies", "companies")
        .columns("name", "status")
        .allowCreate()
        .collapsible(),
    )

  // Table tab: inverse lookup (Contact records where Contact.company = this)
  .tab("deals", "Deals").icon("dollar")
    .tableFrom("deals", "contact")    // source object, relation attribute on that object
    .columns("name", "amount", "stage")
    .crud()                           // enable create + edit + delete
    .sort("createdAt", "desc")

  // Table tab: direct relation
  .tab("tasks", "Tasks").icon("check")
    .table("tasks")                   // relation attribute on current object
    .columns("title", "status", "dueDate")
    .crud()
    .createMode("inline")             // "redirect" | "inline" | "modal"

  // Table tab: 2-level traversal
  .tab("member-companies", "Member Companies")
    .table("members")
    .through("companies")
    .columns("legalName", "sector")
    .showSourceTarget()

  // Custom tab
  .tab("analytics", "Analytics").icon("chart")
    .custom("ContactAnalytics")
    .props({ period: "12m" })

  // Richtext tab
  .tab("notes", "Notes").icon("edit")
    .richtext("notes")
    .titleAttribute("noteTitle")

  // Activity tab
  .tab("activity", "Activity").icon("clock")
    .activity()
    .limit(50)

  // Flows tab (workflow instances)
  .tab("workflows", "Workflows").icon("git-branch")
    .flows()
    .allowStart()
    .allowCancel()

  // Documents tab
  .tab("documents", "Documents").icon("file")
    .documents()

  .build();
```

**Modal views** have a single form tab without tabs UI:

```typescript
const CONTACT_MODAL = detailView("quick-edit", "Quick Edit")
  .for("contacts")
  .modal()
  .default()
  .tab("form", "Form")
    .form(group("main", "Main").fields("firstName", "lastName", "email"))
  .build();
```

**Side panel** (persistent fields alongside tab content):

```typescript
detailView("detail", "Deal Detail")
  .for("deals")
  .sidePanel({ attributes: ["assignee", "priority", "dueDate"] })
  .tab(...)
  .build();
```

### List View (Records Table / Kanban)

```typescript
import { listView } from "@stndrds/schema";

const CONTACTS_LIST = listView("default", "All Contacts")
  .for("contacts")
  .default()
  .icon("users")

  // Table tab
  .tab("all", "All Contacts")
    .columns("firstName", "lastName", "email", "company", "status")
    .columnWidth("email", 200)
    .sort("lastName", "asc")
    .default()

  // Filtered tab
  .tab("active", "Active")
    .columns("firstName", "lastName", "email")
    .filter({
      combinator: "and",
      rules: [{ attribute: "status", operator: "is", value: "active" }],
    })

  // Kanban tab
  .tab("pipeline", "Pipeline")
    .kanban("stage")                         // group by select/status attribute
    .columns("name", "amount", "company")
    .cardUserAttribute("assignee")           // user avatar on card
    .cardDateAttribute("dueDate")            // date on card

  // Create mode
  .tab("inline-create", "Quick Add")
    .columns("name", "email")
    .createMode("inline")                    // "redirect" | "inline" | "modal"

  .build();
```

**Base filter** (applied to ALL tabs):

```typescript
listView("scoped", "My Deals")
  .for("deals")
  .baseFilter({
    combinator: "and",
    rules: [{ attribute: "assignee", operator: "is", value: "{{currentUserId}}" }],
  })
  .tab("all", "All").columns("name", "stage").default()
  .build();
```

## Feature Gates on Attributes

```typescript
// Hide attribute when flag is disabled (default behavior)
text({ name: "aiSummary", label: "AI Summary" })
  .featureGate("ai-features")

// Disable attribute when tier is not enterprise
text({ name: "advancedField", label: "Advanced Field" })
  .featureGate("tier", { expectedValue: "enterprise", fallback: "disable" })
```

## Common Patterns

### CRM Contact Object

```typescript
const CONTACT = object({ name: "contacts", label: "Contact" })
  .system()
  .icon("user")
  .labelExpression("{{ firstName }} {{ lastName }}")
  .attribute(text({ name: "firstName", label: "First Name" }).required())
  .attribute(text({ name: "lastName", label: "Last Name" }).required())
  .attribute(text({ name: "email", label: "Email" }).email())
  .attribute(phone({ name: "phone", label: "Phone" }).defaultCountry("FRA"))
  .attribute(location({ name: "address", label: "Address" }).enableAutocomplete())
  .attribute(
    relation({ name: "company", label: "Company" })
      .to("companies")
      .bilateral({ inverseName: "contacts", inverseLabel: "Contacts" })
  )
  .attribute(
    status({ name: "status", label: "Status" }).options([
      { id: "lead", label: "Lead", value: "lead", color: "yellow", group: "idle" },
      { id: "active", label: "Active", value: "active", color: "green", group: "in_progress" },
      { id: "churned", label: "Churned", value: "churned", color: "red", group: "finished" },
    ])
  )
  .attribute(user({ name: "owner", label: "Owner" }))
  .attribute(file({ name: "avatar", label: "Avatar" }).maxFiles(1));
```

### Important Rules

1. Object names are kebab-case: `"contacts"`, `"order-items"`
2. Every object MUST have `.labelExpression()`
3. `.build()` only needed on the final object/view, NOT on individual attributes
4. `formula()` and `rollup()` are always read-only -- calling `.required()` throws an error
5. `.qualifyWith()` must be called AFTER `.to()`
6. `.bilateral()` must be called AFTER `.to()` and only works with a single target (not polymorphic)
7. Modal views must have exactly one form tab and no side panel
8. View and object names are validated with Zod at build time (kebab-case, max 63 chars)
