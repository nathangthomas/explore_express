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

app.post('/api/v1/papers', (request, response) => {
  const paper = request.body;

  for (let requiredParameter of ['title', 'author']) {
    if (!paper[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { title: <String>, author: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }

  database('papers').insert(paper, 'id')
    .then(paper => {
      response.status(201).json({ id: paper[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/footnotes', (request, response) => {
  const footnote = request.body;

  for (let requiredParameter of ['footnote', 'paper_id']) {
    if (!footnote[requiredParameter]) {
      return response
        .status(422)
        .send({
          error: "Expected format: { footnote: <String>, paper_id: <String> }." +
            `You're missing a '${requiredParameter}' property.`
        });
    }
  }

  database('papers').where('id', footnote.paper_id)
    .then(paper => {
      if (paper.length) {
        database('footnotes').insert(footnote, 'id')
          .then(footnote => {
            response.status(201).json({ id: footnote[0] })
          })
          .catch(error => {
            response.status(500).json({ error })
          });
      } else {
        response.status(404).json({ error: `Could not find paper with id ${footnote.paper_id}`})
      }
    });
});



app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});
