//@ts-check

require('dotenv').config();

const s3sync_config = {
    accessKeyId: process.env.S3SYNC_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3SYNC_SECRET_ACCESS_KEY,
    bucketName: process.env.S3SYNC_BUCKET_NAME,
    region: process.env.S3SYNC_REGION,
    distPath: process.env.S3SYNC_DIST_PATH,
    cacheControl: process.env.S3SYNC_CACHE_CONTROL,
};

const chalk = require('chalk');
const { S3Client, DeleteObjectsCommand, ListObjectsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const client = new S3Client({
    credentials: {
        accessKeyId: s3sync_config.accessKeyId,
        secretAccessKey: s3sync_config.secretAccessKey,
    },
    region: s3sync_config.region,
});

function getFiles(dirPath, files) {
    const dirFiles = fs.readdirSync(dirPath);

    files = files || [];

    for (const file of dirFiles) {
        const p = path.join(dirPath, file);
        if (fs.statSync(p).isDirectory()) {
            files = getFiles(p, files);
        } else {
            files.push(p);
        }
    }

    return files;
}

async function main() {
    try {
        const objsOutput = await client.send(new ListObjectsCommand({ Bucket: s3sync_config.bucketName }));

        // Empty the s3 bucket.
        if (objsOutput.Contents && objsOutput.Contents.length > 0) {
            const objsToDelete = objsOutput.Contents.map((obj) => {
                return {
                    Key: obj.Key 
                }
            });

            console.log(chalk.blueBright(`Deleting ${objsToDelete.length} objects from ${s3sync_config.bucketName}...`));
    
            await client.send(new DeleteObjectsCommand({
                Bucket: s3sync_config.bucketName,
                Delete: { Objects: objsToDelete },
            }));
        } else {
            console.log(chalk.blueBright(`${s3sync_config.bucketName} is already empty.`));
        }
        
        // Upload distribution folder contents to s3 bucket.
        const distFiles = getFiles(s3sync_config.distPath);
        console.log(chalk.blueBright(`Uploading ${distFiles.length} files to ${s3sync_config.bucketName}...`));
        
        for (let i = 0; i < distFiles.length; i++) {
            const file = distFiles[i];
            const s3path = file.substring(s3sync_config.distPath.length - 1);
            const contentType = mime.lookup(file) || 'application/octet-stream';

            console.log(`  > (${i + 1}/${distFiles.length}) ${s3path}`);

            await client.send(new PutObjectCommand({
                Bucket: s3sync_config.bucketName,
                Key: s3path,
                Body: fs.readFileSync(file),
                ContentType: contentType,
                CacheControl: s3sync_config.cacheControl,
            }));
        }
        
        console.log(chalk.green('S3 Sync done!'));
    } catch (error) {
        console.log(chalk.red(error));
    }
}


main();