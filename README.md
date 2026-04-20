# DM TAK

DM TAK is a Next.js application for managing roofing and inspection projects.

The application lets authenticated users create projects, create inspection forms from reusable templates, document findings per field, upload images, organize checks by roof side, and generate PDF reports.

The codebase is written in TypeScript and uses:

- Next.js App Router
- Clerk for authentication and role metadata
- Firebase Firestore for application data
- Firebase Storage initialization in the client app
- Cloudinary for uploaded inspection images
- `@react-pdf/renderer` for PDF generation
- SASS and CSS modules-by-convention for styling
- `next-pwa` for service worker and manifest support

## Project Summary

This project appears to be an internal quality-control and inspection tool for roof work.

The workflow in the repository is centered around four core objects:

1. Users
2. Projects
3. Form templates
4. Forms created inside a project

At a high level, the flow is:

1. An authenticated user signs in with Clerk.
2. A user with the correct role enters the project area.
3. A project is created.
4. A form is created inside that project from a saved template.
5. The user fills in general inspection fields and roof-side-specific fields.
6. Images are uploaded to Cloudinary and stored as URLs on the form.
7. The form can be saved, autosaved locally, and exported as a PDF.

## Roles And Access

The repository currently uses Clerk roles stored in `user.publicMetadata.role`.

Observed roles in the code:

- `admin`
- `project`

Observed access rules:

- `/admin` is restricted to `admin` only.
- `/projects` and the project/form pages are restricted to `admin` or `project`.
- PDF generation is restricted to `admin` or `project`.
- Some API routes only require authentication and do not apply the same role checks as the UI.
- Deleting a project or form requires either `admin` or ownership of that resource.

This means the UI is role-gated, but some server routes are less strict and should be reviewed if tighter authorization is required.

## Main User Flows

### 1. Landing Page

The home page checks whether a Clerk user exists.

- Signed-out users are sent toward the sign-in flow.
- Signed-in users are sent toward the project area.

### 2. Project Management

Inside `/projects` the user can:

- View all projects
- Search projects by title
- Filter projects by owner
- Create a new project
- Open a project detail page

Inside `/projects/[id]` the user can:

- View project metadata
- View forms that belong to the project
- Create a new form from a template
- Delete the project if they are allowed to do so

### 3. Form Editing

Inside `/projects/[id]/[formId]` the user can:

- Load a form from Firestore
- Edit general inspection fields
- Add comments per field
- Upload one or more images per field
- Add new roof sides dynamically
- Add and remove custom fields inside roof-side sections
- Delete a form if they are allowed to do so
- Save manually from the header
- Generate a PDF from the header

### 4. Administration

Inside `/admin` an admin can:

- View users from Clerk
- Create a new Clerk user
- Update a user's role
- Delete a user
- Navigate to `/admin/form`

Inside `/admin/form` an admin can:

- Create a reusable form template
- Define the form type
- Define the general section title
- Add template fields for the general section

## Route Overview

### App Routes

- `/`
	Landing page
- `/sign-in/[[...sign-in]]`
	Clerk sign-in route
- `/projects`
	Project list and create-project entry point
- `/projects/[id]`
	Project details and form list
- `/projects/[id]/[formId]`
	Form editing page
- `/admin`
	Admin user management
- `/admin/form`
	Admin template creation
- `/pdf/[id]/[formId]`
	PDF-related app route area

### API Routes

#### Admin APIs

- `/api/admin/users`
	Returns Clerk users for the admin page
- `/api/admin/create-user`
	Creates a Clerk user
- `/api/admin/update-role`
	Updates `publicMetadata.role`
- `/api/admin/delete-user`
	Deletes a Clerk user
- `/api/admin/submit-template`
	Creates a form template in Firestore

#### Public And Authenticated APIs

- `/api/public/projects/get-projects`
	Returns all projects from Firestore
- `/api/public/projects/create-project`
	Creates a new project document
- `/api/public/projects/[id]`
	Fetches a project or deletes it
- `/api/public/projects/[id]/forms`
	Lists forms inside a project
- `/api/public/projects/[id]/forms/[formId]`
	Fetches, updates, or deletes a form
- `/api/public/projects/[id]/forms/[formId]/pdf`
	Generates a PDF response for a form
- `/api/public/projects/[id]/forms/[formId]/roof-sides/[roofSideId]`
	Deletes a roof side from a form
- `/api/public/forms/get-form-templates`
	Lists available form templates
- `/api/public/forms/create-form`
	Creates a new form in a project from a template
- `/api/public/upload/image`
	Uploads or deletes form images
- `/api/test`
	Simple health-check style route returning `OK`

## Data Model

The code defines the core domain types under `app/types/types.d.ts`.

### User

The app primarily relies on Clerk's user model and role metadata.

Important fields used in this repository:

- `id`
- `emailAddresses`
- `firstName`
- `lastName`
- `publicMetadata.role`

### Project

Project fields observed in code:

- `id`
- `title`
- `createdAt`
- `forms`
- `ownerId`
- `ownerName`

### Form

Form fields observed in code:

- `id`
- `title`
- `type`
- `createdAt`
- `projectId`
- `generalSectionTitle`
- `generalSection`
- `roofSides`
- `ownerId`
- `ownerName`
- `customerParticipants`
- `workerParticipants`

Supported form types in the type definitions:

- `Delbesiktning`
- `Slutbesiktning`
- `Egenkontroll`
- `Takfall`
- `Besiktningsutlåtande`

### Form Field

A field can contain:

- `title`
- `fieldId`
- `options`
- `selected`
- `comment`
- `imgUrls`
- `imgUrl`
- `_isCustom`

Observed selectable statuses:

- `Godkänt`
- `Ej godkänt`
- `Ej aktuellt`
- `Avhjälpt`
- `Ej utförd`

### Roof Side

A roof side contains:

- `id`
- `name`
- `sections`
- `_isLocal`

`_isLocal` is used client-side to preserve locally created roof sides before they are saved to the backend.

### Form Template

Templates are used to generate the general section of a new form.

Template fields observed in code:

- `id`
- `title`
- `type`
- `generalSectionTitle`
- `generalSection`
- `createdAt`
- `ownerId`

## Firestore Structure

The repository exposes collection helpers in `lib/collections.ts`.

Observed Firestore structure:

```text
users
projects
formTemplates

projects/{projectId}
projects/{projectId}/forms/{formId}
projects/{projectId}/forms/{formId}/generalFields
projects/{projectId}/forms/{formId}/roofSides/{sideId}
projects/{projectId}/forms/{formId}/roofSides/{sideId}/sections/{sectionId}
projects/{projectId}/forms/{formId}/roofSides/{sideId}/sections/{sectionId}/fields
```

Important note:

- The active CRUD logic in this repository mainly reads and writes the whole form document under `projects/{projectId}/forms/{formId}`.
- The helper functions define deeper subcollection paths, but most inspected routes work with nested arrays stored directly on the form document rather than writing every nested entity to separate documents.

## How Form Editing Works

The form editor page contains most of the application's domain logic.

### Load Path

When the form page opens, it:

1. Fetches the form from `/api/public/projects/[id]/forms/[formId]`
2. Restores any saved edits from `localStorage`
3. Restores locally saved structural changes such as unsaved roof sides
4. Builds an `edits` object keyed by `fieldId`

### Local Persistence

The page stores two local keys:

- `form-edits-${projectId}-${formId}` for field-level edits
- `form-data-${projectId}-${formId}` for the saved form structure

This prevents unsaved edits from disappearing on reload.

### Saving

When the form is saved:

1. General fields are merged with the edit state
2. Roof-side fields are merged with the edit state
3. Undefined values are removed on the API side before persistence
4. The entire form payload is `PUT` back to Firestore
5. Local cache keys are cleared after a successful save

### Autosave

The form page schedules an autosave after 180000 ms of inactivity, which is 3 minutes.

### Dynamic Roof Sides

New roof sides are created from `app/data/roofSideTemplate.ts`.

That file contains a large predefined inspection structure with sections such as:

- `Hängränna`
- `Fotränna`
- `Fotplåt`
- `Stuprör`
- `Underlagspapp`
- `Nockplanka`
- `Underbeslag`
- `Strö & Bärläkt`
- `Vindskivor`
- `Takpannor`
- `Vinkelränna`
- `Nockpannor`

This template is effectively the domain checklist for a roof-side inspection.

## Image Handling

Images are handled separately from Firestore.

### Upload Flow

1. The client posts a file to `/api/public/upload/image`
2. The backend reads the uploaded file into a buffer
3. `sharp` rotates, resizes, and compresses the image
4. Cloudinary stores the optimized image in the `forms` folder
5. The returned URL is saved on the field as `imgUrls` and `imgUrl`

### Delete Flow

1. The client calls `DELETE /api/public/upload/image`
2. The backend resolves the Cloudinary public ID from the URL
3. The asset is deleted from Cloudinary
4. The field state is updated locally on the client

### Cascading Cleanup

When a project or form is deleted, the server attempts to:

- Collect image URLs from all fields
- Resolve Cloudinary public IDs
- Delete those images from Cloudinary
- Delete the associated Firestore document

Roof-side deletion also calls a server-side action intended to remove the associated data and media.

## PDF Generation

PDF generation is implemented with `@react-pdf/renderer`.

The PDF flow is:

1. The user clicks `Generera PDF` from the header
2. The form is saved first
3. The client calls `/api/public/projects/[id]/forms/[formId]/pdf`
4. The server loads the latest form data from Firestore
5. `FormPdf` renders a PDF document in memory
6. The PDF is returned as an inline response and then downloaded in the browser

The PDF includes:

- DM TAK branding and logo
- Form type
- Creation timestamp
- Introductory inspection text in Swedish
- Participants
- General section results
- Roof-side section results
- Attached images
- Page numbering

The PDF component builds the logo URL from `APP_URL`, so that environment variable needs to match the deployed application base URL.

## Authentication And Middleware

Clerk is integrated in two main places:

- `app/layout.tsx` through `ClerkProvider`
- `proxy.ts` through `clerkMiddleware()`

The middleware matcher covers:

- all non-static app routes
- API routes

Authentication is then checked again inside layouts and API handlers with:

- `currentUser()`
- `getAuth(req)`
- `clerkClient()`

## Styling And Frontend Structure

The frontend is primarily organized under `app/`.

Important directories:

- `app/(auth)`
	Authenticated and admin-facing pages
- `app/(public)`
	Project and form pages used after sign-in
- `app/api`
	Route handlers
- `app/components`
	Reusable UI pieces
- `app/context`
	Shared UI context, including form header actions
- `app/data`
	Static inspection templates
- `app/helpers`
	Form-loading and transformation helpers
- `app/hooks`
	Local hooks, including a form edit hook that appears to be legacy or currently unused
- `app/pdf`
	PDF rendering logic
- `app/styles`
	Global styling assets
- `lib`
	Firebase setup, collection helpers, and server-side cleanup actions

The current styling approach is mostly SCSS and CSS files imported per page or component. Tailwind is installed in the repository, but the inspected application code is not primarily written in a Tailwind style.

## Environment Variables

The following variables are directly referenced in code.

### Firebase

These are read in `lib/firebase.ts`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Cloudinary

These are read in upload and delete flows:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Application URL

Used for PDF logo generation:

```env
APP_URL=
```

### Clerk

Clerk is required by the repository, although the exact variable names are not referenced directly in the inspected source files.

In practice, a standard Clerk setup for Next.js is expected, typically including variables such as:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

If your Clerk instance uses custom redirect URLs or domains, those may also be needed depending on deployment.

## Development

### Install Dependencies

```bash
npm install
```

### Run The Development Server

```bash
npm run dev
```

The scripts currently defined are:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Notes:

- The project uses `next dev --webpack`, `next build --webpack`, and `next start --webpack`.
- PWA support is disabled automatically in development.
- The app is configured with `reactStrictMode: true`.

## PWA Support

`next-pwa` is configured in `next.config.ts`.

Observed PWA-related assets and behavior:

- `public/manifest.json`
- `public/sw.js`
- `public/workbox-4754cb34.js`
- manifest metadata in the root layout
- `skipWaiting: true`
- service worker registration enabled
- disabled in development mode

## Repository Notes

A few implementation details are worth knowing before changing the code:

- The project uses Swedish content heavily in the UI and in inspection labels.
- The `roofSideTemplate.ts` file contains a large part of the business checklist and should be treated as domain data, not just UI text.
- Form persistence is document-based and not deeply normalized in the currently active flows.
- Image URLs are stored on fields and cleaned up on delete using best-effort Cloudinary deletion.
- The header action buttons for save and PDF generation are controlled through React context.

## Known Gaps And Risks

These are not necessarily bugs, but they are important observations from the inspected code:

- Authorization is not completely uniform across all API routes.
- The projects list API currently returns all projects for any authenticated user.
- Firestore security rules are not present in this repository, so the actual backend security posture cannot be confirmed from code here.
- Firebase Storage is initialized, but the inspected image upload flow uses Cloudinary rather than Firebase Storage.
- A dedicated `useFormEdits` hook exists, but the active form page appears to implement its own editing logic instead.
- There are no automated tests visible in this repository. The only obvious verification endpoint is `/api/test`.

## Suggested Onboarding Order

If you are new to the repository, start here:

1. Read `app/layout.tsx` and `proxy.ts` to understand auth and global app setup.
2. Read `app/(public)/projects/page.tsx` and `app/(public)/projects/[id]/page.tsx` to understand the project flow.
3. Read `app/(public)/projects/[id]/[formId]/page.tsx` to understand the main editing logic.
4. Read `app/helpers/formHelpers.ts` and `app/data/roofSideTemplate.ts` to understand how form structure is generated and saved.
5. Read `app/api/public/projects/[id]/forms/[formId]/route.ts` and `app/api/public/upload/image/route.ts` to understand persistence and media handling.
6. Read `app/pdf/FormPdf.tsx` and `app/api/public/projects/[id]/forms/[formId]/pdf/route.tsx` to understand report generation.

## Short Version

This is a role-based inspection system for DM TAK.

It uses Clerk for authentication, Firestore for projects/forms/templates, Cloudinary for images, and React PDF for report generation. The most important runtime behavior lives in the project pages, the form editor, and the API routes that save forms and manage images.
