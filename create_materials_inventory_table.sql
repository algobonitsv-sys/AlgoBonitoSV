-- Create materials table for inventory management
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for materials table
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at DESC);

-- Enable RLS for materials table
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for materials table
CREATE POLICY "Users can view all materials" ON materials
  FOR SELECT USING (true);

CREATE POLICY "Users can insert materials" ON materials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update materials" ON materials
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete materials" ON materials
  FOR DELETE USING (true);

-- Grant necessary permissions
GRANT ALL ON materials TO authenticated;
GRANT ALL ON materials TO anon;