const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');

// require('jest-sorted') ← not required for now.

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

// ERROR TESTS
describe('404: Incorrect URL', () => {
  test('Receive 404, when hitting an invalid endpoint.', () => {
    return request(app)
      .get('/api/invalid_url')
      .expect(404)
      .then(({ body }) => {
        console.log(body.errorMessage);
        const expectedErrorMessage = `Oops.. We can't find that page for you`;
        const expectedErrorParagraph = `We've searched high and low, but couldn't find the page you're looking for. How about we start from home again?`;
        expect(body.errorMessage).toBe(expectedErrorMessage);
        expect(body.errorParagraph).toBe(expectedErrorParagraph);
      });
  });
});

// TOPICS
describe('Topics', () => {
  test('GET 200: Endpoint returns an array of topics, with the slug and description.', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        const expectedKeys = ['slug', 'description'];
        body.forEach((topic) => {
          expect(Object.keys(topic)).toEqual(expectedKeys);
        });
      });
  });
  test.todo('Test for no topics found..?');
});

// [] Don't forget to remove .only once tests have been complete!
