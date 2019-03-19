require('dotenv').config();
const parseArgs = require('minimist');
const fs = require('fs');
const path =  require('path');

const args = require('args');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const BUCKET_NAME= 'lcloud-427-pw';

const s3 = new AWS.S3();


args
    .command('list', 'list all files on s3', ['l'])
    .command('upload', 'upload file to s3', ['u'])
    .command('delete', 'delete file from s3', ['d'])
    .option('file', 'name of the file to upload or delete')
    .option('filter', 'use regex to filter files on s3');

const flags = parseArgs(process.argv);


function listS3(filter){
console.log(filter);
const params = {
    Bucket:BUCKET_NAME,
    Delimiter: '/'
    };

    if(filter){
        params.prefix = filter;
    }

    s3.listObjects(params, function(err, data) {
        if (err) {
            return 'There was an error viewing your bucket: ' + err.message
        }else{
            console.log(data.Contents,"all files");

            data.Contents.forEach(function(obj,index){
                console.log(obj.Key,"paths")
            })
        }
    })
}

function uploadToS3(filePath){
    if(!fs.lstatSync(filePath) || !fs.existsSync(filePath)){
        throw new Error('it is not a file, or it is not accesible');
    }

    var params = {
        Bucket: BUCKET_NAME,
        Body : fs.createReadStream(filePath),
        Key : Date.now()+"_"+path.basename(filePath)
      };


      s3.upload(params, function (err, data) {
        //handle error
        if (err) {
          console.log("Error", err);
        }
      
        //success
        if (data) {
          console.log("Uploaded in:", data.Location);
        }
      });
}


if(process.argv.includes('list') || process.argv.includes('l')){
    listS3(flags.filter);
}

if(process.argv.includes('upload') || process.argv.includes('u')){
    if(!flags.file === null){
        throw new Error('file location is required');
    }
    uploadToS3(flags.file);
}
