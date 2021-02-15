//@ts-check

require('dotenv').config();

const chalk = require('chalk');
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_S3_REGION,
});

async function main() {
    try {
        const data = await client.send(new ListBucketsCommand({}));
        console.log(chalk.green('Success'), data.Buckets);
    } catch (error) {
        console.log(chalk.red(error));
    }
    
    console.log('\nDone!');
}


main();