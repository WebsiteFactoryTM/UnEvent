/**
 * R2 (S3-compatible) adapter for PayloadCMS cloud storage plugin
 */
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import { isPrivateContext } from './storage'

export const r2Adapter: Adapter = ({ prefix: defaultPrefix }) => {
  // Create S3 clients for both buckets
  const publicS3Client = new S3Client({
    endpoint: process.env.R2_PUBLIC_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    region: 'auto',
    forcePathStyle: true,
  })

  // Private bucket client (use private endpoint if available, otherwise use public endpoint)
  const privateS3Client = process.env.R2_PRIVATE_ENDPOINT
    ? new S3Client({
        endpoint: process.env.R2_PRIVATE_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        forcePathStyle: true,
      })
    : publicS3Client

  const publicBucket = process.env.R2_PUBLIC_BUCKET || ''
  const privateBucket = process.env.R2_PRIVATE_BUCKET || publicBucket

  // Helper to get bucket and client based on context
  const getBucketConfig = (context: string) => {
    const isPrivate = isPrivateContext(
      context as 'listing' | 'avatar' | 'event' | 'document' | 'verification',
    )
    return {
      bucket: isPrivate ? privateBucket : publicBucket,
      client: isPrivate ? privateS3Client : publicS3Client,
    }
  }

  const generatedAdapter: GeneratedAdapter = {
    name: 'r2',
    handleUpload: async ({ file, data }) => {
      const context = (data as { context?: string })?.context || 'listing'
      const filePrefix = defaultPrefix || `${context}/${data?.id || 'temp'}`
      const key = `${filePrefix}/${file.filename}`
      const { bucket, client } = getBucketConfig(context)

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimeType,
        }),
      )
    },
    handleDelete: async ({ filename, doc }) => {
      const context = (doc as { context?: string })?.context || 'listing'
      const filePrefix = defaultPrefix || `${context}/${doc?.id || 'temp'}`
      const key = `${filePrefix}/${filename}`
      const { bucket, client } = getBucketConfig(context)

      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      )
    },
    generateURL: ({ filename, prefix, data }) => {
      const context = (data as { context?: string })?.context || 'listing'
      const filePrefix = prefix || defaultPrefix || `${context}/${data?.id || 'temp'}`
      const isPrivate = isPrivateContext(
        context as 'listing' | 'avatar' | 'event' | 'document' | 'verification',
      )

      // For private buckets, use private endpoint URL if available
      // Note: In Phase 2, these will need signed URLs for security
      const baseUrl =
        isPrivate && process.env.R2_PRIVATE_ENDPOINT
          ? process.env.R2_PRIVATE_ENDPOINT.replace('/api', '')
          : process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_ENDPOINT?.replace('/api', '')

      const bucket = isPrivate ? privateBucket : publicBucket
      return `${baseUrl}/${bucket}/${filePrefix}/${filename}`
    },
    staticHandler: async (_req, { params, doc }) => {
      // Determine context from doc or default to 'listing'
      const context = (doc as { context?: string })?.context || 'listing'
      const { bucket, client } = getBucketConfig(context)
      const key = `${params.collection}/${params.filename}`
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      try {
        const response = await client.send(command)
        const stream = response.Body as ReadableStream

        return new Response(stream, {
          headers: {
            'Content-Type': response.ContentType || 'application/octet-stream',
            'Content-Length': String(response.ContentLength || 0),
          },
        })
      } catch (_error) {
        return new Response('File not found', { status: 404 })
      }
    },
  }

  return generatedAdapter
}
