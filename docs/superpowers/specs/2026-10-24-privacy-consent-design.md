# Privacy Consent and Location Collection Design

**Scope:** Phase 3a of production hardening.

## Goal

Stop automatic collection and browser-local caching of IP/location data while preserving an explicit, optional security-location feature.

## Consent model

- Sign-in and registration each show an unchecked consent control. When selected, the user authorizes a one-time request to the public IP/geolocation services for that authentication event.
- Without consent, authentication proceeds normally and the application does not call `api.ipify.org` or `ipapi.co`; no IP or location is stored in profile/session/notification records.
- Registration address auto-fill no longer invokes browser geolocation on form open. A separate visible “use my current location” action is the only path to `navigator.geolocation` and reverse geocoding.
- Account location widgets do not collect automatically. They begin empty and offer an explicit request button with a short explanation.
- IP-location responses are not cached in `localStorage`.

## Architecture

`src/utils/ipLocation.ts` exposes a pure, dependency-injectable `collectLocationData(consent, services)` helper. It returns null fields without invoking dependencies when consent is false. `AuthContext` consumes that helper when constructing profile, session, and notification data. The login modal holds consent only in form state; the application does not persist consent or location locally.

Existing stored historical login-location data remains viewable in the account UI because it is server-side history. The current-location UI changes from automatic detection to a user-initiated request.

## Testing

Unit tests prove consent-free collection performs no location/IP calls, consented collection returns both values, and the canonical location function no longer reads/writes its legacy localStorage cache. Existing test, type-check, and production build gates remain required.

## Constraints

- No Supabase schema, RLS, or live environment changes.
- No new dependencies.
- Do not weaken authentication when consent is declined.
- Do not store raw location/IP data in client-side storage.
