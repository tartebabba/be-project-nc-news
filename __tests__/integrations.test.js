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

// ARTICLES
describe.only('Articles', () => {
  test('GET 200: Endpoint returns an a singular article by ID, with the appropriate properties.', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body }) => {
        const { article } = body
        const expectedArticle = {
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: '2020-07-09T20:11:00.000Z',
          votes: 100,
          article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
        }
        const expectedKeys = ["article_id", "title", "topic", "author", "body", "created_at", "votes", "article_img_url"];
        expectedKeys.forEach((key) => {
          expect(key in article).toBe(true)
        })
        expect(Object.keys(article).length).toBe(8)
        expect(article).toMatchObject(expectedArticle);
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.title).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.author).toBe("string");
        expect(typeof article.body).toBe("string");
        expect(typeof article.created_at).toBe("string")
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
      });
  });
  test.todo('Test for no topics found..?');
});

// [] Update fetch-topics to send back with meaningful key.
// [] Assert the types for each of the keys for fetch-topics.
// [] Update the error message to use toMatchObjects().
// [] Remove all console.logs.
// [] Update endpoints test to only require the file and not go through fs