const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const fs = require('fs').promises;

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
        const expectedErrorMessage = `Oops.. We can't find that page for you`;
        const expectedErrorParagraph = `We've searched high and low, but couldn't find the page you're looking for. How about we start from home again?`;
        expect(body.errorMessage).toBe(expectedErrorMessage);
        expect(body.errorParagraph).toBe(expectedErrorParagraph);
      });
  });
});

// ENDPOINTS DESCRIPTION

describe('ENDPOINTS', () => {
  test('GET 200: Endpoint returns the endpoints description file detailing all endpoints.', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        fs.readFile(`${__dirname}/../endpoints.json`, 'utf-8').then((data) => {
          expect(body).not.toBeUndefined();
          expect(body).toEqual(JSON.parse(data));
        });
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
