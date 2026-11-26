/**
 * Default photography, stored in public/photos so it never depends on another
 * website. Originally from Unsplash (free to use under the Unsplash License, no
 * attribution required). These are used only when no image has been uploaded
 * in the admin, so real MindsNova photos always take priority.
 * To swap a photo, replace the file in public/photos (keep the same name).
 */
type Photo = { src: string; alt: string };

const local = (name: string) => `/photos/${name}.webp`;

export const PHOTOS = {
  hero: { src: local("hero-1"), alt: "Young people sitting together outdoors, working on laptops" },
  about: { src: local("about-who-we-are"), alt: "Three young women talking together around a laptop" },
  speaker: { src: local("career-talks-speaker"), alt: "A woman speaking to an audience with a microphone" },
} satisfies Record<string, Photo>;

/** Photos shown beside the title at the top of inner pages. */
export const PAGE_PHOTOS = {
  about: { src: local("banner-about"), alt: "A smiling team of young professionals standing together" },
  careerTalks: { src: local("banner-career-talks"), alt: "A woman giving a talk at a presentation" },
  getInvolved: { src: local("banner-get-involved"), alt: "Professionals in a meeting around a table" },
  programs: { src: local("banner-programs"), alt: "Young professionals learning together at a long table with laptops" },
  events: { src: local("banner-events"), alt: "A large audience at a conference" },
  contact: { src: local("banner-contact"), alt: "Two women chatting happily at a table" },
  apply: { src: local("banner-apply"), alt: "Two young women with laptops smiling together" },
} satisfies Record<string, Photo>;

/** Photos that rotate in the homepage hero. */
export const HERO_SLIDES: Photo[] = [
  PHOTOS.hero,
  { src: local("hero-2"), alt: "A young professional woman standing by her desk with a laptop" },
  { src: local("hero-3"), alt: "A young man and woman learning together on a laptop" },
  { src: local("hero-4"), alt: "Young professionals in a meeting around a table" },
];

const CATEGORY_PHOTOS: Record<string, Photo> = {
  "ai-talks": { src: local("program-ai-talks"), alt: "A young woman working on a laptop at a technology event" },
  "career-readiness": { src: local("program-career-readiness"), alt: "A confident young professional woman smiling" },
  mentorship: { src: local("program-mentorship"), alt: "Two women in conversation at a table" },
  "entry-level-jobs": { src: local("program-entry-level-jobs"), alt: "A young man and woman looking at a laptop together" },
  "computer-literacy": { src: local("program-computer-literacy"), alt: "A young woman smiling while using a laptop" },
  "workplace-skills": { src: local("program-workplace-skills"), alt: "Three women in a meeting in a bright office" },
};

export function categoryPhoto(slug: string): Photo | undefined {
  return CATEGORY_PHOTOS[slug];
}
