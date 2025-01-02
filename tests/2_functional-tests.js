import * as chai from 'chai';
const assert = chai.assert;
import { suite, test } from 'mocha';
import chaiHttp from 'chai-http';
import server from '../server.js';
chai.use(chaiHttp);

suite('Issue Tracker API Tests', function() {
  let projectName = 'apitest';
  let issueId;

  test('should create an issue with every field', function(done) {
    const newIssue = {
      issue_title: 'Test Issue Title',
      issue_text: 'Test Issue Text',
      created_by: 'Joe',
      assigned_to: 'Jane',
      status_text: 'In Progress',
    };

    chai.request(server)
      .post(`/api/issues/${projectName}`)
      .send(newIssue)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, newIssue.issue_title);
        assert.equal(res.body.issue_text, newIssue.issue_text);
        assert.equal(res.body.created_by, newIssue.created_by);
        assert.equal(res.body.assigned_to, newIssue.assigned_to);
        assert.equal(res.body.status_text, newIssue.status_text);
        issueId = res.body._id;
        done();
      });
  });

  test('should create an issue with only required fields', function(done) {
    const newIssue = {
      issue_title: 'Test Issue Title',
      issue_text: 'Test Issue Text',
      created_by: 'Joe',
    };

    chai.request(server)
      .post(`/api/issues/${projectName}`)
      .send(newIssue)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, newIssue.issue_title);
        assert.equal(res.body.issue_text, newIssue.issue_text);
        assert.equal(res.body.created_by, newIssue.created_by);
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        done();
      });
  });

  test('should return error for missing required fields', function(done) {
    const newIssue = {
      issue_text: 'Test Issue Text',
      created_by: 'Joe',
    };

    chai.request(server)
      .post(`/api/issues/${projectName}`)
      .send(newIssue)
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('should view issues on a project', function(done) {
    chai.request(server)
      .get(`/api/issues/${projectName}`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('should view issues with one filter', function(done) {
    chai.request(server)
      .get(`/api/issues/${projectName}?assigned_to=Joe`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.assigned_to, 'Joe');
        });
        done();
      });
  });

  test('should view issues with multiple filters', function(done) {
    chai.request(server)
      .get(`/api/issues/${projectName}?assigned_to=Joe&open=true`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.assigned_to, 'Joe');
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  test('should update one field on an issue', function(done) {
    chai.request(server)
      .put(`/api/issues/${projectName}`)
      .send({ _id: issueId, issue_title: 'Updated Title' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  test('should update multiple fields on an issue', function(done) {
    chai.request(server)
      .put(`/api/issues/${projectName}`)
      .send({
        _id: issueId,
        issue_title: 'Updated Title Again',
        status_text: 'Completed',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  test('should return error for missing _id in PUT', function(done) {
    chai.request(server)
      .put(`/api/issues/${projectName}`)
      .send({ issue_title: 'Updated Title' })
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('should return error for no fields to update in PUT', function(done) {
    chai.request(server)
      .put(`/api/issues/${projectName}`)
      .send({ _id: issueId })
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('should return error for invalid _id in PUT', function(done) {
    chai.request(server)
      .put(`/api/issues/${projectName}`)
      .send({ _id: 'invalidId', issue_title: 'Updated Title' })
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('should delete an issue', function(done) {
    chai.request(server)
      .delete(`/api/issues/${projectName}`)
      .send({ _id: issueId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  test('should return error for invalid _id in DELETE', function(done) {
    chai.request(server)
      .delete(`/api/issues/${projectName}`)
      .send({ _id: 'invalidId' })
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('should return error for missing _id in DELETE', function(done) {
    chai.request(server)
      .delete(`/api/issues/${projectName}`)
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
