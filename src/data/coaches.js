// ============================================================================
// COACHES  —  ADD REAL COACHES ONLY.
// This starts EMPTY on purpose — the site never invents staff.
// To add a coach, copy the template below into the `coaches` array and fill it.
// Optional fields left as '' or [] are hidden automatically on the page.
// ============================================================================

/*  ── COACH TEMPLATE (copy me) ─────────────────────────────────────────────
{
  id: 'c01',
  slug: 'coach-name',                       // lowercase-with-dashes - /coaches/coach-name
  name: { en: '', ar: '' },
  role: { en: 'Head Coach', ar: 'المدرب الرئيسي' },
  nationality: { en: '', ar: '' },
  organization: { en: '', ar: '' },
  experienceYears: 0,
  languages: { en: ['English', 'Arabic'], ar: ['الإنجليزية', 'العربية'] },
  bio: { en: '', ar: '' },
  philosophy: { en: '', ar: '' },
  experience: { en: [], ar: [] },           // list of roles/history
  achievements: { en: [], ar: [] },
  certifications: { en: [], ar: [] },
  specialties: { en: [], ar: [] },
  image: '/images/coaches/coach-name.jpg',  // profile
  actionImage: '',                          // optional on-court photo
  social: { instagram: '', youtube: '' },   // empty = hidden
  reel: '',                                  // YouTube URL (optional)
  cv: '',                                    // /downloads/coach-name-cv.pdf (optional)
  available: true,
  seoTitle: { en: '', ar: '' },
  seoDescription: { en: '', ar: '' }
}
─────────────────────────────────────────────────────────────────────────── */

export const coaches = [];

export const getCoach = (slug) => coaches.find((c) => c.slug === slug);
export const availableCoaches = () => coaches.filter((c) => c.available !== false);
