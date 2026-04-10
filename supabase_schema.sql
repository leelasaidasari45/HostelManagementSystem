-- Run this entire script in your Supabase SQL Editor to build the backend tables!

-- 1. Users Application Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'tenant')),
  phone TEXT,
  hostel_id UUID, -- Will reference hostels later
  join_date TEXT,
  father_name TEXT,
  address TEXT,
  vehicle_number TEXT,
  aadhaar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hostels Table
CREATE TABLE hostels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  pg_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix the foreign key on users now that hostels exists
ALTER TABLE users ADD CONSTRAINT fk_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE SET NULL;

-- 3. Floors Table
CREATE TABLE floors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Rooms Table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Beds Table
CREATE TABLE beds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  bed_label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Allocations Table
CREATE TABLE allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'vacating', 'vacated', 'rejected')),
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Complaints Table
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Payments Table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  month TEXT NOT NULL,
  year TEXT,
  utr_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notices Table
CREATE TABLE notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Menu Table
CREATE TABLE menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  snacks TEXT,
  dinner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hostel_id, day)
);

-- 11. Vacate Requests Table
CREATE TABLE vacate_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  requested_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Push Notification Tokens Table
CREATE TABLE user_push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);
