-- 1. Businesses (Tenants)
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Users (Linked to auth.users in Supabase)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Stores
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    address JSONB,
    manager_name TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(business_id, code)
);

-- 4. Warehouses
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    address JSONB,
    capacity_units INTEGER,
    storage_type TEXT DEFAULT 'general' CHECK (storage_type IN ('general', 'cold', 'frozen', 'hazardous')),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(business_id, code)
);

-- 5. User Roles (RBAC)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'store_manager', 'warehouse_manager', 'viewer')),
    store_id UUID REFERENCES stores(id),
    warehouse_id UUID REFERENCES warehouses(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role, store_id, warehouse_id)
);

-- 6. Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    unit_cost NUMERIC(12,2),
    unit_price NUMERIC(12,2),
    weight_kg NUMERIC(8,3),
    is_perishable BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(business_id, sku)
);

-- 7. Perishable Metadata
CREATE TABLE perishable_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    shelf_life_days INTEGER NOT NULL,
    storage_temp_min NUMERIC(5,2),
    storage_temp_max NUMERIC(5,2),
    requires_cold_chain BOOLEAN DEFAULT false,
    disposal_policy TEXT DEFAULT 'discard' CHECK (disposal_policy IN ('discard', 'discount', 'donate')),
    expiry_alert_days INTEGER DEFAULT 3
);

-- 8. Inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_type TEXT NOT NULL CHECK (location_type IN ('store', 'warehouse')),
    location_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_qty INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    reorder_qty INTEGER DEFAULT 50,
    batch_number TEXT,
    expiry_date DATE,
    unit_cost_avg NUMERIC(12,2),
    last_counted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, location_type, location_id, batch_number)
);

-- 9. Sales
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    sale_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    total_amount NUMERIC(14,2),
    customer_ref TEXT,
    channel TEXT DEFAULT 'in_store' CHECK (channel IN ('in_store', 'online', 'wholesale'))
);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0,
    line_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price - discount) STORED
);

-- 10. Forecast Data
CREATE TABLE forecast_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    product_id UUID NOT NULL REFERENCES products(id),
    location_type TEXT CHECK (location_type IN ('store', 'warehouse')),
    location_id UUID NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_demand INTEGER,
    confidence_low INTEGER,
    confidence_high INTEGER,
    model_name TEXT,
    model_version TEXT,
    mape_score NUMERIC(6,3),
    generated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, location_type, location_id, forecast_date, model_version)
);

-- 11. Transfers
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    source_type TEXT CHECK (source_type IN ('store', 'warehouse')),
    source_id UUID NOT NULL,
    dest_type TEXT CHECK (dest_type IN ('store', 'warehouse')),
    dest_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_transit', 'delivered', 'cancelled')),
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    estimated_arrival TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    batch_number TEXT
);

-- 12. Reorder Recommendations
CREATE TABLE reorder_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    product_id UUID NOT NULL REFERENCES products(id),
    location_type TEXT CHECK (location_type IN ('store', 'warehouse')),
    location_id UUID,
    recommended_qty INTEGER NOT NULL,
    recommended_date DATE NOT NULL,
    estimated_stockout_date DATE,
    safety_stock INTEGER,
    eoq INTEGER,
    lead_time_days INTEGER,
    confidence NUMERIC(5,3),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ordered')),
    generated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Risk Alerts
CREATE TABLE risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    product_id UUID REFERENCES products(id),
    inventory_id UUID REFERENCES inventory(id),
    location_type TEXT,
    location_id UUID,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'stockout_risk', 'overstock', 'expiry_warning', 'expiry_critical', 'transfer_delay', 'demand_spike', 'demand_drop')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    title TEXT NOT NULL,
    message TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes 
CREATE INDEX idx_inventory_prod_loc ON inventory(product_id, location_type, location_id);
CREATE INDEX idx_inventory_biz ON inventory(business_id, location_type, location_id);
CREATE INDEX idx_inventory_low_stock ON inventory(business_id, quantity, reorder_level) WHERE quantity <= reorder_level;
CREATE INDEX idx_inventory_expiry ON inventory(business_id, expiry_date) WHERE expiry_date IS NOT NULL;

CREATE INDEX idx_sales_store_date ON sales(store_id, sale_date DESC);
CREATE INDEX idx_sales_biz_date ON sales(business_id, sale_date DESC);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

CREATE INDEX idx_forecast_prod_loc_date ON forecast_data(product_id, location_type, location_id, forecast_date);
CREATE INDEX idx_forecast_biz ON forecast_data(business_id, forecast_date);

CREATE INDEX idx_transfers_biz_status ON transfers(business_id, status) WHERE status NOT IN ('delivered', 'cancelled');
CREATE INDEX idx_transfers_source ON transfers(source_type, source_id, status);
CREATE INDEX idx_transfers_dest ON transfers(dest_type, dest_id, status);

CREATE INDEX idx_alerts_biz_unread ON risk_alerts(business_id, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_alerts_type ON risk_alerts(business_id, alert_type, severity);

CREATE INDEX idx_reorder_active ON reorder_recommendations(business_id, status, recommended_date) WHERE status = 'pending';

-- Temporarily bypass RLS setup since we aren't handling auth token injection yet securely for a single tenant test
-- Row Level Security policies will go here when multi-tenant is enforced.
