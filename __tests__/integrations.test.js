const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const fs = require('fs').promises;
const endpoints = require('../endpoints.json');

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
        const expectedResponse = {
          errorMessage: `Oops.. We can't find that page for you`,
          errorParagraph: `We've searched high and low, but couldn't find the page you're looking for. How about we start from home again?`,
        };
        expect(body).toMatchObject(expectedResponse);
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
        expect(body).not.toBeUndefined();
        expect(body).toEqual(endpoints);
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
        const { topics } = body;
        const expectedKeys = ['slug', 'description'];
        topics.forEach((topic) => {
          expect(Object.keys(topic)).toEqual(expectedKeys);
          expect(Object.keys(topic).length).toBe(2);
          expect(typeof topic.slug).toBe('string');
          expect(typeof topic.description).toBe('string');
        });
      });
  });
  test.todo('Test for no topics found..?');
});

// ARTICLES
describe('Articles', () => {
  test('GET 200: Endpoint returns an a singular article by ID, with the appropriate properties.', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        const expectedArticle = {
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: '2020-07-09T20:11:00.000Z',
          votes: 100,
          article_img_url:
            'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        };
        const expectedKeys = [
          'article_id',
          'title',
          'topic',
          'author',
          'body',
          'created_at',
          'votes',
          'article_img_url',
        ];
        expectedKeys.forEach((key) => {
          expect(key in article).toBe(true);
        });
        expect(Object.keys(article).length).toBe(8);
        expect(article).toMatchObject(expectedArticle);
        expect(typeof article.article_id).toBe('number');
        expect(typeof article.title).toBe('string');
        expect(typeof article.topic).toBe('string');
        expect(typeof article.author).toBe('string');
        expect(typeof article.body).toBe('string');
        expect(typeof article.created_at).toBe('string');
        expect(typeof article.votes).toBe('number');
        expect(typeof article.article_img_url).toBe('string');
      });
  });
});