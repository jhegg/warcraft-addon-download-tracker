var should = require('should');
var request = require('supertest');
var superSecretToken = 'super-secret-token';
process.env.API_TOKEN = superSecretToken; // required for app startup to succeed
var server = require('../../../app');

process.env.A127_ENV = 'test';

describe('controllers', function () {
  describe('addons', function () {
    describe('GET /addons', function () {
      it('should give 200 and return an array', function (done) {
        request(server)
          .get('/addons')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            var body = res.body;
            body.should.be.an.instanceOf(Array);
            done();
          });
      });
    });

    describe('GET /addons/foobar', function () {
      it('should give 200 and return an addon', function (done) {
        request(server)
          .get('/addons/foobar')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.should.have.property('addonName', 'foobar');
            res.body.should.have.property('curseForgeUrl', 'foo');
            res.body.should.have.property('wowInterfaceUrl', 'bar');
            done();
          });
      });
    });

    describe('POST /addons/foo', function () {
      it('should give 401 when missing api-token', function (done) {
        request(server)
          .post('/addons/foo')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send({addonName: 'foo', curseForgeUrl: 'curseUrl', wowInterfaceUrl: 'wowUrl'})
          .expect(401, done);
      });

      it('should give 406 when Content-Type is not application/json', function (done) {
        request(server)
          .post('/addons/foo')
          .set('Accept', 'application/json')
          .set('Content-Type', 'text/html')
          .send('foo')
          .expect(406, done);
      });

      it('should give 200 when valid api-token and content', function (done) {
        request(server)
          .post('/addons/foo')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('api-token', superSecretToken)
          .send({addonName: 'foo', curseForgeUrl: 'curseUrl', wowInterfaceUrl: 'wowUrl'})
          .expect(200, done);
      });
    });

    describe('GET /addons/foobar/downloads', function () {
      it('should give 200 and an array', function (done) {
        request(server)
          .get('/addons/foobar/downloads')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            var downloads = res.body.downloads;
            downloads.should.be.an.instanceOf(Array);
            downloads.length.should.be.above(0);
            var downloadCount = downloads[0];
            downloadCount.should.have.properties(['count', 'timestamp']);
            downloadCount['count'].should.be.an.instanceOf(Number);
            done();
          });
      });
    });

    describe('POST /addons/foobar/downloads', function () {
      it('should give 401 when missing api-token', function (done) {
        request(server)
          .post('/addons/foobar/downloads')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send({addonName: 'foo', downloads: 1})
          .expect(401, done);
      });

      it('should give 406 when Content-Type is not application/json', function (done) {
        request(server)
          .post('/addons/foobar/downloads')
          .set('Accept', 'application/json')
          .set('Content-Type', 'text/html')
          .send('foo')
          .expect(406, done);
      });

      it('should give 200 when valid api-token and download count', function (done) {
        request(server)
          .post('/addons/foobar/downloads')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('api-token', superSecretToken)
          .send({count: 1})
          .expect(200, done);
      });
    });
  });
});
