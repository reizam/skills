---
description: Form system -- builder API, prefill expressions, submission lifecycle, and UI components for multi-step data collection.
---

# Form System

Use this skill when building/modifying forms, form definitions, prefill expressions, form submissions, or form UI components in the @stndrds monorepo.

## Architecture Overview

The form system has four layers:

1. **Schema** (`@stndrds/schema`) -- Type definitions and fluent builder API
2. **Runtime** (`@stndrds/runtime`) -- FormService, PrefillExpressionResolver
3. **React hooks** (`@stndrds/react`) -- TanStack Query hooks for CRUD + submissions
4. **UI** (`@stndrds/ui`) -- FormFlow multi-step renderer, FormEditor

## FormDefinition

```typescript
interface FormDefinition {
  id?: Uuid;
  name: string;           // kebab-case identifier
  label: string;
  description?: string;
  icon?: IconName;
  status: FormStatus;     // "draft" | "published" | "archived"
  version: number;
  slots: FormSlot[];      // Objects manipulated
  steps: FormStep[];      // Sequential steps with rows
  metadata?: Record<string, unknown>;
}
```

### Slots

Slots define which objects participate in the form:

```typescript
interface FormSlot {
  id: string;
  objectName: string;      // e.g., "contacts", "companies"
  label: string;
  mode: SlotMode;
  color?: ColorId;
  icon?: IconName;
}

type SlotMode = "create" | "select" | "optional" | "create_if_not_empty";
```

Slot modes:
- `"create"` -- Always create a new record on submit
- `"select"` -- User selects an existing record (updates it on submit)
- `"optional"` -- User can select existing or create new
- `"create_if_not_empty"` -- Create only if at least one field was filled

### Steps and Rows

Each step contains rows. Rows are a union type:

```typescript
interface FormStep {
  id: string;
  label: string;
  description?: string;
  rows: FormRow[];
}

type FormRow = FormFieldsRow | FormHeadingRow | FormSeparatorRow | FormTextRow;
```

- `FormFieldsRow` -- Contains `FormFieldRef[]` (one or more fields side-by-side)
- `FormHeadingRow` -- Section heading with optional level (1|2|3)
- `FormSeparatorRow` -- Visual horizontal divider
- `FormTextRow` -- Static instructional text

### Field References

Two types of fields:

```typescript
// References an attribute on a slot's object (persisted on the record)
interface FormSlotFieldRef {
  type: "slot";
  slotId: string;
  attribute: string;
  label?: string;
  tooltip?: string;
  required?: boolean;
}

// Defines an inline ad-hoc attribute (not persisted on any object)
// Supports prefillExpression to auto-populate from slot data
interface FormFreeFieldRef {
  type: "free";
  attribute: Attribute;       // Full attribute definition
  label?: string;
  tooltip?: string;
  required?: boolean;
  prefillExpression?: string; // Template referencing slot data via {{ slotId.attr }}
}
```

**Forbidden attribute types for free fields:** `relation`, `multiRelation`, `formula`, `rollup`, `file`, `document`, `richtext`, `user`

## Form Builder API (Fluent)

```typescript
import { form } from "@stndrds/schema";

const CONTACT_FORM = form("contact-collection", "Collect Contact Info")
  .description("Multi-step contact form")
  .icon("Users")

  // Slots (at least 1 required)
  .slot("contact", "contacts", { label: "Contact", mode: "create" })
  .slot("company", "companies", { label: "Company", mode: "optional" })

  // Step 1 — flat fields (one field per row, auto-generated row IDs)
  .step("step-1", "Personal Info")
    .field("contact", "firstName")
    .field("contact", "lastName", { required: true })
    .field("contact", "email", { required: true })

  // Step 2 — row-based layout (fields side-by-side)
  .step("step-2", "Company Info")
    .heading("Company Details", 1)
    .text("Fill in the company information if applicable.")
    .row("r1")
      .field("company", "name")
      .field("company", "siret")
    .endRow()
    .separator()
    .row("r2")
      .field("company", "address")
    .endRow()

  .build(); // Validates and returns FormDefinition
```

### Builder Methods

**FormBuilder** (top-level):
- `.description(text)` -- Form description
- `.icon(name)` -- Lucide icon name
- `.status(status)` -- Initial status
- `.metadata(obj)` -- Arbitrary metadata
- `.slot(id, objectName, options)` -- Add a slot
- `.step(id, label)` -- Start a new step (returns FormStepBuilder)
- `.build()` -- Validate and return FormDefinition

**FormStepBuilder** (inside a step):
- `.description(text)` -- Step description
- `.field(slotId, attribute, options?)` -- Add a single-field row
- `.freeField(attributeBuilder, options?)` -- Add an inline attribute field
- `.row(id)` -- Start a multi-field row (returns FormRowBuilder)
- `.heading(content, level?)` -- Add a heading row
- `.text(content)` -- Add a text row
- `.separator()` -- Add a separator row
- `.step(id, label)` -- Finalize this step and start a new one
- `.build()` -- Finalize step and build the form

**FormRowBuilder** (inside a row):
- `.field(slotId, attribute, options?)` -- Add a field to this row
- `.freeField(attributeBuilder, options?)` -- Add an inline attribute
- `.endRow()` -- Return to step builder
- `.row(id)` -- Finalize this row and start a new one (shortcut)
- `.heading()` / `.separator()` / `.text()` -- Finalize row and add layout element

### Slot Field Options

```typescript
// .field(slotId, attribute, options?)
{
  label?: string;          // Override attribute label
  required?: boolean;      // Mark as required for validation
  tooltip?: string;        // Help text tooltip
}
```

### Free Field Options

```typescript
// .freeField(attributeBuilder, options?)
{
  label?: string;          // Override attribute label
  required?: boolean;      // Mark as required for validation
  prefillExpression?: string; // Template for initial value (see Prefill section)
}
```

### Builder Validation (`.build()`)

1. **Name format**: kebab-case, 1-63 chars
2. **At least 1 slot** and **at least 1 step**
3. **Slot references**: All field `slotId` values reference existing slots
4. **Free field types**: No forbidden attribute types
5. **Prefill expressions**: Valid syntax with known pipes

## Prefill Expressions

Prefill expressions automatically populate **free fields** when a submission is created. They use mustache-style `{{ }}` syntax with a **slotId prefix** to reference data from any slot. Evaluated **server-side once** during `FormService.createSubmission()`.

**Why free fields?** Free fields are not persisted on any object -- they are ad-hoc fields for aggregating, formatting, and contextualizing data from multiple slots. Prefill expressions seed them with structured data from slots so users can freely edit the text (e.g., for AI agents to process).

### Syntax

Every `{{ }}` block starts with a **slotId** to identify which slot's data to read:

```
{{ slotId.attrName }}                                  -- Simple attribute from a slot
{{ slotId.relationName.label }}                        -- Labels of related records
{{ slotId.relationName.attrName }}                     -- Attribute values from related records
{{ slotId.relationName.label | PIPE }}                 -- Apply pipe to each value
{{ slotId.relationName.label | PIPE | join:"sep" }}    -- Join collection into string
```

### Examples

```typescript
import { attribute } from "@stndrds/schema";

// Simple attribute from a slot
.freeField(attribute("synthese").text(), {
  prefillExpression: "{{ client.firstName }} {{ client.lastName }}"
})

// All related record labels, one per line
.freeField(attribute("synthese").textarea(), {
  prefillExpression: "{{ client.patrimoine.label | join:\"\\n\" }}"
})

// Bullet list format
.freeField(attribute("synthese").textarea(), {
  prefillExpression: "- {{ client.patrimoine.label | join:\"\\n- \" }}"
})

// Specific attribute from related records
.freeField(attribute("adresses").textarea(), {
  prefillExpression: "{{ client.patrimoine.adresse | join:\", \" }}"
})

// Static text + dynamic expression
.freeField(attribute("synthese").textarea(), {
  prefillExpression: "Biens du client:\\n- {{ client.patrimoine.label | join:\"\\n- \" }}"
})

// Chained pipes (scalar applied per-item, then join)
.freeField(attribute("synthese").textarea(), {
  prefillExpression: "{{ client.patrimoine.label | UPPER | join:\"\\n\" }}"
})

// Multi-slot: reference data from different slots
.freeField(attribute("recap").textarea(), {
  prefillExpression: "Client: {{ client.firstName }}\\nEntreprise: {{ company.name }}"
})

// Single relation (no join needed)
.freeField(attribute("notes").textarea(), {
  prefillExpression: "Contact principal : {{ client.contact.label }}"
})
```

### Available Pipes

**Scalar pipes** (applied per-item for collections):

| Pipe | Description | Example |
|------|-------------|---------|
| `UPPER` | Uppercase | `"john"` -> `"JOHN"` |
| `LOWER` | Lowercase | `"JOHN"` -> `"john"` |
| `capitalize` | Capitalize each word | `"john doe"` -> `"John Doe"` |
| `trim` | Trim whitespace | `" abc "` -> `"abc"` |
| `prefix:"text"` | Add prefix (empty-safe) | `"CEO"` -> `", CEO"` |
| `suffix:"text"` | Add suffix (empty-safe) | `"Acme"` -> `"Acme Inc."` |
| `wrap:"pre" "suf"` | Wrap (empty-safe) | `"CEO"` -> `"(CEO)"` |
| `default:"text"` | Fallback if empty | `""` -> `"N/A"` |

**Collection pipe** (applied last):

| Pipe | Description |
|------|-------------|
| `join:"separator"` | Join array into string. Use `\n` for newlines. |

### Pipe Execution Order

1. For each `{{ }}` block, parse `slotId.attrPath` and pipes
2. Look up the slot's values and object definition
3. Resolve values (simple attribute OR relation labels/values)
4. For collections: apply scalar pipes to **each item** individually
5. Apply `join` pipe last to concatenate into a single string
6. For single relations: apply scalar pipes and return directly

### Key Rules

- **Free fields only**: `prefillExpression` is on `FormFreeFieldRef`, not on slot fields. Slot fields read/write directly to object attributes.
- **Multi-slot**: Expressions can reference **any slot** via `{{ slotId.attr }}`. A single expression can mix data from different slots.
- **One-shot evaluation**: Prefill runs once at `createSubmission()`. It does NOT re-trigger on subsequent edits.
- **Empty-safe**: If all `{{ }}` blocks resolve to empty, the entire expression returns `null` (avoids orphan static text).
- **Never overwrites**: Only fills fields that are `undefined` or `""`. Existing values are preserved.
- **Server-side only**: No client-side resolution needed. The UI receives pre-filled values via `stepValues` with key `free.{attrName}`.

### Attribute Reference Patterns

| Pattern | Resolves to |
|---------|-------------|
| `{{ slotId.attrName }}` | Simple attribute on the slot's record |
| `{{ slotId.relationName.label }}` | Labels of all linked records via that relation |
| `{{ slotId.relationName.attrName }}` | Specific attribute from all linked records |

## Form Service (`runtime`)

Backend service managing the full form lifecycle.

### Form CRUD

```typescript
class FormService {
  getAllForms(params?: { status?: FormStatus; publishedOnly?: boolean }): Promise<FormDefinition[]>
  getFormById(id: string): Promise<FormDefinition | null>
  getFormByName(name: string): Promise<FormDefinition | null>
  createForm(input: CreateFormInput): Promise<FormDefinition>
  updateForm(id: string, input: UpdateFormInput): Promise<FormDefinition>
  deleteForm(id: string): Promise<void>       // Throws on system forms
  publishForm(id: string): Promise<FormDefinition>
  archiveForm(id: string): Promise<FormDefinition>
  duplicateForm(id: string, input?: { name?: string; label?: string }): Promise<FormDefinition>
}
```

### Submission Lifecycle

```typescript
class FormService {
  // 1. Create submission (triggers enrichment + prefill)
  createSubmission(
    formId: string,
    createdBy?: string,
    initialSlotValues?: Record<string, Record<string, unknown>>
  ): Promise<FormSubmission>

  // 2. Save step (no validation, no advancement)
  saveStep(submissionId: string, stepIndex: number, values: Record<string, unknown>): Promise<FormSubmission>

  // 3. Advance step (validates required fields, moves to next step)
  advanceStep(submissionId: string, stepIndex: number, values: Record<string, unknown>): Promise<FormSubmission>

  // 4. Go back to previous step
  goBackStep(submissionId: string): Promise<FormSubmission>

  // 5. Submit form (creates/updates records, emits agent event)
  submitForm(submissionId: string): Promise<FormSubmission>

  // Archive/unarchive
  archiveSubmission(submissionId: string): Promise<FormSubmission>
  unarchiveSubmission(submissionId: string): Promise<FormSubmission>

  // Queries
  getSubmission(id: string): Promise<FormSubmission | null>
  getSubmissionsByForm(formId: string): Promise<FormSubmission[]>
  getSubmissionsByRecord(recordId: string, opts?: { includeArchived?: boolean }): Promise<FormSubmission[]>
}
```

### createSubmission Data Flow

```
1. enrichSlotValues()
   → For each slot with { id }, fetch the record's full data
   → Merge record.values into slotValues

2. distributeSlotValuesToSteps()
   → Map slotValues to per-step format using namespaced keys
   → Key format: "slotId.attributeName"

3. applyPrefillExpressions()
   → For each free field with prefillExpression where value is empty:
     → Build multi-slot PrefillContext with all slot values + object definitions
     → Resolve {{ slotId.attr }} expressions via RelationService
     → Return per-step values keyed by "free.attrName"
   → Requires: RelationService + ObjectSchemaService injected

4. mergeStepValues()
   → Merge slot step values + prefill step values
   → Store submission with combined stepValues + slotValues
```

### submitForm Record Processing

On submission, records are created/updated based on slot modes:

| Mode | Behavior |
|------|----------|
| `create` | Always creates a new record |
| `create_if_not_empty` | Creates only if at least one attribute has data |
| `select` | Updates the selected existing record (partial update) |
| `optional` | Updates if record was selected, creates if new data provided |

After record processing, emits a `form.submitted` agent event via `adapter.notify`.

### FormService Dependencies

```typescript
interface FormServiceOptions {
  recordService?: RecordService;      // For enrichment + record creation
  relationService?: RelationService;  // For prefill relation resolution
  objectSchemaService?: ObjectSchemaService; // For prefill object lookups
  systemForms?: FormDefinition[];     // Code-defined protected forms
}
```

## React Hooks

```typescript
import {
  useGetForm, useListForms, useCreateForm, useUpdateForm,
  useDeleteForm, usePublishForm, useArchiveForm, useDuplicateForm,
  useCreateSubmission, useGetSubmission, useGetSubmissionsByRecord,
  useSaveFormStep, useAdvanceFormStep, useGoBackFormStep,
  useSubmitFormFill, useArchiveSubmission,
} from "@stndrds/react";
```

### Query Keys

```typescript
import { formsKeys } from "@stndrds/react";

formsKeys.all()              // ["forms"]
formsKeys.lists()            // ["forms", "list"]
formsKeys.list(params)       // ["forms", "list", params]
formsKeys.details()          // ["forms", "detail"]
formsKeys.detail(formId)     // ["forms", "detail", formId]
formsKeys.byName(name)       // ["forms", "name", name]
```

Always use `formsKeys` -- never ad-hoc query key arrays.

## UI Components

### FormFlow

Multi-step form renderer:

```tsx
<FormFlow
  definition={formDefinition}
  submission={formSubmission}
  objects={objectDefinitions}
  onSubmitSuccess={(submission) => console.log("Done")}
  disabled={false}
  renderFooter={(navButtons) => <StickyFooter>{navButtons}</StickyFooter>}
  flushRef={flushRef}
/>
```

Features:
- Renders current step based on `submission.currentStepIndex`
- Validates required fields before advancing
- Supports row-based field layouts (fields side-by-side)
- Renders headings, text, and separators between field rows
- Navigation: Back / Continue / Submit buttons
- Progress indicator
- `flushRef` for persisting pending changes before unmount

### Form Sync (Registry Seeding)

System forms defined in code can be synced to the database:

```typescript
import { seedRegistryForms } from "@stndrds/runtime";

await seedRegistryForms(adapter, formRegistry, { verbose: true });
```

Version-aware: INSERT new forms, UPDATE changed versions, SKIP unchanged.

## Complete Example

```typescript
import { form, attribute } from "@stndrds/schema";

const FICHE_PATRIMONIALE = form("fiche-patrimoniale", "Fiche Patrimoniale")
  .description("Collect client asset information with prefilled synthesis")
  .icon("Landmark")

  .slot("client", "contacts", { label: "Client", mode: "select" })
  .slot("fiche", "fiches-patrimoniales", { label: "Fiche", mode: "create" })

  // Step 1 — Slot fields (read/write to the object's attributes)
  .step("step-1", "Client Information")
    .heading("Identity", 1)
    .row("name")
      .field("client", "firstName")
      .field("client", "lastName")
    .endRow()
    .row("contact")
      .field("client", "email")
      .field("client", "phone")
    .endRow()

  // Step 2 — Free fields with prefill (ad-hoc text, pre-populated from slot data)
  .step("step-2", "Asset Synthesis")
    .heading("Synthesis", 1)
    .text("Review and edit the automatically generated synthesis below.")
    .freeField(attribute("synthese").textarea(), {
      label: "Asset Summary",
      prefillExpression: "Biens du client:\\n- {{ client.patrimoine.label | join:\"\\n- \" }}"
    })
    .freeField(attribute("adresses").textarea(), {
      label: "Addresses",
      prefillExpression: "{{ client.patrimoine.adresse | join:\"\\n\" }}"
    })

  .build();

export default FICHE_PATRIMONIALE;
```

## Key Files

### Schema
- `/packages/schema/src/builders/form-builder.ts` -- Fluent builder API
- `/packages/schema/src/types/forms/definition.ts` -- FormDefinition, FormSlot, FormStep
- `/packages/schema/src/types/forms/fields.ts` -- FormSlotFieldRef, FormFreeFieldRef
- `/packages/schema/src/types/forms/rows.ts` -- FormRow union (fields, heading, separator, text)
- `/packages/schema/src/lib/template.ts` -- Pipe engine (applyPipes, renderLabelExpression)

### Runtime
- `/packages/runtime/src/services/form.service.ts` -- FormService
- `/packages/runtime/src/services/prefill-resolver.ts` -- PrefillExpressionResolver
- `/packages/runtime/src/form-sync.ts` -- Registry seeding
- `/packages/runtime/src/template.ts` -- extractAllRelationIds helper

### UI
- `/packages/ui/src/components/form-flow/form-flow.tsx` -- FormFlow component
- `/packages/ui/src/components/form-editor/` -- Form definition editor

### React
- `/packages/react/src/client/forms-api.ts` -- API SDK + hooks
- `/packages/react/src/lib/forms-keys.ts` -- Query key factory

### Tests
- `/packages/schema/tests/builders/form-builder.test.ts` -- Builder validation
- `/packages/runtime/tests/services/form.service.test.ts` -- Service tests
- `/packages/runtime/tests/services/prefill-resolver.test.ts` -- Prefill expression tests
- `/packages/runtime/tests/form-sync.test.ts` -- Sync tests
