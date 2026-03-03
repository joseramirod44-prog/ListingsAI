/*
  # Marketplace Listing Generator Schema

  1. New Tables
    - `listings`
      - `id` (uuid, primary key) - Unique identifier for each listing
      - `user_id` (uuid) - Reference to auth.users (future auth integration)
      - `title` (text) - AI-generated or user-edited listing title
      - `description` (text) - AI-generated or user-edited description
      - `item_type` (text) - Category/type of item being listed
      - `brand` (text) - Brand name if applicable
      - `condition` (text) - Item condition (new, like new, good, fair, etc.)
      - `price` (decimal) - Suggested or final price
      - `tags` (text array) - AI-generated tags and keywords
      - `image_urls` (text array) - URLs to uploaded product images
      - `ai_metadata` (jsonb) - Stores AI analysis data and generation parameters
      - `created_at` (timestamptz) - When listing was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Storage
    - Create `listing-images` bucket for storing product photos
    - Enable public access for image URLs

  3. Security
    - Enable RLS on `listings` table
    - Add policies for public read access (for demo purposes)
    - Add policies for authenticated insert/update/delete operations
*/

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  item_type text,
  brand text,
  condition text,
  price decimal(10, 2),
  tags text[] DEFAULT '{}',
  image_urls text[] DEFAULT '{}',
  ai_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view listings" ON listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON listings;

-- Public read access for all listings
CREATE POLICY "Anyone can view listings"
  ON listings
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert their own listings
CREATE POLICY "Authenticated users can create listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own listings
CREATE POLICY "Users can update own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read access for listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;

-- Allow public read access to listing images
CREATE POLICY "Public read access for listing images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'listing-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own listing images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'listing-images');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();