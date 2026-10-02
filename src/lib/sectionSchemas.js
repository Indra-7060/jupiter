import { ICON_OPTIONS } from './icons.js';

/*
 * Field definition shape (consumed by the admin SchemaForm):
 * { name, label, type, help?, required?, options?, fields? (for 'list'), resource? (for 'relation'), half? }
 * types: text | textarea | html | number | boolean | select | image | video | list | tags | relation | date | password | json
 */

const buttonFields = [
  { name: 'label', label: 'Label', type: 'text', required: true, half: true },
  { name: 'href', label: 'Link', type: 'text', required: true, half: true },
  {
    name: 'style',
    label: 'Style',
    type: 'select',
    half: true,
    options: [
      { value: '', label: 'Primary (blue)' },
      { value: 'w', label: 'White' },
      { value: 'o', label: 'Outline' },
    ],
  },
];

export const SECTION_TYPES = {
  hero_video: {
    label: 'Hero (video)',
    description: 'Full-width video hero with headline, sub-line and buttons.',
    fields: [
      { name: 'title', label: 'Headline', type: 'text', required: true },
      { name: 'subtitle', label: 'Sub-line', type: 'text' },
      { name: 'tagline', label: 'Sub-headline (small line under the sub-line)', type: 'text' },
      { name: 'text', label: 'Intro paragraph', type: 'textarea' },
      { name: 'highlights', label: 'Quick highlights (chips)', type: 'tags', help: 'Comma separated' },
      { name: 'video', label: 'Video file (mp4)', type: 'video', half: true },
      { name: 'poster', label: 'Poster image', type: 'image', half: true },
      { name: 'buttons', label: 'Buttons', type: 'list', fields: buttonFields },
    ],
  },
  marquee: {
    label: 'Marquee strip',
    description: 'Scrolling grey text strip with rotating gears.',
    fields: [
      { name: 'items', label: 'Words / phrases', type: 'tags', help: 'Comma separated' },
      { name: 'reverse', label: 'Reverse direction', type: 'boolean' },
    ],
  },
  divisions: {
    label: 'Divisions cards',
    description: '"Two Divisions. One Standard." cards.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', half: true },
      { name: 'headingAccent', label: 'Heading accent (second line)', type: 'text', half: true },
      {
        name: 'cards',
        label: 'Cards',
        type: 'list',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'image', label: 'Image', type: 'image', half: true },
          { name: 'href', label: 'Link', type: 'text', half: true },
          { name: 'wide', label: 'Wide card', type: 'boolean' },
          {
            name: 'tags',
            label: 'Tag links',
            type: 'list',
            fields: [
              { name: 'label', label: 'Label', type: 'text', half: true },
              { name: 'href', label: 'Link', type: 'text', half: true },
            ],
          },
        ],
      },
    ],
  },
  vision: {
    label: 'Vision banner',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'text', label: 'Text', type: 'textarea' },
      { name: 'image', label: 'Background image', type: 'image' },
    ],
  },
  mission: {
    label: 'Mission (4 pillars)',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'image', label: 'Background image', type: 'image' },
      {
        name: 'items',
        label: 'Pillars',
        type: 'list',
        fields: [
          { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS, half: true },
          { name: 'title', label: 'Title', type: 'text', half: true },
          { name: 'text', label: 'Text', type: 'textarea' },
        ],
      },
    ],
  },
  crafting: {
    label: 'Crafting / stats / industries',
    description: 'Heading, animated stats, big ghost words, manufacturer blurb and industry rows.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', half: true },
      { name: 'headingAccent', label: 'Heading accent', type: 'text', half: true },
      { name: 'subheading', label: 'Sub-heading', type: 'text' },
      {
        name: 'stats',
        label: 'Stats',
        type: 'list',
        fields: [
          { name: 'value', label: 'Number', type: 'number', half: true },
          { name: 'suffix', label: 'Suffix (+, M, %)', type: 'text', half: true },
          { name: 'label', label: 'Label', type: 'text' },
        ],
      },
      { name: 'ghostA', label: 'Ghost word A', type: 'text', half: true },
      { name: 'ghostB', label: 'Ghost word B', type: 'text', half: true },
      { name: 'mfSmall', label: 'Blurb kicker', type: 'text' },
      { name: 'mfTitle', label: 'Blurb title', type: 'text' },
      { name: 'mfText', label: 'Blurb text', type: 'textarea' },
      {
        name: 'industries',
        label: 'Industry rows',
        type: 'list',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'image', label: 'Image', type: 'image' },
        ],
      },
    ],
  },
  built_to_scale: {
    label: 'Built to Scale slider',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', half: true },
      { name: 'headingAccent', label: 'Heading accent', type: 'text', half: true },
      {
        name: 'slides',
        label: 'Slides',
        type: 'list',
        fields: [
          { name: 'ghost', label: 'Ghost label', type: 'text', half: true },
          { name: 'title', label: 'Title', type: 'text', half: true },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'image', label: 'Image', type: 'image', half: true },
          { name: 'contain', label: 'Fit image inside (contain)', type: 'boolean', half: true },
        ],
      },
    ],
  },
  about_hero: {
    label: 'About hero',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'subtitle', label: 'Sub-title', type: 'text' },
      { name: 'text', label: 'Paragraphs', type: 'textarea', help: 'Blank line = new paragraph' },
      { name: 'buttonLabel', label: 'Button label', type: 'text', half: true },
      { name: 'buttonHref', label: 'Button link', type: 'text', half: true },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },
  expertise: {
    label: 'Expertise rows',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'subheading', label: 'Sub-heading', type: 'text' },
      {
        name: 'rows',
        label: 'Rows',
        type: 'list',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'image', label: 'Image', type: 'image' },
        ],
      },
    ],
  },
  journey: {
    label: 'Journey timeline',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'background', label: 'Background image', type: 'image' },
      {
        name: 'items',
        label: 'Milestones',
        type: 'list',
        fields: [
          { name: 'tab', label: 'Tab label (e.g. 1963)', type: 'text', half: true },
          { name: 'title', label: 'Title', type: 'text', half: true },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'image', label: 'Image', type: 'image' },
        ],
      },
    ],
  },
  certifications: {
    label: 'Certifications',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'subheading', label: 'Sub-heading', type: 'text' },
      {
        name: 'cards',
        label: 'Cards',
        type: 'list',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'image', label: 'Image', type: 'image', half: true },
          { name: 'badge', label: 'Show as badge (logo)', type: 'boolean', half: true },
        ],
      },
    ],
  },
  page_title: {
    label: 'Page title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', half: true },
      { name: 'ghost', label: 'Ghost text', type: 'text', half: true },
    ],
  },
  product_grid: {
    label: 'Product categories grid',
    description: 'Automatically lists all published product categories.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', half: true },
      { name: 'ghost', label: 'Ghost text', type: 'text', half: true },
      { name: 'text', label: 'Intro text', type: 'textarea' },
      { name: 'linkLabel', label: 'Card link label', type: 'text' },
    ],
  },
  machine_feature: {
    label: 'Featured power press (full page)',
    description: 'Shows one power press in full: hero, gallery, features and specification table.',
    fields: [
      { name: 'machineId', label: 'Power press', type: 'relation', resource: 'machines', allowEmpty: true, help: 'Leave empty to show the first press in your Order' },
    ],
  },
  machines_grid: {
    label: 'Power press grid',
    description: 'Automatically lists all published power press machines.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', half: true },
      { name: 'ghost', label: 'Ghost text', type: 'text', half: true },
      { name: 'text', label: 'Intro text', type: 'textarea' },
      { name: 'linkLabel', label: 'Card link label', type: 'text' },
    ],
  },
  press_list: {
    label: 'Press / news list',
    description: 'Automatically lists published posts.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', half: true },
      { name: 'limit', label: 'Max posts (0 = all)', type: 'number', half: true },
      { name: 'kicker', label: 'Kicker', type: 'text', half: true },
      { name: 'headline', label: 'Headline', type: 'text', half: true },
      { name: 'text', label: 'Intro text', type: 'textarea' },
    ],
  },
  contact_locations: {
    label: 'Contact locations',
    description: 'Automatically lists all locations with maps.',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'lead', label: 'Lead text', type: 'textarea' },
      { name: 'directionsLabel', label: 'Directions link label', type: 'text' },
    ],
  },
  contact_form: {
    label: 'Enquiry form',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'text', label: 'Intro text', type: 'textarea' },
      { name: 'bullets', label: 'Bullet points', type: 'tags', help: 'Comma separated' },
      { name: 'units', label: 'Unit options', type: 'tags', help: 'Comma separated (first is default)' },
      { name: 'buttonLabel', label: 'Button label', type: 'text', half: true },
      { name: 'successMessage', label: 'Success message', type: 'text', half: true },
    ],
  },
  job_openings: {
    label: 'Current openings (careers)',
    description: 'Lists published job openings with an Apply form. Openings are managed under Careers → Job openings.',
    fields: [
      { name: 'kicker', label: 'Kicker', type: 'text', half: true },
      { name: 'heading', label: 'Heading', type: 'text', half: true },
      { name: 'text', label: 'Intro text', type: 'textarea' },
      { name: 'emptyText', label: 'Text when there are no openings', type: 'text' },
      { name: 'applyLabel', label: 'Apply button label', type: 'text', half: true },
      { name: 'successMessage', label: 'Message after applying', type: 'text', half: true },
    ],
  },
  cv_form: {
    label: 'Send us your CV (careers)',
    description: 'General application form with CV upload, plus phone / WhatsApp contacts.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'text', label: 'Intro text', type: 'textarea' },
      { name: 'bullets', label: 'Bullet points', type: 'tags', help: 'Comma separated' },
      { name: 'buttonLabel', label: 'Button label', type: 'text', half: true },
      { name: 'successMessage', label: 'Success message', type: 'text', half: true },
      { name: 'phone', label: 'Phone shown next to the form', type: 'text', half: true },
      { name: 'whatsapp', label: 'WhatsApp number (digits with country code)', type: 'text', half: true },
      { name: 'email', label: 'E-mail shown next to the form', type: 'text', half: true },
    ],
  },
  industries_list: {
    label: 'Industries we serve',
    description: 'Heading, text and a row of industry chips.',
    fields: [
      { name: 'ghost', label: 'Ghost text', type: 'text', half: true },
      { name: 'heading', label: 'Heading', type: 'text', half: true },
      { name: 'text', label: 'Intro text', type: 'textarea' },
      { name: 'items', label: 'Industries', type: 'tags', help: 'Comma separated' },
      { name: 'footer', label: 'Closing line', type: 'text' },
    ],
  },
  cta_banner: {
    label: 'CTA banner (page-specific)',
    description: 'A call-to-action banner like the site-wide one, with its own texts. Switch off "Show bottom CTA banner" in the page settings to avoid two banners.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', help: 'Use | for a line break' },
      { name: 'em', label: 'Italic line', type: 'text' },
      { name: 'ghost', label: 'Ghost text', type: 'text' },
      { name: 'buttons', label: 'Buttons', type: 'list', fields: buttonFields },
    ],
  },
  rich_text: {
    label: 'Rich text',
    description: 'Free HTML content block.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'html', label: 'HTML content', type: 'html' },
      { name: 'narrow', label: 'Narrow article width', type: 'boolean' },
    ],
  },
};

export const SECTION_TYPE_OPTIONS = Object.entries(SECTION_TYPES).map(([value, v]) => ({ value, label: v.label }));

export function sectionSchema(type) {
  return SECTION_TYPES[type] || null;
}
