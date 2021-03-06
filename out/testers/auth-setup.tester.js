// Generated by CoffeeScript 1.10.0
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  module.exports = function(testers) {
    var AuthSetup, expect, fs, request, util;
    expect = require('chai').expect;
    request = require('request');
    fs = require('fs');
    util = require('util');
    return AuthSetup = (function(superClass) {
      extend(AuthSetup, superClass);

      function AuthSetup() {
        return AuthSetup.__super__.constructor.apply(this, arguments);
      }

      AuthSetup.prototype.testServer = function(next) {
        var forceServer, msg, tester;
        tester = this;
        AuthSetup.__super__.testServer.apply(this, arguments);
        forceServer = false;
        forceServer = tester.config.msg ? tester.config.msg.forceServerCreation || false : void 0;
        if (forceServer === void 0) {
          forceServer = false;
        }
        msg = forceServer ? "forceServerCreation: " : "";
        return this.suite(msg + ' auth setup', function(suite, test) {
          var baseUrl, loginTitleReg, outExpectedPath, plugin;
          baseUrl = "http://localhost:" + tester.docpad.config.port;
          loginTitleReg = /\<title\>Login Page\<\/title\>/;
          outExpectedPath = tester.config.outExpectedPath;
          plugin = tester.docpad.getPlugin('authentication');
          test('ensureAuthenticated method exists', function(done) {
            expect(plugin.getConfig().ensureAuthenticated).to.be["instanceof"](Function);
            return done();
          });
          test('getValidStrategies should return count of 1', function(done) {
            var count;
            count = plugin.getValidStrategies().count;
            expect(count).to.equal(1);
            return done();
          });
          test('forceServerCreation should be ' + forceServer, function(done) {
            var val;
            val = plugin.getConfig().forceServerCreation || false;
            expect(val).to.equal(forceServer);
            return done();
          });
          test('server should redirect to login page when not authenticated: admin.html', function(done) {
            var fileUrl;
            fileUrl = baseUrl + "/admin.html";
            return request(fileUrl, function(err, response, actual) {
              var m;
              if (err) {
                return done(err);
              }
              m = (actual.toString()).match(loginTitleReg);
              expect(m).to.not.be["null"];
              return done();
            });
          });
          return test('server should redirect to login page when not authenticated: analytics.html', function(done) {
            var fileUrl;
            fileUrl = baseUrl + "/analytics.html";
            return request(fileUrl, function(err, response, actual) {
              var m;
              if (err) {
                return done(err);
              }
              m = (actual.toString()).match(loginTitleReg);
              expect(m).to.not.be["null"];
              return done();
            });
          });
        });
      };

      return AuthSetup;

    })(testers.ServerTester);
  };

}).call(this);
