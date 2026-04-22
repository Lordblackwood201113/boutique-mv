# Bugfix — Hero text flash before admin content loads

**Status:** done
**Date:** 2026-04-20
**File touched:** `src/components/storefront/Hero.tsx`
**Owner:** Yaodaniel-locagri
**Related:** Sibling fix `bugfix-hero-image-flash-2026-04-20.md` (image flash, same root cause)

---

## Problem

When loading `https://boutique-mv.com`, the hero text fields briefly display the
hardcoded `DEFAULTS` ("Collection 2025", "Esthétique du Quotidien.", description,
"Explorer le catalogue", quote) before being replaced by the values configured
in the admin Hero editor.

## Root cause

Same as the image flash bug. `Hero.tsx` merges Convex query data on top of `DEFAULTS`:

```ts
const heroContent = useQuery(api.content.get, { section: 'hero' }); // undefined while loading
const content = { ...DEFAULTS, ...(heroContent ?? {}) };             // falls back to DEFAULTS for every field
```

While `heroContent === undefined`, every text field resolves to `DEFAULTS.*`,
so the page renders with the hardcoded copy. When Convex returns the admin-stored
content the strings change in place — visible as a flash on slow connections.

The previous bugfix (`bugfix-hero-image-flash-2026-04-20.md`) already addressed
the image but explicitly left the text fields as a follow-up.

## Fix

Hide the text content during the loading window by toggling `opacity-0` on the
two content blocks (left content + floating quote card). The DOM still contains
the placeholder text so the layout is reserved (no CLS), but the user does not
see the DEFAULTS strings. Once `heroContent` resolves, the blocks fade in via
`animate-fade-in` (left) / `opacity-100` (quote), revealing the admin values.

```tsx
const isLoading = heroContent === undefined;
// Left content
<div
  className={`flex-1 z-10 flex flex-col items-start ${isLoading ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}
  aria-busy={isLoading}
>...</div>
// Floating quote card
<div
  className={`... ${isLoading ? 'opacity-0' : 'opacity-100'}`}
  aria-busy={isLoading}
>...</div>
```

`aria-busy` signals to assistive tech that the content is still loading and
should not be announced yet.

## Acceptance criteria

- [x] No DEFAULTS text is visible during the Convex `useQuery` loading window.
- [x] Layout space is reserved during loading (no Cumulative Layout Shift).
- [x] Admin-configured text fades in once Convex returns the hero content.
- [x] Screen readers receive an `aria-busy="true"` hint during loading.
- [x] DEFAULTS still serves as a fallback when no admin content exists (preserves
      the original "no setup" experience for fresh deployments).
- [x] The decorative "Boutique MV" badge is unaffected (it is hardcoded, not
      sourced from admin content).

## Notes

The decorative right-side badge ("Boutique MV") is intentionally left out of the
opacity guard because its text is not driven by `content.*` and therefore does
not flash.

If the team later prefers explicit skeleton bars instead of an empty space
during loading, the `opacity-0` block can be replaced with skeleton placeholders
matching the title / description / button shapes. The current approach is the
minimum-diff fix that eliminates the flash.
