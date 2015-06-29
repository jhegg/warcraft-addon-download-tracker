var should = require('should');
var request = require('supertest');
var server = require('../../../app');

process.env.A127_ENV = 'test';

describe('controllers', function() {

  describe('addons', function() {

    describe('GET /addons', function() {

      it('should return an array', function(done) {

        request(server)
          .get('/addons')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.be.array

            done();
          });
      });

    });

  });

});
