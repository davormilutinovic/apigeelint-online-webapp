const assert = require('chai').assert;
const request = require('supertest');

const { app } = require('../server'); // Replace with the path to your Express app file

describe('Apigeelint Web UI App Tests', () => {

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
            .attach('file', './test/apiproxy-example.zip') // Replace with the path to a test zip file
            .query({ profile: 'apigee' }) // Replace with a test profile
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                assert.isString(res.text, 'Response should be a string');
                done();
            });
    });



});
