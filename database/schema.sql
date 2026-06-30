-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN CREATE TYPE passport_status_enum AS ENUM ('valid', 'expired', 'none');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE payment_status_enum AS ENUM ('under_review', 'approved', 'declined');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE target_type_enum AS ENUM ('main_user', 'family_member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- users_profile
CREATE TABLE IF NOT EXISTS users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    id_number VARCHAR(9) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    has_passport BOOLEAN NOT NULL DEFAULT FALSE,
    passport_status passport_status_enum NOT NULL DEFAULT 'none',
    identity_card_image_url TEXT,
    passport_image_url TEXT,
    telegram_chat_id VARCHAR(50),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_id_number_format CHECK (id_number ~ '^[0-9]{9}$')
);

CREATE INDEX idx_users_profile_id_number ON users_profile(id_number);
CREATE INDEX idx_users_profile_telegram ON users_profile(telegram_chat_id);
CREATE INDEX idx_users_profile_admin ON users_profile(is_admin);

-- family_members
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(9) UNIQUE,
    birth_date DATE NOT NULL,
    has_passport BOOLEAN NOT NULL DEFAULT FALSE,
    passport_status passport_status_enum NOT NULL DEFAULT 'none',
    identity_card_image_url TEXT,
    passport_image_url TEXT,
    is_underage BOOLEAN GENERATED ALWAYS AS (birth_date > (CURRENT_DATE - INTERVAL '18 years')) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_family_id CHECK (is_underage = TRUE OR (id_number IS NOT NULL AND id_number ~ '^[0-9]{9}$'))
);

CREATE INDEX idx_family_user ON family_members(user_id);

-- passport_orders
CREATE TABLE IF NOT EXISTS passport_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    target_type target_type_enum NOT NULL,
    target_id UUID NOT NULL,
    order_status order_status_enum NOT NULL DEFAULT 'pending',
    usdt_txid VARCHAR(100) UNIQUE NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'under_review',
    amount DECIMAL(18, 8) NOT NULL,
    expected_delivery_date DATE,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_positive_amount CHECK (amount > 0),
    CONSTRAINT chk_txid CHECK (LENGTH(TRIM(usdt_txid)) > 0)
);

CREATE INDEX idx_orders_user ON passport_orders(user_id);
CREATE INDEX idx_orders_payment ON passport_orders(payment_status);
CREATE INDEX idx_orders_status ON passport_orders(order_status);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_profile BEFORE UPDATE ON users_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_family BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders BEFORE UPDATE ON passport_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_orders ENABLE ROW LEVEL SECURITY;

-- users_profile policies
CREATE POLICY "users_read_own" ON users_profile FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users_profile FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "admin_select_all" ON users_profile FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "admin_update_all" ON users_profile FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND is_admin = TRUE));

-- family_members policies
CREATE POLICY "family_read_own" ON family_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "family_insert_own" ON family_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "family_update_own" ON family_members FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "family_delete_own" ON family_members FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_family_select" ON family_members FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "admin_family_update" ON family_members FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND is_admin = TRUE));

-- passport_orders policies
CREATE POLICY "orders_read_own" ON passport_orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "orders_insert_own" ON passport_orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_update_own" ON passport_orders FOR UPDATE TO authenticated USING (user_id = auth.uid() AND order_status = 'pending');
CREATE POLICY "admin_orders_select" ON passport_orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "admin_orders_update" ON passport_orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND is_admin = TRUE));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$ BEGIN
    INSERT INTO public.users_profile (id, id_number, full_name, phone_number, has_passport, passport_status)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'id_number', '000000000'), COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), COALESCE(NEW.raw_user_meta_data->>'phone_number', ''), FALSE, 'none')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Order status change notification
CREATE OR REPLACE FUNCTION notify_order_change() RETURNS TRIGGER AS $$ BEGIN
    IF OLD.order_status IS DISTINCT FROM NEW.order_status OR OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        PERFORM pg_notify('order_status_change', json_build_object('order_id', NEW.id, 'user_id', NEW.user_id, 'order_status', NEW.order_status, 'payment_status', NEW.payment_status, 'expected_delivery_date', NEW.expected_delivery_date)::text);
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_change ON passport_orders;
CREATE TRIGGER trg_order_change AFTER UPDATE ON passport_orders FOR EACH ROW EXECUTE FUNCTION notify_order_change();
