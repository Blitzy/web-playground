# Web Playground

A ready to use environment for building and playing with web technologies.

## Build and Run Locally

Build in development mode:

```plaintext
npm run build:dev
```

Start local web server:

```plaintext
npm run serve
```

Open browser to `localhost:5000`

## Public Deployment

Can be deployed to S3 bucket with:

```plaintext
npm run s3:build:sync
```

Make sure all your environment variables are setup in a `.env` file at the folder root.

Placeholder `.env` file:

```plaintext
S3SYNC_REGION="your_region_key"
S3SYNC_ACCESS_KEY_ID="yuor_access_key_id"
S3SYNC_SECRET_ACCESS_KEY="your_secret_access_key"
S3SYNC_BUCKET_NAME="your_bucket_name"
S3SYNC_DIST_PATH="./dist"
```

Current deployment: <http://blitzy3d-web-playground.s3-website.us-east-2.amazonaws.com/>
