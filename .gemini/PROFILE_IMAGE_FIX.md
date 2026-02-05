# Profile Image Upload Fix - Implementation Guide

## Issue
Profile images were being stored as base64 strings, which:
- Can exceed database column size limits
- Are inefficient for storage and transmission
- Don't persist correctly due to size constraints

## Solution
Migrate to Supabase Storage for proper image hosting.

## Setup Instructions

### Step 1: Create Storage Bucket in Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Create a bucket with:
   - Name: `assets`
   - **Public bucket**: ✅ ENABLED (check this box)
   - Click "Create bucket"

### Step 2: Configure Storage Policies

Go to the **Policies** tab for the `assets` bucket and add these policies:

#### Policy 1: Allow authenticated uploads
```sql
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');
```

#### Policy 2: Public read access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');
```

#### Policy 3: Allow updates
```sql
CREATE POLICY "Users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets');
```

#### Policy 4: Allow deletes
```sql
CREATE POLICY "Users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets');
```

### Alternative: Use SQL Editor

Copy and paste this into the Supabase SQL Editor:

```sql
-- Create public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Clear existing policies (if any)
DROP POLICY IF EXISTS "Users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images" ON storage.objects;

-- Create new policies
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');

CREATE POLICY "Users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets');

CREATE POLICY "Users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets');
```

### Step 3: Test the Upload

1. Navigate to the Profile page
2. Click "CHANGE" button
3. Click "UPLOAD CUSTOM IMAGE"
4. Select an image (max 5MB)
5. You should see: "Image uploaded. Click 'Authorize Updates' to save."
6. Enter your current password
7. Click "AUTHORIZE UPDATES"
8. The image should now persist!

## How It Works Now

1. **Image Selection**: When you select an image, it's immediately uploaded to Supabase Storage
2. **URL Storage**: Only the public URL (not the full image data) is saved to the database
3. **Display**: The image is loaded from the CDN using the public URL
4. **Persistence**: URLs are lightweight and persist reliably

## Benefits

✅ No size limits (supports images up to 5MB, can be increased)
✅ Fast CDN delivery
✅ Reliable persistence
✅ Proper file management
✅ Automatic caching

## Troubleshooting

### Error: "Failed to upload image"
- Make sure the `assets` bucket exists in Supabase Storage
- Verify the bucket is set to **public**
- Check that storage policies are created correctly

### Image doesn't appear after save
- Check browser console for errors
- Verify the public URL is accessible (copy and paste in new tab)
- Ensure your Supabase project has storage enabled

### Still having issues?
1. Open browser Console (F12)
2. Try uploading again
3. Share any error messages that appear
