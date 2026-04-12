-- Insert default user roles if they don't exist
INSERT INTO user_roles (role_code, role_label, description) 
VALUES 
    ('admin', 'Admin / Company', 'Central control authority'),
    ('core_body', 'Core Body', 'District-level distributor and dealer'),
    ('businessman', 'Businessman', 'Business user with stock and order management'),
    ('stock_point', 'Stock Point Partner', 'Fulfillment and B2C marketplace operator'),
    ('customer', 'Customer', 'End customer with basic access')
ON CONFLICT (role_code) DO NOTHING;
