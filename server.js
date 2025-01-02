'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'; 
dotenv.config();
import mongoose from 'mongoose';
import apiRoutes from './routes/api.js';
import fccTestingRoutes from './routes/fcctesting.js';
import emitter from './test-runner.js';

let app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.urlencoded({ extended: true }));

//MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Connection error:', err));

const librarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  created_by: String,
  assigned_to: String,
  status_text: String,
  issue_title: String,
  issue_text: String,
  created_on: Date,
  updated_on: Date,
  open: {
    type: Boolean,
    default: true,
  }
});

let Issue = mongoose.model('Issue', librarySchema);
//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });


//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app, Issue);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        emitter.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

export default app; //for testing
