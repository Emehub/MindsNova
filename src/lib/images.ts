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
  hero: { src: unsplash("1655720348590-c739c860beed", 1000, 1050), alt: "Young people sitting together outdoors, working on laptops" },
  about: { src: unsplash("1655720357872-ce227e4164ba", 1200, 900), alt: "Three young women talking together around a laptop" },
  speaker: { src: unsplash("1624499843552-7347d9f6d285", 1200, 900), alt: "A woman speaking to an audience with a microphone" },
} satisfies Record<string, Photo>;

/** Photos shown beside the title at the top of inner pages. */
export const PAGE_PHOTOS = {
  about: { src: unsplash("1739298061757-7a3339cee982", 1200, 900), alt: "A smiling team of young professionals standing together" },
  careerTalks: { src: unsplash("1778877031562-dc433ab31706", 1200, 900), alt: "A woman giving a talk at a presentation" },
  getInvolved: { src: unsplash("1584365098838-50ccef838f4a", 1200, 900), alt: "A group of smiling young people sitting together" },
  programs: { src: unsplash("1573164574572-cb89e39749b4", 1200, 900), alt: "Young professionals learning together at a long table with laptops" },
  events: { src: unsplash("1778876091112-f7e985acdb01", 1200, 900), alt: "A large audience at a conference" },
  contact: { src: unsplash("1739302750695-31a8c978c770", 1200, 900), alt: "Two women chatting happily at a table" },
  apply: { src: unsplash("1739303987830-ca19742b19bc", 1200, 900), alt: "Two young women with laptops smiling together" },
} satisfies Record<string, Photo>;

/** Photos for each way to get involved. */
export const INVOLVE_PHOTOS = {
  student: { src: unsplash("1531482615713-2afd69097998", 1000, 750), alt: "Young people learning together at a computer" },
  mentor: { src: unsplash("1739285452629-2672b13fa42d", 1000, 750), alt: "A professional mentoring a young man at a desk" },
  volunteer: { src: unsplash("1560220604-1985ebfe28b1", 1000, 750), alt: "Volunteers in matching shirts at an event" },
  partner: { src: unsplash("1653566031486-dc4ead13a35d", 1000, 750), alt: "Professionals in a meeting around a table" },
  sponsor: { src: unsplash("1739302750702-e26a61113758", 1000, 750), alt: "Professionals discussing a project around a laptop" },
} satisfies Record<string, Photo>;

/** Photos that rotate in the homepage hero (portrait crops). */
export const HERO_SLIDES: Photo[] = [
  PHOTOS.hero,
  { src: unsplash("1653669486397-b802144ae64a", 1000, 1050), alt: "A young professional woman standing by her desk with a laptop" },
  { src: unsplash("1645620766046-b129a9c5f658", 1000, 1050), alt: "A young man and woman learning together on a laptop" },
  { src: unsplash("1573497701240-345a300b8d36", 1000, 1050), alt: "Young professionals in a meeting around a table" },
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
