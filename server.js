const express = require('express');
const multer = require('multer');
const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function cleanBundleArtifacts(filePath, extractPath) {

    // Delete the extracted folder after processing the bundle
    fs.rm(extractPath, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error(`Error deleting extracted folder: ${err}`);
        }
    });

    // Delete the uploaded zip file
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error deleting zip file: ${err}`);
        }
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {

    const filePath = path.join(__dirname, req.file.path);

    // Extracting the zip file
    const zip = new AdmZip(filePath);
    const extractPath = path.join(__dirname, 'extracted-' + req.file.originalname);
    zip.extractAllTo(extractPath, true);

    // Find bundle type (apiproxy or sharedflow)
    var bundleType;
    if (fs.existsSync(extractPath + '/apiproxy'))
        bundleType = 'apiproxy';
    else if (fs.existsSync(extractPath + '/sharedflows'))
        bundleType = 'sharedflows';
    else {
        cleanBundleArtifacts(filePath, extractPath);
        return res.send('Bundle must have either apiproxy or sharedflow directory');
    }

    const command = `node ./node_modules/apigeelint/cli.js --profile ${req.query.profile} -s ${extractPath}/${bundleType} -f table.js `;

    try {
        var result = execSync(command).toString();

        cleanBundleArtifacts(filePath, extractPath);
        res.send(result);

    } catch (error) {
        cleanBundleArtifacts(filePath, extractPath);
        res.send("Error");
    }

});

// Only start the server if not being used as a module in tests
if (!module.parent) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

};

module.exports = {
    app
};


