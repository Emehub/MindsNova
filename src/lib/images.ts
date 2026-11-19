/**
 * Default photography, served from Unsplash (free to use under the Unsplash
 * License, no attribution required). These are used only when no image has
 * been uploaded in the admin, so real MindsNova photos always take priority.
 * To swap a photo, replace its Unsplash photo id.
 */
type Photo = { src: string; alt: string };

const unsplash = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&q=75&w=${w}${h ? `&h=${h}` : ""}`;

export const PHOTOS = {
  hero: { src: unsplash("1655720348590-c739c860beed", 900, 1125), alt: "Young people sitting together outdoors, working on laptops" },
  about: { src: unsplash("1655720357872-ce227e4164ba", 1200, 900), alt: "Three young women talking together around a laptop" },
  speaker: { src: unsplash("1624499843552-7347d9f6d285", 1200, 900), alt: "A woman speaking to an audience with a microphone" },
} satisfies Record<string, Photo>;

/** Photos that rotate in the homepage hero (portrait crops). */
export const HERO_SLIDES: Photo[] = [
  PHOTOS.hero,
  { src: unsplash("1653669486397-b802144ae64a", 900, 1125), alt: "A young professional woman standing by her desk with a laptop" },
  { src: unsplash("1645620766046-b129a9c5f658", 900, 1125), alt: "A young man and woman learning together on a laptop" },
  { src: unsplash("1573497701240-345a300b8d36", 900, 1125), alt: "Young professionals in a meeting around a table" },
];

const CATEGORY_PHOTOS: Record<string, Photo> = {
  "ai-talks": { src: unsplash("1675250719891-37d4747c9e3d", 900, 600), alt: "A young woman working on a laptop at a technology event" },
  "career-readiness": { src: unsplash("1573496799515-eebbb63814f2", 900, 600), alt: "A confident young professional woman smiling" },
  mentorship: { src: unsplash("1573497491208-6b1acb260507", 900, 600), alt: "Two women in conversation at a table" },
  "entry-level-jobs": { src: unsplash("1645620766046-b129a9c5f658", 900, 600), alt: "A young man and woman looking at a laptop together" },
  "computer-literacy": { src: unsplash("1716654718430-c7f54c3125c8", 900, 600), alt: "A young woman smiling while using a laptop" },
  "workplace-skills": { src: unsplash("1573164574397-dd250bc8a598", 900, 600), alt: "Three women in a meeting in a bright office" },
};

export function categoryPhoto(slug: string): Photo | undefined {
  return CATEGORY_PHOTOS[slug];
}
