# Bugfix — Hero image flash before admin content loads

**Status:** done
**Date:** 2026-04-20
**File touched:** `src/components/storefront/Hero.tsx`
**Owner:** Yaodaniel-locagri

---

## Problem

When loading `https://boutique-mv.com`, the hardcoded Unsplash placeholder image
(`photo-1489987707025-afc232f7ea0f`) flashes for ~200–500 ms before being replaced
by the image uploaded through the admin Hero editor.

## Root cause

`Hero.tsx` merges Convex query data on top of `DEFAULTS`:

```ts
const heroContent = useQuery(api.content.get, { section: 'hero' }); // undefined while loading
const content = { ...DEFAULTS, ...(heroContent ?? {}) };             // falls back to DEFAULTS.image
```

While `heroContent === undefined` (Convex's loading state), `content.image` resolves
to `DEFAULTS.image`, so the `<img>` is rendered with the hardcoded Unsplash URL.
When Convex returns the admin-stored content, the `src` attribute changes and the
browser swaps the image — visible as a flash.

## Fix

Suppress the `<img>` element while the query is loading so only the `bg-gray-200`
placeholder shows. Once the query resolves (with admin content or `null` →
fallback to DEFAULT), render the `<img>` with a `fade-in` animation for a smooth
appearance.

```tsx
const isLoading = heroContent === undefined;
// ...
{!isLoading && (
  <img src={content.image} alt="..." className="w-full h-full object-cover animate-fade-in" />
)}
```

## Acceptance criteria

- [x] No image is visible during the Convex `useQuery` loading window.
- [x] The grey placeholder (`bg-gray-200`) covers the image area while loading.
- [x] The admin-uploaded image fades in smoothly once the query resolves.
- [x] If no admin content exists, `DEFAULTS.image` (Unsplash) still serves as a
      fallback — preserving the previous "no setup" experience for fresh deployments.
- [x] Mobile and desktop layouts are unaffected (`aspect-[3/4]` mobile, `h-[85vh]` desktop).

## Notes

The text fields (`subtitle`, `title_line1/2/3`, `description`, `cta`, `quote`)
also fall back to `DEFAULTS` during loading, but the visual mismatch is far less
jarring for text than for a full image swap. Left as-is to avoid an empty hero
section. If desired, the same `!isLoading` guard can be lifted to the entire
content block in a follow-up.
