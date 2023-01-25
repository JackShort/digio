import S3 from 'aws-sdk/clients/s3'
import { randomUUID } from 'crypto';
import { z } from 'zod';

import { env } from '../../../env/server.mjs';
import { createTRPCRouter, publicProcedure } from '../trpc';

const s3 = new S3({
    apiVersion: "2006-03-01",
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_KEY,
    region: 'us-east-1',
    signatureVersion: 'v4',
})

export const presignedUrlRouter = createTRPCRouter({
  generate: publicProcedure
    .mutation(() => {
        const key = `${randomUUID()}.zip`;

        const params = {
            Bucket: 'unidemo',
            Key: key,
            ContentType: 'application/zip',
        }
        
        const url = s3.getSignedUrl('putObject', params)

        return {url: url, key: key}
    }),
});