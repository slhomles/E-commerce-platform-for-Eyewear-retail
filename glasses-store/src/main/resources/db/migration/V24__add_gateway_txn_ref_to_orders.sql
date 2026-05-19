-- Add gateway_txn_ref column to orders to reconcile ZaloPay app_trans_id and MoMo requestId during callback/IPN
ALTER TABLE orders ADD COLUMN gateway_txn_ref VARCHAR(64) NULL AFTER tracking_number;
CREATE INDEX idx_orders_gateway_txn_ref ON orders(gateway_txn_ref);
