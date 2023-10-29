const assert = require('chai').assert;
const request = require('supertest');

const { app } = require('../server');


let server; // Declare a variable to hold the server instance

describe('Apigeelint Web UI App Tests', () => {

    // Before running the tests, start the server
    before((done) => {
        server = app.listen(3000, () => {
            console.log('Server started on port 3000');
            done();
        });
    });

    // After running the tests, close the server
    after((done) => {
        server.close(() => {
            console.log('Server stopped');
            done();
        });
    });

    it('should return the index.html file for GET /', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(res.type, 'text/html');
                done();
            });

    });

    it('should upload a zip file and analyze it for POST /upload', (done) => {
        request(app)
            .post('/upload')
            .attach('file', './test/apiproxy-example.zip')
            .query({ profile: 'apigee' })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                assert.isString(res.text, 'Response should be a string');
                done();
            });
    });

    it('should test if uploaded file is not proper bundle', (done) => {
        // Create a non-zip file for testing (e.g., a text file)
        const nonZipFilePath = './test/no-proxy.zip';

        // Perform a POST request to your upload route with the non-zip file
        request(app)
            .post('/upload')
            .attach('file', nonZipFilePath)
            .end((err, res) => {
                if (err) done(err);
                assert.isTrue(res.text.includes('Bundle must have either apiproxy or sharedflow directory'));
                done();
            });
    });



});
