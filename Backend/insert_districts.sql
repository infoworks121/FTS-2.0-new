-- Insert West Bengal state and districts

-- First, ensure India exists and get the country_id
DO $$
DECLARE
    country_id_val INT;
    state_id_val INT;
BEGIN
    -- Get or insert India
    SELECT id INTO country_id_val FROM countries WHERE iso_code = 'IN';
    
    IF country_id_val IS NULL THEN
        INSERT INTO countries (name, iso_code) VALUES ('India', 'IN') RETURNING id INTO country_id_val;
    END IF;

    -- Get or insert West Bengal
    SELECT id INTO state_id_val FROM states WHERE name = 'West Bengal' AND country_id = country_id_val;
    
    IF state_id_val IS NULL THEN
        INSERT INTO states (country_id, name, code) VALUES (country_id_val, 'West Bengal', 'WB') RETURNING id INTO state_id_val;
    END IF;

    -- Insert districts if they don't exist
    INSERT INTO districts (state_id, name) VALUES
        (state_id_val, 'Alipurduar'),
        (state_id_val, 'Bankura'),
        (state_id_val, 'Birbhum'),
        (state_id_val, 'Cooch Behar'),
        (state_id_val, 'Dakshin Dinajpur'),
        (state_id_val, 'Darjeeling'),
        (state_id_val, 'Hooghly'),
        (state_id_val, 'Howrah'),
        (state_id_val, 'Jalpaiguri'),
        (state_id_val, 'Jhargram'),
        (state_id_val, 'Kalimpong'),
        (state_id_val, 'Kolkata'),
        (state_id_val, 'Malda'),
        (state_id_val, 'Murshidabad'),
        (state_id_val, 'Nadia'),
        (state_id_val, 'North 24 Parganas'),
        (state_id_val, 'Paschim Bardhaman'),
        (state_id_val, 'Paschim Medinipur'),
        (state_id_val, 'Purba Bardhaman'),
        (state_id_val, 'Purba Medinipur'),
        (state_id_val, 'Purulia'),
        (state_id_val, 'South 24 Parganas'),
        (state_id_val, 'Uttar Dinajpur')
    ON CONFLICT (state_id, name) DO NOTHING;

    RAISE NOTICE 'West Bengal districts inserted successfully';
END $$;
