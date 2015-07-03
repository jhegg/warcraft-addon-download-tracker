var should = require('should');
var request = require('supertest');
var proxyquire = require('proxyquire').noCallThru();
var superSecretToken = 'super-secret-token';
process.env.API_TOKEN = superSecretToken;
process.env.MONGOLAB_URI = 'mongodb://localhost:27017/testAddonDownloadTracker';
process.env.A127_ENV = 'test';

var databaseStub = {
  lookupAddons: function (res, callback) {
    res.json(['addon1', 'addon2']);
  },
  lookupAddon: function (name) {
    return {
      addonName: name,
      curseForgeUrl: 'http://curseforge.com/' + name,
      wowInterfaceUrl: 'http://wowinterface.com/author'
    }
  },
  newAddon: function (name, curseForgeUrl, wowInterfaceUrl) {
    return {
      addonName: name,
      curseForgeUrl: curseForgeUrl,
      wowInterfaceUrl: wowInterfaceUrl
    }
  },
  lookupDownloadsForAddon: function (name) {
    var downloads = [];
    downloads.push({count: 1, timestamp: new Date()});
    downloads.push({count: 2, timestamp: new Date()});
    return {
      addonName: name,
      downloads: downloads
    };
  },
  newDownloadCountForAddon: function (name, count, timestamp) {
    return {
      addonName: name,
      count: count,
      timestamp: timestamp
    }
  }
};

var addons = proxyquire('../../../api/controllers/addons', {'../helpers/database': databaseStub});
var server = require('../../../app');

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
            body.should.be.length(2);
            body.should.containEql('addon1');
            body.should.containEql('addon2');
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
            res.body.should.have.property('curseForgeUrl', 'http://curseforge.com/foobar');
            res.body.should.have.property('wowInterfaceUrl', 'http://wowinterface.com/author');
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
          .send({curseForgeUrl: 'curseUrl', wowInterfaceUrl: 'wowUrl'})
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.should.have.property('addonName', 'foo');
            res.body.should.have.property('curseForgeUrl', 'curseUrl');
            res.body.should.have.property('wowInterfaceUrl', 'wowUrl');
            done();
          });
      });

      it('should give 400 when valid api-token but missing curseForgeUrl', function (done) {
        request(server)
          .post('/addons/foo')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('api-token', superSecretToken)
          .send({wowInterfaceUrl: 'wowUrl'})
          .expect(400, done);
      });

      it('should give 400 when valid api-token but missing wowInterfaceUrl', function (done) {
        request(server)
          .post('/addons/foo')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('api-token', superSecretToken)
          .send({curseForgeUrl: 'curseUrl'})
          .expect(400, done);
      });

      it('should give 400 when valid api-token but empty body', function (done) {
        request(server)
          .post('/addons/foo')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('api-token', superSecretToken)
          .send()
          .expect(400, done);
      });

      // todo add more tests around bad input, invalid addonNames and URLs, to test input filtering.
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
            downloads.length.should.be.exactly(2);
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
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.should.have.properties(['addonName', 'count', 'timestamp']);
            done();
          });
      });

      it('should give 400 when valid api-token but count is string', function (done) {
        request(server)
          .post('/addons/foobar/downloads')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('api-token', superSecretToken)
          .send({count: 'foo'})
          .expect(400, done);
      });

      it('should give 400 when valid api-token but count is negative', function (done) {
        request(server)
          .post('/addons/foobar/downloads')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('api-token', superSecretToken)
          .send({count: -1})
          .expect(400, done);
      });

      it('should give 400 when valid api-token but empty body', function (done) {
        request(server)
          .post('/addons/foobar/downloads')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('api-token', superSecretToken)
          .send()
          .expect(400, done);
      });
    });
  });
});
