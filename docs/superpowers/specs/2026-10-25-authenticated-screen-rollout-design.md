# Authenticated Screen Rollout Design

## Purpose

Extend the approved SaddlePoint premium design system through every authenticated screen without changing routes, role permissions, data contracts, calculations, or business workflows.

## Scope

The work covers these existing screen families:

- Staff operations: articles, services, sales, stock, clients, suppliers, stores, promotions, and commercial workspace.
- Client workspace: dashboard, catalogue shop, orders, favourites, quotes, loyalty, and profile.
- Management: staff dashboard, analytics, visitor analytics, accounting, and reports.
- Administration: users, security, settings, image management, notifications, support, tasks, documents, company configuration, and audit views.
- Shared overlays: form dialogs, product details, upload interfaces, chat surfaces, loading, empty, error, and permission-denied states.

Public pages, public navigation information architecture, auth behaviour, routes, RBAC, data fetching, and business rules are explicitly out of scope.

## Design System Application

All screens use the established visual foundation:

- Manrope is the body typeface; Sora is reserved for page titles and short section headings; Ethnocentric remains wordmark-only.
- Off-white content canvases, white panels, thin neutral borders, small radii, and restrained elevation replace oversized rounded cards and broad gradients.
- Blue communicates primary navigation and productive actions. Red is limited to priority calls to action, destructive actions, alerts, and count emphasis.
- Lucide icons replace emojis and decorative symbols in structural UI.
- Existing loading, empty, error, and disabled states receive readable, role-appropriate presentation rather than bare text or isolated spinners.
- Focus indication, keyboard operation, 44px practical mobile targets, contrast, and reduced-motion preference remain mandatory.

## Shared Screen Primitives

The rollout introduces presentational primitives only. They do not own data or navigation:

- `AppPageHeader`: title, short description, optional breadcrumb/detail, and primary/secondary action area.
- `AppToolbar`: search, filters, view controls, bulk actions, and responsive action overflow.
- `MetricCard`: a compact labelled value, optional comparison, and an explicit semantic status or trend.
- `AppPanel`: common white surface with heading, optional action slot, and consistent padding.
- `DataState`: standard empty, loading, and recoverable-error treatment with an optional action.
- `StatusBadge`: neutral, success, warning, info, and destructive variants applied consistently to tables and cards.

The primitives use composition and class names only; views retain their existing state, providers, callbacks, and domain components.

## Screen Family Treatment

### Staff Operations

Catalogue, service, inventory, CRM, sales, supplier, store, promotion, and commercial screens use the same sequence: page header, high-value metrics when present, toolbar, and a responsive working surface. Tables retain their current columns and actions but gain stable headers, deliberate row density, aligned numeric data, readable empty states, and explicit status badges. Forms retain field names and submit behaviours while grouping related fields into compact sections with a predictable footer for cancel/save actions.

### Client Workspace

Client screens prioritise the active task. The shop retains browsing and cart behaviour but receives an editorial catalogue header, disciplined product cards, and clear filter grouping. Orders, quotes, favourites, loyalty, and profile use compact account summaries followed by the existing content or actions. Client dashboard metrics become direct links to the appropriate existing workflow where navigation is already supplied.

### Management and Administration

Dashboards make the most important measures scannable before charts and activity lists. Analytics, reports, accounting, and visitor views preserve their charts, exports, and filters while moving them into panels with concise hierarchy. Users, security, settings, image management, notifications, support, tasks, documents, company information, and audit interfaces use page headers, aligned settings groups, and standard data states without exposing new administrative actions.

### Overlays and Feedback

Existing dialogs adopt a consistent header, close control, body rhythm, and fixed action footer. Product detail and image/upload panels maintain their existing behaviour. Chat widgets keep their existing message and authorization logic but use the same surface, type, and action treatment. The approved startup loading screen remains the reference for full-page loading; in-view loading uses `DataState` instead of a page-level replacement.

## Responsive Behaviour

Desktop toolbars keep primary actions visible and move secondary actions into available overflow patterns only where the current component already supports them. Narrow layouts stack page-header actions, make filter rows horizontally resilient, and allow tables to scroll inside their own surface rather than breaking page width. Cards reduce from multi-column layouts to a single readable column without hiding data.

## Delivery Sequence

1. Build shared presentation primitives and their focused tests.
2. Apply them to dashboard, analytics, reports, and client workspace.
3. Apply them to staff operations and their form dialogs.
4. Apply them to administration, settings, security, media, and communication interfaces.
5. Verify all routes remain reachable for their existing roles and run the full test, type, lint, and production-build suite.

## Acceptance Criteria

- Every authenticated view rendered by `App.tsx` uses the premium page and surface hierarchy, either directly or through an existing specialized view.
- No role, route, data call, CRUD action, export, calculation, or permission check changes.
- Tables, forms, dialogs, loading, empty, error, and permission-denied states use consistent visual and accessibility treatment.
- Mobile layouts preserve available actions and do not create horizontal page overflow.
- The complete test suite, TypeScript check, lint, and production build pass.
