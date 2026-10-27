# Quote Form and Product Configurator Design

## Objective

Replace the mail client handoff with a real quote-request form that safely records a customer request, sends a transactional email through Resend, and includes the product options selected by the customer.

## Boundaries

The public catalogue currently contains generic commercial references and generated technical variants. It does not contain manufacturer SKU, model number, or official datasheet data for every record. The application must therefore distinguish:

- **configuration choices**: customer-selected options used to prepare a quote; and
- **verified manufacturer specifications**: data imported only from an official supplier catalogue attached to a product SKU.

The system must never label a generic option as a verified manufacturer value.

## Customer flow

1. The customer adds products and quantities to the quote basket.
2. For each item, the customer may select category-specific technical options.
3. Selecting “Demander un devis” opens a form instead of the mail client.
4. Required fields are name, email, phone, city/project, and acceptance of contact follow-up. Company and message are optional.
5. On submission, the form validates fields, sends the complete payload to a Supabase Edge Function, and displays a stable request reference only after a successful response.
6. The Edge Function records the request and its lines, sends SaddlePoint an email at `bongni@saddlepoint.org`, and sends an acknowledgement to the customer.

## Data model and access control

Create a dedicated public-request table and request-line table rather than repurposing internal sales quotes. They store contact details, status, consent timestamp, a generated public reference, selected products, quantities, and selected configuration options in JSONB.

RLS is enabled for both tables. The browser has no direct `INSERT`, `SELECT`, `UPDATE`, or `DELETE` access. The Edge Function uses the server secret key after validating the request, which keeps customer contact data and the Resend API key out of public JavaScript. A constrained anti-spam field and request validation reject malformed or automated submissions before a database insert.

## Email delivery

The `submit-quote-request` Edge Function accepts browser requests with the project publishable key, handles CORS preflight, validates the payload, inserts the request, and calls the Resend email API from the server runtime.

Supabase Edge Function secrets required in production:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL
QUOTE_RECIPIENT_EMAIL=bongni@saddlepoint.org
```

`RESEND_FROM_EMAIL` must belong to a domain verified in the SaddlePoint Resend account. The Resend API key is never exposed in source code, frontend environment variables, tests, or logs. Delivery failures are recorded with a safe public error message; the client can retry without duplicate inserts by using an idempotency key derived from the request reference.

## Product configurator

Configuration schemas are selected by product category and subcategory. Each option includes a label, key, presentation type, and allowable values. Examples include:

- breakers and protection: poles, rated-current range, voltage family, breaking-capacity range, mounting and enclosure/IP requirement;
- cables: conductor material, section, core count, insulation and length;
- automation: supply voltage, I/O, communication protocol, mounting and IP requirement;
- motors and pumps: power range, supply, speed, duty, protection/IP and mounting;
- solar and backup: rated power/capacity, system voltage, phase, autonomy target and mounting;
- lighting: power, colour temperature, mounting, dimming and IP requirement.

These controls are configuration inputs for quote preparation. They are not an official product spec table unless a supplier import supplies the manufacturer model, SKU, source URL, source date, and values.

## Supplier specification import

The verified-specification importer takes a supplier-provided CSV/XLSX export or an approved manufacturer data feed. A record may be marked verified only when it maps to a product SKU and includes source identity. Import validation rejects missing SKU, duplicate source SKU, unrecognized unit, and records whose source date is absent. Imported values render as “Caractéristiques fabricant vérifiées”; all other values render as “Options à confirmer dans le devis”.

## Verification

Tests cover browser payload validation, configuration schema selection, email payload construction, duplicate/idempotency behavior, and secret absence handling. Edge Function integration is tested with mocked external email transport. A production smoke test submits a controlled request after Resend secrets and verified sender domain are configured, then confirms both database record and recipient email delivery.
