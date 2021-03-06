var should = require('should');
var request = require('supertest');
var proxyquire = require('proxyquire').noCallThru();
var superSecretToken = 'super-secret-token';
process.env.API_TOKEN = superSecretToken;
process.env.MONGOLAB_URI = 'mongodb://localhost:27017/testAddonDownloadTracker';
process.env.A127_ENV = 'test';

var databaseStub = {
  createConstraintsOnStartup: function () {
  },
  lookupAddons: function (res, callback) {
    res.json(['addon1', 'addon2']);
  },
  lookupAddon: function (name, res, callback) {
    res.json({
      addonName: name,
      curseForgeUrl: 'http://curseforge.com/' + name,
      wowInterfaceUrl: 'http://wowinterface.com/author'
    });
  },
  newAddon: function (name, curseForgeUrl, wowInterfaceUrl, res, callback) {
    res.json({
      addonName: name,
      curseForgeUrl: curseForgeUrl,
      wowInterfaceUrl: wowInterfaceUrl
    });
  },
  lookupDownloadsForAddon: function (addonName, res, callback) {
    var downloads = [];
    downloads.push({count: 1, timestamp: new Date()});
    downloads.push({count: 2, timestamp: new Date()});
    res.json({
      addonName: addonName,
      downloads: downloads
    });
  },
  newDownloadCountForAddon: function (name, count, timestamp, res, callback) {
    res.json({
      addonName: name,
      count: count,
      timestamp: timestamp
    });
  }
};

var addons = proxyquire('../../../api/controllers/addons', {'../helpers/database': databaseStub});
var server = require('../../../app');

describe('controllers', function () {
  describe('addons', function () {

    describe('GET /', function () {
      it('should return index.html', function (done) {
        request(server)
          .get('/')
          .expect('Content-Type', /html/)
          .expect(200, done);
      });
    });

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

    describe('Callback for GET /addons', function () {
      it('Should throw 500 if error is set', function (done) {
        var err = 'An error!';
        var res = {
          status: function (statusCode) {
            statusCode.should.be.exactly(500);
            return this;
          },
          json: function (message) {
            message.should.be.exactly('An error occurred while fetching addons, sorry.');
            return this;
          }
        };
        addons.getAddonsCallback(err, res, null);
        done();
      });

      it('Should give an empty JSON object if results are empty', function (done) {
        var results = [];
        var res = {
          json: function (message) {
            should.exist(message);
            (message).should.have.keys();
            (message).should.match({});
            return this;
          }
        };
        addons.getAddonsCallback(null, res, results);
        done();
      });

      it('Should give a JSON object with addonName if at least one result', function (done) {
        var results = [{addonName: 'myAddon', _id: 27, curseForgeUrl: 'foo', wowInterfaceUrl: 'bar'}];
        var res = {
          json: function (message) {
            should.exist(message);
            (message).should.have.length(1);
            (message).should.match(['myAddon']);
            return this;
          }
        };
        addons.getAddonsCallback(null, res, results);
        done();
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

    describe('Callback for GET /addons/foobar', function () {
      it('Should throw 500 if error is set', function (done) {
        var err = 'An error!';
        var res = {
          status: function (statusCode) {
            statusCode.should.be.exactly(500);
            return this;
          },
          json: function (message) {
            message.should.be.exactly('An error occurred while fetching the addon, sorry.');
            return this;
          }
        };
        addons.getAddonCallback(err, res, null);
        done();
      });

      it('Should give a 404 if results are empty', function (done) {
        var results = [];
        var res = {
          status: function (statusCode) {
            statusCode.should.be.exactly(404);
            return this;
          },
          json: function (message) {
            message.should.be.exactly('The requested addon could not be found.');
            return this;
          }
        };
        addons.getAddonCallback(null, res, results);
        done();
      });

      it('Should give a JSON object with addonName if at least one result', function (done) {
        var results = [{addonName: 'myAddon', _id: 27, curseForgeUrl: 'foo', wowInterfaceUrl: 'bar'}];
        var res = {
          json: function (message) {
            should.exist(message);
            message.should.have.keys('addonName', 'curseForgeUrl', 'wowInterfaceUrl');
            message.addonName.should.be.exactly('myAddon');
            return this;
          }
        };
        addons.getAddonCallback(null, res, results);
        done();
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
    });

    describe('Callback for POST /addons/foobar', function () {
      it('Should throw 400 if error is set', function (done) {
        var res = {
          status: function (statusCode) {
            statusCode.should.be.exactly(400);
            return this;
          },
          json: function (message) {
            message.should.be.exactly('The specified addon already exists: foobar');
            return this;
          }
        };
        addons.createAddonCallback('An error!', res, 'foobar', null);
        done();
      });

      it('Should give a JSON object without _id if a successful result', function (done) {
        var results = {
          ops: [
            {addonName: 'myAddon', _id: 27, curseForgeUrl: 'foo', wowInterfaceUrl: 'bar'}
          ]
        };
        var res = {
          json: function (addon) {
            should.exist(addon);
            addon.should.have.keys('addonName', 'curseForgeUrl', 'wowInterfaceUrl');
            addon.addonName.should.be.exactly('myAddon');
            return this;
          }
        };
        addons.createAddonCallback(null, res, 'foobar', results);
        done();
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
            downloads.length.should.be.exactly(2);
            var downloadCount = downloads[0];
            downloadCount.should.have.properties(['count', 'timestamp']);
            downloadCount['count'].should.be.an.instanceOf(Number);
            done();
          });
      });
    });

    describe('Callback for GET /addons/foobar/downloads', function () {
      it('Should throw 500 if error is set', function (done) {
        var err = 'An error!';
        var res = {
          status: function (statusCode) {
            statusCode.should.be.exactly(500);
            return this;
          },
          json: function (message) {
            message.should.be.exactly('An error occurred while fetching the addon download count, sorry.');
            return this;
          }
        };
        addons.getDownloadsForAddonCallback(err, res, null);
        done();
      });

      it('Should give a 404 if results are empty', function (done) {
        var results = [];
        var res = {
          status: function (statusCode) {
            statusCode.should.be.exactly(404);
            return this;
          },
          json: function (message) {
            message.should.be.exactly('No results were found for the addon download count, sorry.');
            return this;
          }
        };
        addons.getDownloadsForAddonCallback(null, res, results);
        done();
      });

      it('Should give a JSON object with addonName if at least one result', function (done) {
        var results = [
          {addon_id: 12, count: 1, timestamp: 'foo'},
          {addon_id: 12, count: 2, timestamp: 'foo+1'}
        ];
        var res = {
          json: function (message) {
            should.exist(message);
            message.should.have.keys('addonName', 'downloads');
            message.addonName.should.be.exactly('myAddon');
            message.downloads.should.be.length(2);
            message.downloads[0].should.have.keys('count', 'timestamp');
            return this;
          }
        };
        addons.getDownloadsForAddonCallback(null, res, 'myAddon', results);
        done();
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

    describe('Callback for POST /addons/foobar/downloads', function () {
      it('Should throw 500 if error is set', function (done) {
        var res = {
          status: function (statusCode) {
            statusCode.should.be.exactly(500);
            return this;
          },
          json: function (message) {
            message.should.be.exactly('An error occurred while posting download counts for foobar, sorry.');
            return this;
          }
        };
        addons.addDownloadsForAddonCallback('An error!', res, 'foobar', null, null, null);
        done();
      });

      it('Should give a JSON object without _id if a successful result', function (done) {
        var res = {
          json: function (addon) {
            should.exist(addon);
            addon.should.have.keys('addonName', 'count', 'timestamp');
            addon.addonName.should.be.exactly('foobar');
            addon.count.should.be.exactly(42);
            return this;
          }
        };
        addons.addDownloadsForAddonCallback(null, res, 'foobar', 42, 'now');
        done();
      });
    });
  });
});
