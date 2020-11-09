module.exports = function publish(organization, environment, user, password, appName) {

    const axios = require('axios');
    const { zip } = require('zip-a-folder');
    const fs = require('fs');
    const path = require('path');
    const FormData = require('form-data');
    const qs = require('querystring');

    let baseUrl = `https://${organization}.carol.ai`;
    let token;

    const requestBody = {
        grant_type: 'password',
        username: user,
        password: password,
        connectorId: '0a0829172fc2433c9aa26460c31b78f0',
        subdomain: environment,
        orgSubdomain: organization
    };

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    axios.post(`${baseUrl}/api/v1/oauth2/token`, qs.stringify(requestBody), config)
        .then((result) => {
            token = result.data.access_token;
            publish();
        })
        .catch((err) => {
            console.error(err);
        });

    function publish() {

        const appFolder = './';
        const newAppFolder = '../publish';
        const newFilesFolder = '../publish/site';
        const zipFile = '../publish.zip';

        console.log('Creating publish folder');
        rmdir(newAppFolder);
        mkdir(newAppFolder);

        console.log('Copying files to site folder');
        copyDir(appFolder, newFilesFolder);
        console.log('Zipping');
        zip(newAppFolder, zipFile).then(() => {

            const config = {
                method: 'get',
                url: `${baseUrl}/api/v1/carolApps/name/${appName}`,
                headers: { 'authorization': token }
            }

            console.log('Looking for Carol app');
            axios(config).then(res => {
                const carolApp = res.data[0];

                console.log(`Found app ${carolApp.mdmId}`);

                let form = new FormData();
                form.append('file', fs.createReadStream(zipFile), 'publish.zip');
                console.log('Uploading app zip');
                form.submit({
                    protocol: 'https:',
                    host: `${organization}.carol.ai`,
                    path: `/api/v1/carolApps/${carolApp.mdmId}/files/upload`,
                    headers: { 'authorization': token }
                }, (err, res) => {
                    err && handleError(err);
                    console.log('Cleaning publish folder');
                    rmdir(newAppFolder);
                    console.log('Done!');
                    process.exit(0);
                });

            }).catch(handleError);
        });
    }

    function handleError(err) {
        console.error(JSON.stringify(err, null, 2));
        process.exit(1);
    }

    function copyDir(src, dest) {
        mkdir(dest);
        var files = fs.readdirSync(src);
        for (var i = 0; i < files.length; i++) {
            var current = fs.lstatSync(path.join(src, files[i]));
            if (current.isDirectory()) {
                copyDir(path.join(src, files[i]), path.join(dest, files[i]));
            } else if (current.isSymbolicLink()) {
                var symlink = fs.readlinkSync(path.join(src, files[i]));
                fs.symlinkSync(symlink, path.join(dest, files[i]));
            } else {
                copy(path.join(src, files[i]), path.join(dest, files[i]));
            }
        }
    }

    function mkdir(dir) {
        try {
            fs.mkdirSync(dir);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }
    }

    function rmdir(dir) {
        if (fs.existsSync(dir)) {
            var list = fs.readdirSync(dir);
            for (var i = 0; i < list.length; i++) {
                var filename = path.join(dir, list[i]);
                var stat = fs.statSync(filename);

                if (filename == '.' || filename == '..') {
                } else if (stat.isDirectory()) {
                    rmdir(filename);
                } else {
                    fs.unlinkSync(filename);
                }
            }
            fs.rmdirSync(dir);
        } else {
            console.warn('warn: ' + dir + ' not exists');
        }
    };

    function copyDir(src, dest) {
        mkdir(dest);
        var files = fs.readdirSync(src);
        for (var i = 0; i < files.length; i++) {
            var current = fs.lstatSync(path.join(src, files[i]));
            if (current.isDirectory()) {
                copyDir(path.join(src, files[i]), path.join(dest, files[i]));
            } else if (current.isSymbolicLink()) {
                var symlink = fs.readlinkSync(path.join(src, files[i]));
                fs.symlinkSync(symlink, path.join(dest, files[i]));
            } else {
                copy(path.join(src, files[i]), path.join(dest, files[i]));
            }
        }
    };

    function copy(src, dest) {
        var oldFile = fs.createReadStream(src);
        var newFile = fs.createWriteStream(dest);
        oldFile.pipe(newFile);
    }




};