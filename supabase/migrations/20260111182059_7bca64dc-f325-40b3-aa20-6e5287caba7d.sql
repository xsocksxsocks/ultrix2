-- Add soft delete columns to all relevant tables
ALTER TABLE car_inquiries ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE car_sell_requests ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE cars_for_sale ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_car_inquiries_deleted ON car_inquiries(deleted_at);
CREATE INDEX IF NOT EXISTS idx_contact_requests_deleted ON contact_requests(deleted_at);
CREATE INDEX IF NOT EXISTS idx_car_sell_requests_deleted ON car_sell_requests(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cars_for_sale_deleted ON cars_for_sale(deleted_at);