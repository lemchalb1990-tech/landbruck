-- Landbruk: migración inicial
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='products' AND xtype='U')
CREATE TABLE products (
  id                INT PRIMARY KEY IDENTITY(1,1),
  sku               VARCHAR(50)   UNIQUE NOT NULL,
  name              NVARCHAR(255) NOT NULL,
  scientific_name   NVARCHAR(255),
  description       NVARCHAR(MAX),
  price             DECIMAL(10,2) NOT NULL,
  stock_quantity    INT           NOT NULL DEFAULT 0,
  category          NVARCHAR(100),
  germination_days  INT,
  sowing_season     NVARCHAR(100),
  sowing_depth_cm   DECIMAL(4,1),
  plant_spacing_cm  INT,
  is_organic        BIT           DEFAULT 0,
  status            VARCHAR(20)   DEFAULT 'draft',
  shopify_product_id VARCHAR(50),
  weight_grams      INT           DEFAULT 50,
  created_at        DATETIME      DEFAULT GETDATE(),
  updated_at        DATETIME      DEFAULT GETDATE()
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='product_images' AND xtype='U')
CREATE TABLE product_images (
  id             INT PRIMARY KEY IDENTITY(1,1),
  product_id     INT NOT NULL FOREIGN KEY REFERENCES products(id) ON DELETE CASCADE,
  cloudinary_url NVARCHAR(500),
  cloudinary_id  NVARCHAR(255),
  alt_text       NVARCHAR(255),
  position       INT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sales' AND xtype='U')
CREATE TABLE sales (
  id                   INT PRIMARY KEY IDENTITY(1,1),
  shopify_order_id     VARCHAR(50) UNIQUE NOT NULL,
  shopify_order_number VARCHAR(50),
  product_id           INT FOREIGN KEY REFERENCES products(id),
  sku                  VARCHAR(50),
  quantity             INT           NOT NULL,
  unit_price           DECIMAL(10,2),
  total_price          DECIMAL(10,2),
  customer_name        NVARCHAR(255),
  customer_email       NVARCHAR(255),
  shipping_address     NVARCHAR(MAX),
  starken_tracking     VARCHAR(100),
  starken_label_url    NVARCHAR(500),
  invoice_number       VARCHAR(50),
  invoice_pdf_url      NVARCHAR(500),
  status               VARCHAR(30)  DEFAULT 'pending',
  sale_date            DATETIME     DEFAULT GETDATE(),
  synced_to_cloud      BIT          DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sync_log' AND xtype='U')
CREATE TABLE sync_log (
  id            INT PRIMARY KEY IDENTITY(1,1),
  entity_type   VARCHAR(50),
  entity_id     INT,
  action        VARCHAR(50),
  status        VARCHAR(20),
  error_message NVARCHAR(MAX),
  attempts      INT      DEFAULT 1,
  created_at    DATETIME DEFAULT GETDATE()
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_users' AND xtype='U')
CREATE TABLE admin_users (
  id            INT PRIMARY KEY IDENTITY(1,1),
  email         NVARCHAR(255) UNIQUE NOT NULL,
  password_hash NVARCHAR(255) NOT NULL,
  name          NVARCHAR(255),
  created_at    DATETIME DEFAULT GETDATE()
);
