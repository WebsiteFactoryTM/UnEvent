# Media Bucket Strategy for UnEvent

## Current Media Contexts

Your Media collection has 5 context types:
1. **`listing`** - Listing images (featured images, galleries for locations/services/events)
2. **`avatar`** - User profile avatars
3. **`event`** - Event-specific images
4. **`document`** - General documents
5. **`verification`** - Verification documents (ID cards, company documents, etc.)

## Recommended Bucket Organization

### Option 1: Two-Bucket Strategy (Recommended)

**Public Bucket** (`unevent-media-public`):
- **Contexts**: `listing`, `avatar`, `event`
- **Access**: Public read access (CDN-friendly)
- **Use Case**: Images that need to be publicly accessible
- **Caching**: Aggressive CDN caching (long TTL)
- **Size**: Largest bucket (most media)

**Private Bucket** (`unevent-media-private`):
- **Contexts**: `verification`, `document`
- **Access**: Private (signed URLs or authenticated access only)
- **Use Case**: Sensitive documents that should not be publicly accessible
- **Caching**: No public caching
- **Size**: Smaller bucket (fewer files)

**Benefits**:
- ✅ Security: Verification documents are protected
- ✅ Performance: Public images can be aggressively cached
- ✅ Cost: Different storage classes possible
- ✅ Compliance: Easier to audit private documents

### Option 2: Single Bucket with Prefixes (Simpler)

**Single Bucket** (`unevent-media`):
- **Structure**: Use prefixes/folders:
  - `public/listing/`
  - `public/avatar/`
  - `public/event/`
  - `private/verification/`
  - `private/document/`
  - `temp/` (for temporary uploads)

**Benefits**:
- ✅ Simpler setup (one bucket)
- ✅ Easier migration
- ✅ Still allows different access policies via prefixes

### Option 3: Context-Based Buckets (Most Granular)

**Separate buckets per context**:
- `unevent-listings`
- `unevent-avatars`
- `unevent-events`
- `unevent-documents`
- `unevent-verifications`

**Benefits**:
- ✅ Maximum organization
- ✅ Independent scaling per context
- ✅ Different storage classes per bucket

**Drawbacks**:
- ❌ More complex setup
- ❌ More buckets to manage
- ❌ Overkill for most use cases

---

## Recommendation: **Option 1 (Two-Bucket Strategy)**

### Why Two Buckets?

1. **Security**: Verification documents contain sensitive information (ID cards, company documents) and should NEVER be publicly accessible
2. **Performance**: Public images (listings, avatars) benefit from CDN caching
3. **Compliance**: Easier to implement access controls and audit private documents
4. **Cost**: Can use different storage classes (e.g., cheaper storage for private docs)

### Implementation

#### Bucket Structure:

```
Public Bucket (unevent-media-public):
├── listing/
│   ├── featured/
│   └── gallery/
├── avatar/
└── event/

Private Bucket (unevent-media-private):
├── verification/
│   ├── id/
│   ├── company/
│   └── other/
└── document/
```

#### Access Policies:

**Public Bucket**:
- Public read access for all files
- CDN caching enabled
- CORS configured for frontend domain

**Private Bucket**:
- No public access
- Signed URLs for temporary access
- Admin-only direct access
- Verification documents: Only accessible by uploader and admins

---

## Implementation with PayloadCMS Cloud Storage Plugin

### Configuration Example:

```typescript
// apps/backend/src/payload.config.ts
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

export default buildConfig({
  plugins: [
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: s3Adapter({
            config: {
              endpoint: process.env.R2_ENDPOINT,
              credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
              },
              region: 'auto',
            },
            bucket: process.env.R2_BUCKET_PUBLIC, // Default to public
          }),
          // Dynamic bucket selection based on context
          generateFileURL: ({ prefix, filename }) => {
            return `${process.env.R2_PUBLIC_URL}/${prefix}/${filename}`
          },
        },
      },
    }),
  ],
})
```

### Dynamic Bucket Selection:

You'll need to customize the upload hook to select the bucket based on `context`:

```typescript
// In Media collection hooks
beforeChange: [
  ({ data, req }) => {
    const context = data?.context || 'listing'
    
    // Determine bucket based on context
    const isPrivate = context === 'verification' || context === 'document'
    const bucket = isPrivate 
      ? process.env.R2_BUCKET_PRIVATE 
      : process.env.R2_BUCKET_PUBLIC
    
    // Store bucket info in metadata or use separate collections
    return {
      ...data,
      bucket, // Store for reference
    }
  },
]
```

---

## Migration Strategy

### Phase 1: Setup Buckets
1. Create two R2 buckets: `unevent-media-public` and `unevent-media-private`
2. Configure CORS for public bucket
3. Set up access policies

### Phase 2: Update Media Collection
1. Add bucket selection logic based on `context`
2. Update upload hooks to route to correct bucket
3. Update file URL generation

### Phase 3: Migrate Existing Files (if any)
1. Scan existing media by context
2. Move verification/document files to private bucket
3. Keep listing/avatar/event in public bucket

---

## Access Control Recommendations

### Public Bucket (`listing`, `avatar`, `event`):
- ✅ Public read access
- ✅ CDN caching (1 year TTL)
- ✅ CORS enabled for your domain
- ✅ No authentication required

### Private Bucket (`verification`, `document`):
- ❌ No public read access
- ✅ Signed URLs for temporary access (e.g., 1 hour expiry)
- ✅ Admin-only direct access
- ✅ Access logging enabled
- ✅ Encryption at rest

---

## Cost Considerations

### Public Bucket:
- **Storage**: Standard storage class
- **Bandwidth**: High (CDN cached)
- **Requests**: Many GET requests (cached)

### Private Bucket:
- **Storage**: Standard storage class (smaller volume)
- **Bandwidth**: Low (signed URLs, limited access)
- **Requests**: Few GET requests

---

## Security Best Practices

1. **Verification Documents**:
   - Never expose via public URLs
   - Use signed URLs with short expiration (1 hour)
   - Only accessible by uploader and admins
   - Consider encryption at rest

2. **Public Images**:
   - Validate file types (images only)
   - Scan for malware
   - Set appropriate CORS headers
   - Use CDN for performance

3. **Temporary Files**:
   - Auto-delete after 24-48 hours
   - Separate cleanup process
   - Don't expose in public bucket

---

## Summary

**Recommended**: Use **two buckets**:
- **Public**: `listing`, `avatar`, `event` (public access, CDN cached)
- **Private**: `verification`, `document` (signed URLs only, no public access)

This provides the best balance of security, performance, and simplicity.

