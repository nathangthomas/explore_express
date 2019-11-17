
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Publications';

app.get('/', (request, response) => {
  response.send('Hello, Publications');
});

app.get('/api/v1/papers/:id', (request, response) => {
  database('papers').where('id', request.params.id).select()
    .then(papers => {
      if (papers.length) {
        response.status(200).json(papers);
      } else {
        response.status(404).json({
          error: `Could not find paper with id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/papers/:id/footnotes', (request, response) => {
  database('papers').where('id', request.params.id)
    .then(papers => {
      if (papers.length) {
        database('footnotes')
          .innerJoin('papers', 'papers.id', 'footnotes.paper_id')
          .where('papers.id', request.params.id)
          .then(footnotes => {
            if (footnotes.length) {
              response.status(200).json(footnotes);
            } else {
              response.status(404).json({ error: `Could not find any footnotes for paper with id ${request.params.id}` })
            }
          })
        } else {
        response.status(404).json({ error: `Could not find paper with id ${request.params.id}` });
        }
      })
      .catch(error => {
      response.status(500).json({ error });
    });
});


app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});
