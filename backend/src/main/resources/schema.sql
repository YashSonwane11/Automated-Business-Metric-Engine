-- schema.sql
-- Creates tables if they don't already exist (non-destructive)

CREATE TABLE IF NOT EXISTS raw_sales_data (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(100),
    order_date DATE,
    customer_id VARCHAR(100),
    customer_name VARCHAR(255),
    category VARCHAR(100),
    product_name VARCHAR(255),
    quantity INTEGER DEFAULT 0,
    unit_price NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    revenue NUMERIC(12,2) DEFAULT 0,
    payment_method VARCHAR(100),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_metrics_summary (
    id BIGSERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_quantity INTEGER DEFAULT 0,
    gross_revenue NUMERIC(14,2) DEFAULT 0,
    total_discount NUMERIC(14,2) DEFAULT 0,
    net_revenue NUMERIC(14,2) DEFAULT 0,
    avg_order_value NUMERIC(14,2) DEFAULT 0,
    rolling_7_day_revenue NUMERIC(14,2) DEFAULT 0,
    cumulative_revenue NUMERIC(14,2) DEFAULT 0,
    category_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, category)
);

CREATE TABLE IF NOT EXISTS upload_history (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    row_count INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS batch_job_run (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    rows_processed INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0
);