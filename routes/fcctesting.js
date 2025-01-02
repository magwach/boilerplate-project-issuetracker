/*
*
*
*
*
*
*
*
*
*
*
*
*       DO NOT EDIT THIS FILE
*       For FCC testing purposes!
*
*
*
*
*
*
*
*
*
*
*
*/

'use strict';

import cors from 'cors';
import fs from 'fs';
import runner from '../test-runner.js';

export default function (app) {

  app.route('/_api/server.js')
    .get(function(req, res, next) {
      console.log('requested1');
      fs.readFile(__dirname + '/server.js', function(err, data) {
        if(err) return next(err);
        res.send(data.toString());
      });
    });
  app.route('/_api/routes/api.js')
    .get(function(req, res, next) {
      console.log('requested2');
      fs.readFile(__dirname + '/routes/api.js', function(err, data) {
        if(err) return next(err);
        res.type('txt').send(data.toString());
      });
    });

  app.get('/_api/get-tests', cors(), function(req, res, next){
    console.log('requested');
    if(process.env.NODE_ENV === 'test') return next();
    res.json({status: 'unavailable'});
  },
  function(req, res, next){
    if(!runner.report) return next();
    res.json(testFilter(runner.report, req.query.type, req.query.n));
  },
  function(req, res){
    runner.on('done', function(report){
      process.nextTick(() =>  res.json(testFilter(runner.report, req.query.type, req.query.n)));
    });
  });
};

function testFilter(tests, type, n) {
  let out;
  switch (type) {
    case 'unit' :
      out = tests.filter(t => t.context.match('Unit Tests'));
      break;
    case 'functional':
      out = tests.filter(t => t.context.match('Functional Tests') && !t.title.match('#example'));
      break;
    default:
      out = tests;
  }
  if(n !== undefined) {
    return out[n] || out;
  }
  return out;
}