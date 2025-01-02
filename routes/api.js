'use strict';

export default function (app, Issue) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const params = req.query;
      if (Object.keys(params).length === 0) {
        Issue.find({})
        .then((data) => {
          const result = data.map(savedIssue => ({
            assigned_to: savedIssue.assigned_to,
            status_text: savedIssue.status_text,
            open: savedIssue.open,
            _id: savedIssue._id,
            issue_title: savedIssue.issue_title,
            issue_text: savedIssue.issue_text,
            created_by: savedIssue.created_by,
            created_on: savedIssue.created_on,
            updated_on: savedIssue.updated_on
          }))
  
          res.json(result);
        })
        .catch(e => console.log(e))
      } else {
        Issue.find(params)
        .then((data) => {
          const result = data.map(savedIssue => ({
            assigned_to: savedIssue.assigned_to,
            status_text: savedIssue.status_text,
            open: savedIssue.open,
            _id: savedIssue._id,
            issue_title: savedIssue.issue_title,
            issue_text: savedIssue.issue_text,
            created_by: savedIssue.created_by,
            created_on: savedIssue.created_on,
            updated_on: savedIssue.updated_on
          }))
          if (!result.length) res.json({ error: "No issues found with the given creteria" });
          res.json(result)
        })
        .catch(() => res.json({ error: "Error locating the issue" }));
      };
    
    })
    
    .post(function (req, res){
      const title = req.body.issue_title;
      const text = req.body.issue_text;
      const created_by = req.body.created_by || '';
      const assigned_to = req.body.assigned_to || '';
      const status_text = req.body.status_text;
      const newIssue = new Issue({
        title: title,
        text: text,
        created_by: created_by,
        issue_title: title,
        issue_text: text,
        assigned_to: assigned_to,
        status_text: status_text,
        created_on: new Date(),
        updated_on: new Date(),
      });

      newIssue.save()
      .then((savedIssue) => 
      {
        res.json({
          assigned_to: savedIssue.assigned_to,
          status_text: savedIssue.status_text,
          open: savedIssue.open,
          _id: savedIssue._id,
          issue_title: title,
          issue_text: text,
          created_by: savedIssue.created_by,
          created_on: savedIssue.created_on,
          updated_on: savedIssue.updated_on
        })
      })
      .catch((e) => res.json({ error: "error adding issue" }))
    })
    
    .put(function (req, res){
      const id = req.body._id;
      const title = req.body.issue_title || '';
      const text = req.body.issue_text || '';
      const created_by = req.body.created_by || '';
      const assigned_to = req.body.assigned_to || '';
      const status_text = req.body.status_text || '';
      const open = req.body.open === 'false' ? false : true;

      Issue.findById(id)
       .then((data) => {
          console.log(data)
          data.issue_title = title === ''? data.title : title;
          data.issue_text = text === ''? data.text : text;
          data.created_by = created_by === ''? data.created_by : created_by;
          data.assigned_to = assigned_to === ''? data.assigned_to : assigned_to;
          data.status_text = status_text === ''? data.status_text : status_text;
          data.updated_on = new Date();
          data.open = open
          data.save()
          .then((updatedIssue) => {
            res.json({
              result: "succesfully updated",
              _id: updatedIssue._id,
            });
           })
           .catch((e) => res.json({ error: "error updating!!" }));
       })
        .catch((e) => res.json({ error: "could not update", _id: id  }));
    })
    
    .delete(function (req, res){
      const id = req.body._id;
      if(!id) {res.json({ error: 'missing_id' })} else{
        Issue.deleteOne({ _id: id })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res.json({ error: "could not delete", _id: id });
        }
        res.json({ result: "successfully deleted", _id: id });
      })
      .catch((e) => {
        res.json({ error: "could not delete", _id: id });
      });
      }
    });
};




// Array Implementation
// 'use strict';

// export default function (app) {
//   const issues = [];

//   app.route('/api/issues/:project')
//     .get((req, res) => {
//       const project = req.params.project;
//       const query = req.query;

//       const projectIssues = issues.filter(issue => issue.project === project);

//       if (Object.keys(query).length > 0) {
//         const filteredIssues = projectIssues.filter(issue =>
//           Object.entries(query).every(([key, value]) => issue[key] === value || issue[key] == value)
//         );
//         return res.json(filteredIssues.length ? filteredIssues : { error: "No issues found with the given criteria" });
//       }

//       res.json(projectIssues);
//     })

//     .post((req, res) => {
//       const project = req.params.project;
//       const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

//       if (!issue_title || !issue_text || !created_by) {
//         return res.json({ error: 'required field(s) missing' });
//       }

//       const newIssue = {
//         _id: `${Date.now()}-${Math.random()}`, 
//         project,
//         issue_title,
//         issue_text,
//         created_by,
//         assigned_to: assigned_to || '',
//         status_text: status_text || '',
//         open: true,
//         created_on: new Date().toISOString(),
//         updated_on: new Date().toISOString()
//       };

//       issues.push(newIssue);
//       res.json(newIssue);
//     })

//     .put((req, res) => {
//       const { _id, ...updates } = req.body;

//       if (!_id) {
//         return res.json({ error: 'missing _id' });
//       }

//       if (Object.keys(updates).length === 0) {
//         return res.json({ error: 'no update field(s) sent', _id });
//       }

//       const issue = issues.find(issue => issue._id === _id);

//       if (!issue) {
//         return res.json({ error: 'could not update', _id });
//       }

//       Object.entries(updates).forEach(([key, value]) => {
//         if (value) issue[key] = value;
//       });

//       issue.updated_on = new Date().toISOString();
//       res.json({ result: 'successfully updated', _id });
//     })

//     .delete((req, res) => {
//       const { _id } = req.body;

//       if (!_id) {
//         return res.json({ error: 'missing _id' });
//       }

//       const index = issues.findIndex(issue => issue._id === _id);

//       if (index === -1) {
//         return res.json({ error: 'could not delete', _id });
//       }

//       issues.splice(index, 1);
//       res.json({ result: 'successfully deleted', _id });
//     });
// };


