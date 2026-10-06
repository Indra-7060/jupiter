import Sequelize from 'sequelize';

const { DataTypes } = Sequelize;

/**
 * JSON column that works on MySQL *and* MariaDB (MariaDB returns JSON as a string
 * through the mysql dialect, so we store LONGTEXT and (de)serialise ourselves).
 */
function json(key, defaultValue) {
  return {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue(key);
      if (raw === null || raw === undefined || raw === '') return structuredClone(defaultValue);
      if (typeof raw !== 'string') return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return structuredClone(defaultValue);
      }
    },
    set(val) {
      this.setDataValue(key, val === undefined || val === null ? null : JSON.stringify(val));
    },
  };
}

/** Bump when models are added/changed so a hot-reloaded dev server re-initialises them. */
export const MODELS_VERSION = 4;

export function initModels(sequelize) {
  const AdminUser = sequelize.define(
    'AdminUser',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
      role: { type: DataTypes.ENUM('admin', 'editor'), allowNull: false, defaultValue: 'admin' },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: 'admin_users' }
  );

  const Setting = sequelize.define(
    'Setting',
    {
      key: { type: DataTypes.STRING(80), primaryKey: true },
      value: json('value', {}),
    },
    { tableName: 'settings' }
  );

  const Page = sequelize.define(
    'Page',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      bodyClass: { type: DataTypes.STRING(120), allowNull: true },
      metaTitle: { type: DataTypes.STRING(200), allowNull: true },
      metaDescription: { type: DataTypes.STRING(500), allowNull: true },
      isSystem: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      showCta: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'pages' }
  );

  const Section = sequelize.define(
    'Section',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      pageId: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.STRING(60), allowNull: false },
      label: { type: DataTypes.STRING(120), allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      data: json('data', {}),
    },
    { tableName: 'sections' }
  );
  Page.hasMany(Section, { as: 'sections', foreignKey: 'pageId', onDelete: 'CASCADE' });
  Section.belongsTo(Page, { as: 'page', foreignKey: 'pageId' });

  const ProductCategory = sequelize.define(
    'ProductCategory',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(160), allowNull: false },
      cardText: { type: DataTypes.STRING(500), allowNull: true },
      cardImage: { type: DataTypes.STRING(500), allowNull: true },
      layout: { type: DataTypes.ENUM('hero', 'grid'), allowNull: false, defaultValue: 'hero' },
      kicker: { type: DataTypes.STRING(120), allowNull: true },
      title: { type: DataTypes.STRING(200), allowNull: true },
      subtitle: { type: DataTypes.STRING(255), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      chips: json('chips', []),
      heroImage: { type: DataTypes.STRING(500), allowNull: true },
      badgeBig: { type: DataTypes.STRING(40), allowNull: true },
      badgeText: { type: DataTypes.STRING(120), allowNull: true },
      ctaPrimaryLabel: { type: DataTypes.STRING(80), allowNull: true },
      ctaPrimaryHref: { type: DataTypes.STRING(500), allowNull: true },
      ctaSecondaryLabel: { type: DataTypes.STRING(80), allowNull: true },
      ctaSecondaryHref: { type: DataTypes.STRING(500), allowNull: true },
      featuresKicker: { type: DataTypes.STRING(120), allowNull: true },
      featuresHeading: { type: DataTypes.STRING(200), allowNull: true },
      features: json('features', []),
      featureTags: json('featureTags', []),
      stepsKicker: { type: DataTypes.STRING(120), allowNull: true },
      stepsHeading: { type: DataTypes.STRING(200), allowNull: true },
      steps: json('steps', []),
      designsKicker: { type: DataTypes.STRING(120), allowNull: true },
      designsHeading: { type: DataTypes.STRING(200), allowNull: true },
      materialsHeading: { type: DataTypes.STRING(200), allowNull: true },
      materials: json('materials', []),
      industriesHeading: { type: DataTypes.STRING(200), allowNull: true },
      industries: json('industries', []),
      applications: json('applications', []),
      metaTitle: { type: DataTypes.STRING(200), allowNull: true },
      metaDescription: { type: DataTypes.STRING(500), allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'product_categories' }
  );

  const Product = sequelize.define(
    'Product',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      categoryId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      image: { type: DataTypes.STRING(500), allowNull: true },
      href: { type: DataTypes.STRING(500), allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'products' }
  );
  ProductCategory.hasMany(Product, { as: 'products', foreignKey: 'categoryId', onDelete: 'CASCADE' });
  Product.belongsTo(ProductCategory, { as: 'category', foreignKey: 'categoryId' });

  const Machine = sequelize.define(
    'Machine',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(160), allowNull: false },
      cardText: { type: DataTypes.STRING(500), allowNull: true },
      kicker: { type: DataTypes.STRING(120), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      image: { type: DataTypes.STRING(500), allowNull: true },
      badgeBig: { type: DataTypes.STRING(40), allowNull: true },
      badgeText: { type: DataTypes.STRING(120), allowNull: true },
      ctaPrimaryLabel: { type: DataTypes.STRING(80), allowNull: true },
      ctaPrimaryHref: { type: DataTypes.STRING(500), allowNull: true },
      ctaSecondaryLabel: { type: DataTypes.STRING(80), allowNull: true },
      ctaSecondaryHref: { type: DataTypes.STRING(500), allowNull: true },
      galleryHeading: { type: DataTypes.STRING(200), allowNull: true },
      gallery: json('gallery', []),
      featuresKicker: { type: DataTypes.STRING(120), allowNull: true },
      featuresHeading: { type: DataTypes.STRING(200), allowNull: true },
      features: json('features', []),
      specsHeading: { type: DataTypes.STRING(200), allowNull: true },
      specColumns: json('specColumns', []),
      specRows: json('specRows', []),
      metaTitle: { type: DataTypes.STRING(200), allowNull: true },
      metaDescription: { type: DataTypes.STRING(500), allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'machines' }
  );

  const Post = sequelize.define(
    'Post',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      category: { type: DataTypes.STRING(120), allowNull: true },
      excerpt: { type: DataTypes.TEXT, allowNull: true },
      body: { type: DataTypes.TEXT('long'), allowNull: true },
      image: { type: DataTypes.STRING(500), allowNull: true },
      author: { type: DataTypes.STRING(160), allowNull: true },
      publishedAt: { type: DataTypes.DATE, allowNull: true },
      views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      metaTitle: { type: DataTypes.STRING(200), allowNull: true },
      metaDescription: { type: DataTypes.STRING(500), allowNull: true },
    },
    { tableName: 'posts' }
  );

  const Location = sequelize.define(
    'Location',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(160), allowNull: false },
      tag: { type: DataTypes.STRING(80), allowNull: true },
      address: { type: DataTypes.STRING(500), allowNull: true },
      phone: { type: DataTypes.STRING(60), allowNull: true },
      email: { type: DataTypes.STRING(190), allowNull: true },
      mapQuery: { type: DataTypes.STRING(500), allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'locations' }
  );

  const Enquiry = sequelize.define(
    'Enquiry',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(160), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: false },
      phone: { type: DataTypes.STRING(60), allowNull: true },
      organization: { type: DataTypes.STRING(190), allowNull: true },
      unit: { type: DataTypes.STRING(120), allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM('new', 'read', 'replied'), allowNull: false, defaultValue: 'new' },
      ip: { type: DataTypes.STRING(64), allowNull: true },
    },
    { tableName: 'enquiries' }
  );

  // Quote requests from the public /quote form; the admin answers them from the CMS and the reply is e-mailed.
  const QuoteRequest = sequelize.define(
    'QuoteRequest',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(160), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: false },
      phone: { type: DataTypes.STRING(60), allowNull: true },
      company: { type: DataTypes.STRING(190), allowNull: true },
      location: { type: DataTypes.STRING(160), allowNull: true },
      product: { type: DataTypes.STRING(160), allowNull: true },
      specification: { type: DataTypes.STRING(255), allowNull: true },
      quantity: { type: DataTypes.STRING(80), allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM('new', 'read', 'quoted', 'closed'), allowNull: false, defaultValue: 'new' },
      reply: { type: DataTypes.TEXT, allowNull: true },
      repliedAt: { type: DataTypes.DATE, allowNull: true },
      repliedBy: { type: DataTypes.STRING(190), allowNull: true },
      ip: { type: DataTypes.STRING(64), allowNull: true },
    },
    { tableName: 'quote_requests' }
  );

  const JobOpening = sequelize.define(
    'JobOpening',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      department: { type: DataTypes.STRING(120), allowNull: true },
      location: { type: DataTypes.STRING(120), allowNull: true },
      type: { type: DataTypes.STRING(60), allowNull: true },
      experience: { type: DataTypes.STRING(80), allowNull: true },
      qualifications: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT('long'), allowNull: true },
      positions: { type: DataTypes.INTEGER, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'job_openings' }
  );

  const JobApplication = sequelize.define(
    'JobApplication',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      jobId: { type: DataTypes.INTEGER, allowNull: true },
      jobTitle: { type: DataTypes.STRING(200), allowNull: true },
      name: { type: DataTypes.STRING(160), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: false },
      phone: { type: DataTypes.STRING(60), allowNull: true },
      company: { type: DataTypes.STRING(190), allowNull: true },
      city: { type: DataTypes.STRING(120), allowNull: true },
      experience: { type: DataTypes.STRING(80), allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: true },
      cvFile: { type: DataTypes.STRING(255), allowNull: true },
      cvName: { type: DataTypes.STRING(255), allowNull: true },
      status: { type: DataTypes.ENUM('new', 'shortlisted', 'interview', 'hired', 'rejected'), allowNull: false, defaultValue: 'new' },
      ip: { type: DataTypes.STRING(64), allowNull: true },
    },
    { tableName: 'job_applications' }
  );
  JobOpening.hasMany(JobApplication, { as: 'applications', foreignKey: 'jobId', onDelete: 'SET NULL' });
  JobApplication.belongsTo(JobOpening, { as: 'job', foreignKey: 'jobId' });

  const Media = sequelize.define(
    'Media',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      filename: { type: DataTypes.STRING(255), allowNull: false },
      url: { type: DataTypes.STRING(500), allowNull: false },
      mime: { type: DataTypes.STRING(120), allowNull: true },
      size: { type: DataTypes.INTEGER, allowNull: true },
      alt: { type: DataTypes.STRING(255), allowNull: true },
    },
    { tableName: 'media' }
  );

  return {
    AdminUser,
    Setting,
    Page,
    Section,
    ProductCategory,
    Product,
    Machine,
    Post,
    Location,
    Enquiry,
    QuoteRequest,
    JobOpening,
    JobApplication,
    Media,
  };
}
