import { ICON_OPTIONS } from './icons.js';

/*
 * Admin resource registry (shared by server CRUD handlers and the client UI).
 * Each resource: { label, singular, fields, columns, orderBy, slugFrom?, searchable? }
 * `fields` use the same shape as section fields (see sectionSchemas.js).
 */

const seoFields = [
  { name: 'metaTitle', label: 'SEO title', type: 'text', half: true, group: 'SEO' },
  { name: 'metaDescription', label: 'SEO description', type: 'textarea', group: 'SEO' },
];

const featureItemFields = [
  { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS, half: true },
  { name: 'title', label: 'Title', type: 'text', half: true },
  { name: 'text', label: 'Text', type: 'textarea' },
];

export const RESOURCES = {
  products: {
    label: 'Product categories',
    singular: 'Product category',
    orderBy: [['order', 'ASC'], ['name', 'ASC']],
    slugFrom: 'name',
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'order', label: 'Order' },
      { name: 'published', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, half: true },
      { name: 'order', label: 'Order', type: 'number', half: true, help: '0 comes first' },
      { name: 'published', label: 'Published', type: 'boolean', half: true },
      {
        name: 'layout',
        label: 'Detail page layout',
        type: 'select',
        half: true,
        options: [
          { value: 'hero', label: 'Overview hero + features + steps + designs' },
          { value: 'grid', label: 'Simple cards grid' },
        ],
      },
      { name: 'cardText', label: 'Card text (listing)', type: 'textarea', group: 'Listing card' },
      { name: 'cardImage', label: 'Card image', type: 'image', group: 'Listing card' },

      { name: 'kicker', label: 'Kicker', type: 'text', half: true, group: 'Overview hero' },
      { name: 'title', label: 'H1 title', type: 'text', half: true, group: 'Overview hero' },
      { name: 'subtitle', label: 'H2 sub-title', type: 'text', group: 'Overview hero' },
      { name: 'description', label: 'Description', type: 'textarea', group: 'Overview hero' },
      { name: 'chips', label: 'Chips', type: 'tags', help: 'Comma separated', group: 'Overview hero' },
      { name: 'heroImage', label: 'Hero image', type: 'image', group: 'Overview hero' },
      { name: 'badgeBig', label: 'Badge big text', type: 'text', half: true, group: 'Overview hero' },
      { name: 'badgeText', label: 'Badge small text', type: 'text', half: true, help: 'Use | for a line break', group: 'Overview hero' },
      { name: 'ctaPrimaryLabel', label: 'Primary button', type: 'text', half: true, group: 'Overview hero' },
      { name: 'ctaPrimaryHref', label: 'Primary link', type: 'text', half: true, group: 'Overview hero' },
      { name: 'ctaSecondaryLabel', label: 'Secondary button', type: 'text', half: true, group: 'Overview hero' },
      { name: 'ctaSecondaryHref', label: 'Secondary link', type: 'text', half: true, group: 'Overview hero' },

      { name: 'featuresKicker', label: 'Kicker', type: 'text', half: true, group: 'Features (icon cards)' },
      { name: 'featuresHeading', label: 'Heading', type: 'text', half: true, group: 'Features (icon cards)' },
      { name: 'features', label: 'Features', type: 'list', fields: featureItemFields, group: 'Features (icon cards)' },
      { name: 'featureTags', label: 'Key feature badges (check list)', type: 'tags', help: 'Comma separated', group: 'Features (icon cards)' },

      { name: 'stepsKicker', label: 'Kicker', type: 'text', half: true, group: 'How it works (steps)' },
      { name: 'stepsHeading', label: 'Heading', type: 'text', half: true, group: 'How it works (steps)' },
      {
        name: 'steps',
        label: 'Steps',
        type: 'list',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'text', label: 'Text', type: 'textarea' },
        ],
        group: 'How it works (steps)',
      },

      { name: 'materials', label: 'Materials', type: 'tags', help: 'Comma separated, e.g. AISI 304, AISI 316 L', group: 'Materials' },

      {
        name: 'applications',
        label: 'Applications (title + text)',
        type: 'list',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'text', label: 'Text', type: 'textarea' },
        ],
        group: 'Common applications',
      },

      {
        name: 'industries',
        label: 'Industries',
        type: 'list',
        fields: [
          { name: 'label', label: 'Label', type: 'text' },
          { name: 'image', label: 'Image', type: 'image' },
        ],
        group: 'Industries',
      },
      ...seoFields,
    ],
  },

  'product-items': {
    label: 'Product items',
    singular: 'Product item',
    orderBy: [['categoryId', 'ASC'], ['order', 'ASC']],
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'categoryId', label: 'Category', type: 'relation', resource: 'products' },
      { name: 'order', label: 'Order' },
      { name: 'published', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'categoryId', label: 'Category', type: 'relation', resource: 'products', required: true, half: true },
      { name: 'name', label: 'Name', type: 'text', required: true, half: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Image', type: 'image', half: true },
      { name: 'href', label: 'Link (optional)', type: 'text', half: true },
      { name: 'order', label: 'Order', type: 'number', half: true },
      { name: 'published', label: 'Published', type: 'boolean', half: true },
    ],
  },

  machines: {
    label: 'Power presses',
    singular: 'Power press',
    orderBy: [['order', 'ASC'], ['name', 'ASC']],
    slugFrom: 'name',
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'order', label: 'Order' },
      { name: 'published', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, half: true },
      { name: 'order', label: 'Order', type: 'number', half: true, help: '0 comes first' },
      { name: 'published', label: 'Published', type: 'boolean', half: true },
      { name: 'cardText', label: 'Card text (listing & menu)', type: 'textarea' },
      { name: 'kicker', label: 'Kicker', type: 'text', group: 'Hero' },
      { name: 'description', label: 'Description', type: 'textarea', group: 'Hero' },
      { name: 'image', label: 'Main image', type: 'image', group: 'Hero' },
      { name: 'badgeBig', label: 'Badge big text', type: 'text', half: true, group: 'Hero' },
      { name: 'badgeText', label: 'Badge small text', type: 'text', half: true, help: 'Use | for a line break', group: 'Hero' },
      { name: 'ctaPrimaryLabel', label: 'Primary button', type: 'text', half: true, group: 'Hero' },
      { name: 'ctaPrimaryHref', label: 'Primary link', type: 'text', half: true, group: 'Hero' },
      { name: 'ctaSecondaryLabel', label: 'Secondary button', type: 'text', half: true, group: 'Hero' },
      { name: 'ctaSecondaryHref', label: 'Secondary link', type: 'text', half: true, group: 'Hero' },
      { name: 'galleryHeading', label: 'Heading', type: 'text', group: 'Gallery' },
      {
        name: 'gallery',
        label: 'Gallery items',
        type: 'list',
        fields: [
          { name: 'label', label: 'Label', type: 'text', half: true },
          { name: 'href', label: 'Open link (optional)', type: 'text', half: true },
          { name: 'image', label: 'Image', type: 'image' },
        ],
        group: 'Gallery',
      },
      { name: 'featuresKicker', label: 'Kicker', type: 'text', half: true, group: 'Features' },
      { name: 'featuresHeading', label: 'Heading', type: 'text', half: true, group: 'Features' },
      { name: 'features', label: 'Features', type: 'list', fields: featureItemFields, group: 'Features' },
      { name: 'specsHeading', label: 'Heading', type: 'text', group: 'Specifications' },
      { name: 'specColumns', label: 'Model columns', type: 'tags', help: 'Comma separated, e.g. 5 Ton, 10 Ton', group: 'Specifications' },
      {
        name: 'specRows',
        label: 'Rows',
        type: 'list',
        fields: [
          { name: 'label', label: 'Item specification', type: 'text' },
          { name: 'code', label: 'Code', type: 'text', half: true },
          { name: 'unit', label: 'Unit', type: 'text', half: true },
          { name: 'values', label: 'Values (one per model, separated by |)', type: 'text' },
        ],
        group: 'Specifications',
      },
      ...seoFields,
    ],
  },

  posts: {
    label: 'Press / Insights',
    singular: 'Post',
    orderBy: [['publishedAt', 'DESC']],
    slugFrom: 'title',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'publishedAt', label: 'Date', type: 'date' },
      { name: 'views', label: 'Views' },
      { name: 'published', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', half: true },
      { name: 'publishedAt', label: 'Publish date', type: 'date', half: true },
      { name: 'author', label: 'Author / location', type: 'text', half: true },
      { name: 'image', label: 'Cover image', type: 'image' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'body', label: 'Body (HTML)', type: 'html' },
      { name: 'published', label: 'Published', type: 'boolean', half: true },
      ...seoFields,
    ],
  },

  locations: {
    label: 'Locations',
    singular: 'Location',
    orderBy: [['order', 'ASC']],
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'tag', label: 'Tag' },
      { name: 'phone', label: 'Phone' },
      { name: 'order', label: 'Order' },
      { name: 'published', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, half: true },
      { name: 'tag', label: 'Tag (city)', type: 'text', half: true },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'phone', label: 'Phone', type: 'text', half: true },
      { name: 'email', label: 'Email', type: 'text', half: true },
      { name: 'mapQuery', label: 'Google Maps search text', type: 'text', help: 'Used for the embedded map and directions link' },
      { name: 'order', label: 'Order', type: 'number', half: true },
      { name: 'published', label: 'Published', type: 'boolean', half: true },
    ],
  },

  pages: {
    label: 'Pages',
    singular: 'Page',
    orderBy: [['isSystem', 'DESC'], ['title', 'ASC']],
    slugFrom: 'title',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'slug', label: 'Slug' },
      { name: 'published', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, half: true },
      { name: 'slug', label: 'Slug (URL)', type: 'slug', half: true, help: 'Part of the page address, e.g. careers → /careers' },
      { name: 'published', label: 'Published', type: 'boolean', half: true },
      { name: 'showCta', label: 'Show bottom CTA banner', type: 'boolean', half: true },
      ...seoFields,
    ],
  },

  jobs: {
    label: 'Job openings',
    singular: 'Job opening',
    orderBy: [['order', 'ASC'], ['id', 'DESC']],
    slugFrom: 'title',
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'location', label: 'Location' },
      { name: 'experience', label: 'Experience' },
      { name: 'order', label: 'Order' },
      { name: 'published', label: 'Published', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Job title', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text', half: true },
      { name: 'location', label: 'Location', type: 'text', half: true },
      { name: 'type', label: 'Employment type', type: 'select', half: true, options: [{ value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' }, { value: 'Contract', label: 'Contract' }, { value: 'Internship', label: 'Internship' }] },
      { name: 'experience', label: 'Experience (e.g. 3 - 5 yrs)', type: 'text', half: true },
      { name: 'positions', label: 'Number of positions', type: 'number', half: true },
      { name: 'order', label: 'Order', type: 'number', half: true, help: '0 comes first' },
      { name: 'qualifications', label: 'Qualifications (short, shown on the card)', type: 'textarea' },
      { name: 'description', label: 'Full description (HTML, shown when expanded)', type: 'html' },
      { name: 'published', label: 'Published', type: 'boolean', half: true },
    ],
  },

  applications: {
    label: 'Job applications',
    singular: 'Application',
    orderBy: [['createdAt', 'DESC']],
    readOnly: true,
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'jobTitle', label: 'Applied for' },
      { name: 'email', label: 'Email' },
      { name: 'status', label: 'Status' },
      { name: 'createdAt', label: 'Received', type: 'date' },
    ],
    fields: [
      { name: 'jobTitle', label: 'Applied for', type: 'text', readOnly: true },
      { name: 'name', label: 'Name', type: 'text', readOnly: true, half: true },
      { name: 'email', label: 'Email', type: 'text', readOnly: true, half: true },
      { name: 'phone', label: 'Phone', type: 'text', readOnly: true, half: true },
      { name: 'city', label: 'City', type: 'text', readOnly: true, half: true },
      { name: 'company', label: 'Current company', type: 'text', readOnly: true, half: true },
      { name: 'experience', label: 'Experience', type: 'text', readOnly: true, half: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        half: true,
        options: [
          { value: 'new', label: 'New' },
          { value: 'shortlisted', label: 'Shortlisted' },
          { value: 'interview', label: 'Interview' },
          { value: 'hired', label: 'Hired' },
          { value: 'rejected', label: 'Rejected' },
        ],
      },
      { name: 'message', label: 'Message / cover note', type: 'textarea', readOnly: true },
    ],
  },

  users: {
    label: 'Admin users',
    singular: 'Admin user',
    orderBy: [['name', 'ASC']],
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email' },
      { name: 'role', label: 'Role' },
      { name: 'lastLoginAt', label: 'Last login', type: 'date' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, half: true },
      { name: 'email', label: 'Email', type: 'text', required: true, half: true },
      { name: 'password', label: 'Password', type: 'password', help: 'Leave blank to keep the current password', half: true },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        half: true,
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'editor', label: 'Editor' },
        ],
      },
    ],
  },

  enquiries: {
    label: 'Enquiries',
    singular: 'Enquiry',
    orderBy: [['createdAt', 'DESC']],
    readOnly: true,
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email' },
      { name: 'unit', label: 'Unit' },
      { name: 'status', label: 'Status' },
      { name: 'createdAt', label: 'Received', type: 'date' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', readOnly: true, half: true },
      { name: 'email', label: 'Email', type: 'text', readOnly: true, half: true },
      { name: 'phone', label: 'Phone', type: 'text', readOnly: true, half: true },
      { name: 'organization', label: 'Organization', type: 'text', readOnly: true, half: true },
      { name: 'unit', label: 'Unit', type: 'text', readOnly: true, half: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        half: true,
        options: [
          { value: 'new', label: 'New' },
          { value: 'read', label: 'Read' },
          { value: 'replied', label: 'Replied' },
        ],
      },
      { name: 'message', label: 'Message', type: 'textarea', readOnly: true },
    ],
  },
};

export const RESOURCE_NAMES = Object.keys(RESOURCES);

export function resourceDef(name) {
  return RESOURCES[name] || null;
}

const MEGA_FIELDS = [
  { name: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
  { name: 'title', label: 'Title', type: 'text', half: true },
  { name: 'text', label: 'Text', type: 'textarea' },
  { name: 'ctaLabel', label: 'CTA label', type: 'text', half: true },
  { name: 'ctaHref', label: 'CTA link', type: 'text', half: true },
  { name: 'barText', label: 'Bottom bar text', type: 'text' },
  { name: 'barLinkLabel', label: 'Bottom bar link label', type: 'text', half: true },
  { name: 'barLinkHref', label: 'Bottom bar link', type: 'text', half: true },
];

/** Settings are stored as one JSON row per group. */
export const SETTINGS_SCHEMA = {
  site: {
    label: 'Site & branding',
    fields: [
      { name: 'name', label: 'Company name', type: 'text', half: true },
      { name: 'tagline', label: 'Tagline', type: 'text', half: true },
      { name: 'logo', label: 'Logo image', type: 'image', half: true },
      { name: 'logoAlt', label: 'Logo alt text', type: 'text', half: true },
      { name: 'favicon', label: 'Favicon', type: 'image', half: true },
      { name: 'shareImage', label: 'Default share image (Open Graph)', type: 'image', half: true, help: 'Shown when a page is shared on WhatsApp / LinkedIn / Facebook. 1200×630 px recommended.' },
      { name: 'titleSuffix', label: 'Browser title suffix', type: 'text', half: true, help: 'Added after every page title, e.g. " | Jupiter Industrial Works"' },
      { name: 'metaDescription', label: 'Default meta description', type: 'textarea' },
      { name: 'catalogUrl', label: 'Catalog download URL', type: 'text', help: 'Upload the PDF in Media and paste its URL here' },
    ],
  },
  header: {
    label: 'Header & navigation',
    fields: [
      { name: 'ctaLabel', label: 'Header button label', type: 'text', half: true },
      { name: 'ctaHref', label: 'Header button link', type: 'text', half: true },
      { name: 'homeLabel', label: 'Menu label: Home', type: 'text', half: true, group: 'Menu labels' },
      { name: 'aboutLabel', label: 'Menu label: About', type: 'text', half: true, group: 'Menu labels' },
      { name: 'powerPressLabel', label: 'Menu label: Power Press', type: 'text', half: true, group: 'Menu labels' },
      { name: 'productsLabel', label: 'Menu label: Products', type: 'text', half: true, group: 'Menu labels' },
      { name: 'pressLabel', label: 'Menu label: Insights', type: 'text', half: true, group: 'Menu labels' },
      { name: 'careersLabel', label: 'Menu label: Careers', type: 'text', half: true, group: 'Menu labels' },
      { name: 'showCareers', label: 'Show Careers in the menu', type: 'boolean', half: true, group: 'Menu labels' },
      { name: 'contactLabel', label: 'Menu label: Contact', type: 'text', half: true, group: 'Menu labels' },
      {
        name: 'extraLinks',
        label: 'Extra links (shown before Contact)',
        type: 'list',
        group: 'Menu labels',
        fields: [
          { name: 'label', label: 'Label', type: 'text', half: true },
          { name: 'href', label: 'Link', type: 'text', half: true },
        ],
      },
      { name: 'productsMega', label: 'Products drop-down panel', type: 'object', group: 'Products drop-down', fields: MEGA_FIELDS },
      { name: 'powerPressMega', label: 'Power Press drop-down panel', type: 'object', group: 'Power Press drop-down', fields: MEGA_FIELDS },
    ],
  },
  contact: {
    label: 'Contact details',
    fields: [
      { name: 'company', label: 'Company line', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'phone', label: 'Phone', type: 'text', half: true },
      { name: 'email', label: 'Email', type: 'text', half: true },
      { name: 'enquiryEmail', label: 'Send contact-form enquiries to', type: 'text', half: true, help: 'E-mail address that receives a copy of every enquiry' },
      { name: 'hrEmail', label: 'Send job applications to (HR)', type: 'text', half: true, help: 'E-mail address that receives applications with the CV attached' },
    ],
  },
  social: {
    label: 'Social links',
    fields: [
      { name: 'facebook', label: 'Facebook', type: 'text', half: true },
      { name: 'instagram', label: 'Instagram', type: 'text', half: true },
      { name: 'linkedin', label: 'LinkedIn', type: 'text', half: true },
      { name: 'youtube', label: 'YouTube', type: 'text', half: true },
    ],
  },
  footer: {
    label: 'Footer',
    fields: [
      { name: 'about', label: 'About text', type: 'textarea' },
      { name: 'copyright', label: 'Copyright line', type: 'text', help: '{year} is replaced automatically' },
      { name: 'ghostText', label: 'Big ghost text', type: 'text' },
      {
        name: 'links',
        label: 'Links column',
        type: 'list',
        fields: [
          { name: 'label', label: 'Label', type: 'text', half: true },
          { name: 'href', label: 'Link', type: 'text', half: true },
        ],
      },
      {
        name: 'productLinks',
        label: 'Products column',
        type: 'list',
        fields: [
          { name: 'label', label: 'Label', type: 'text', half: true },
          { name: 'href', label: 'Link', type: 'text', half: true },
        ],
      },
    ],
  },
  cta: {
    label: 'Bottom CTA banner',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', help: 'Use | for a line break' },
      { name: 'em', label: 'Italic line', type: 'text' },
      { name: 'ghost', label: 'Ghost text', type: 'text' },
      {
        name: 'buttons',
        label: 'Buttons',
        type: 'list',
        fields: [
          { name: 'label', label: 'Label', type: 'text', half: true },
          { name: 'href', label: 'Link', type: 'text', half: true },
          { name: 'style', label: 'Style', type: 'select', half: true, options: [{ value: '', label: 'Primary' }, { value: 'o', label: 'Outline' }, { value: 'w', label: 'White' }] },
        ],
      },
    ],
  },
};
