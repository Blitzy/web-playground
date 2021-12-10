# Blitzy's Web Playground

A ready to use environment for building and playing with web technologies.

## 💾 Repository Install

Clone this repository using Git:

```zsh
git@github.com:Blitzy/web-playground.git
```

Move to the git repository folder:

```zsh
cd web-playground
```

Move to the project folder:

```zsh
cd web-playground
```

Run npm install command to install all package depencecies:

```zsh
npm install
```

## 🛠️ Start Developing

To run in development mode:

```zsh
npm run dev
```

## 📦 Deployment Builds

### Build for Production

To make a build ready for deployment on a production server:

```zsh
npm run build
```

A folder will be created at `<root>/web-playground/dist/` that can then be uploaded to the web server.

### Upload to S3

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

Current deployment: <https://d1afogi0np7kx8.cloudfront.net/>