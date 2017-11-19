'use strict';

const app      = require('express')();
const cors     = require('cors');
const rally    = require('./src/queryRally');
const sanitize = require('./src/sanitizeObjects');
const schema   = require('./src/dataSchema.json');

const PORT   = process.env.PORT || 8080;
const HOST   = process.env.HOST || '0.0.0.0';
const APIKEY = process.env.APIKEY;

app.use(cors({credentials: true, origin: true}))

sanitize.loadSchema(schema)
rally.loadSchema(schema)
rally.connection(APIKEY)

app.get('/', (req, res) => {
  res.send(require('./src/defaultRoute').response(req, app))
})

app.get('/project', (req, res) => {
  rally.queryAll('project')
    .then(sanitize.results)
    .then(result => res.send(result));
});

app.get('/project/:project/defects', (req, res) => {
  rally.queryAllByProject('defect', req.params.project)
    .then(sanitize.results)
    .then(result => res.send(result));
});

app.get('/initative/:initiativeName', (req, res) => {
  rally.queryFormattedID('portfolioitem/initiative', req.params.initiativeName)
    .then(sanitize.results)
    .then(result => res.send(result));
});

app.get('/initative/:initiativeName/features', (req, res) => {
  rally.queryFormattedID('portfolioitem/initiative', req.params.initiativeName)
    .then(rally.queryChildren)
    .then(sanitize.results)
    .then(result => res.send(result));
});

app.get('/initative/:initiativeName/features/userstories', (req, res) => {
  rally.queryFormattedID('portfolioitem/initiative', req.params.initiativeName)
    .then(rally.queryChildren)
    .then(rally.queryChildren)
    .then(sanitize.results)
    .then(result => res.send(result));
});

app.get('/feature/:featureName', (req, res) => {
  rally.queryFormattedID('portfolioitem/feature', req.params.featureName)
    .then(sanitize.results)
    .then(result => res.send(result));
});

app.get('/feature/:featureName/userstories', (req, res) => {
  rally.queryFormattedID('portfolioitem/feature', req.params.featureName)
    .then(rally.queryChildren)
    .then(sanitize.results)
    .then(result => res.send(result));
});


// Init

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`)
})