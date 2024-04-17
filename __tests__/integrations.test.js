const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const endpoints = require('../endpoints.json');
const users = require('../db/data/test-data/users');
const articles = require('../db/data/test-data/articles');
require('jest-sorted');

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

// ERROR MESSAGES
// ! Ensure to align with error.js messages
const badRequest = 'Bad request';
const recordNotFound =
  "Sorry! We weren't able to find what you were looking for.";
const recordsNotFound = "Uh oh! Looks like there's nothing to see here..";
const invalidInput = 'Invalid input: incorrect data format.';

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
});

// ARTICLES
describe('Articles', () => {
  describe('All Articles', () => {
    test('GET 200: Endpoint returns all articles', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const expectedKeys = [
            'article_id',
            'title',
            'topic',
            'author',
            'body',
            'created_at',
            'votes',
            'article_img_url',
            'comment_count',
          ];
          const expectedArticle = {
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          };
          const isDescending = true;
          expect(articles).toBeSortedBy('created_at', {
            descending: isDescending,
          });
          expect(articles.length).toBe(13);
          articles.forEach((articles) => {
            expect(Object.keys(articles)).toEqual(expectedKeys);
            expect(articles).toMatchObject(expectedArticle);
          });
        });
    });
  });
  describe('Specific Articles', () => {
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
    test('Get 404: Endpoint returns an error when an article_id is not available', () => {
      return request(app)
        .get('/api/articles/999999')
        .expect(404)
        .then(({ body }) => {
          const { errorMessage } = body;
          const expectedResponse = recordNotFound;
          expect(errorMessage).toBe(expectedResponse);
        });
    });
    test('GET 200: Endpoint returns an a singular article by ID, with a comment count', () => {
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body: { article } }) => {
          const expectedArticle = {
            article_id: 1,
            title: 'Living in the shadow of a great man',
            topic: 'mitch',
            author: 'butter_bridge',
            body: 'I find this existence challenging',
            created_at: '2020-07-09T20:11:00.000Z',
            votes: 100,
            comment_count: 11,
            article_img_url:
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
          };
          expect('comment_count' in article).toBe(true);
          expect(Object.keys(article).length).toBe(9);
          expect(article).toMatchObject(expectedArticle);
          expect(typeof article.comment_count).toBe('number');
        });
    });
  });
  describe('GET /api/articles/:article_id/comments', () => {
    test('GET 200: Endpoint returns all article comments from the specified article_id', () => {
      return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          const article_id = 1;
          const expectedComment = {
            comment_id: expect.any(Number),
            article_id: expect.any(Number),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
          };
          const isDescending = true;
          expect(comments).toBeSortedBy('created_at', {
            descending: isDescending,
          });
          comments.forEach((comment) => {
            expect(comment.article_id).toBe(article_id);
            expect(comment).toMatchObject(expectedComment);
          });
        });
    });
    test('GET 200: Endpoint returns an empty array when article has no comments', () => {
      return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          const hasComments = comments.length;
          expect(hasComments).toBeFalsy();
        });
    });
    test('GET 404: Endpoint returns error message when article does not exist', () => {
      return request(app)
        .get('/api/articles/200/comments')
        .expect(404)
        .then(({ body }) => {
          const expectedResponse = recordNotFound;
          expect(body.errorMessage).toBe(expectedResponse);
        });
    });
  });
  describe('POST /api/articles/:article_id/comments', () => {
    test('POST 200: Endpoint adds a new comment to the corresponding article', () => {
      const newComment = {
        username: 'butter_bridge',
        body: 'example comment',
      };
      return request(app)
        .post('/api/articles/2/comments')
        .send(newComment)
        .expect(201)
        .then(({ body: { comment } }) => {
          expectedResponse = {
            comment_id: expect.any(Number),
            body: newComment.body,
            article_id: expect.any(Number),
            author: newComment.username,
            votes: expect.any(Number),
            created_at: expect.any(String),
          };
          expect(comment).toMatchObject(expectedResponse);
        });
    });
    test('POST 400: Endpoint returns an error for an invalid article_id', () => {
      const newComment = {
        username: 'butter_bridge',
        body: 'example valid comment',
      };
      return request(app)
        .post('/api/articles/37/comments')
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          const expectedResponse = badRequest;
          expect(body.errorMessage).toBe(expectedResponse);
        });
    });
    test('POST 400: Endpoint returns an error for an invalid post request - bad body', () => {
      const newComment = {
        named_user: 'Saima',
        comment: 'example invalid comment',
      };
      return request(app)
        .post('/api/articles/1/comments')
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          const expectedResponse = badRequest;
          expect(body.errorMessage).toBe(expectedResponse);
        });
    });
  });
  test('POST 400: Endpoint returns an error for an invalid post request - isUser', () => {
    const newComment = {
      username: 'saima',
      body: 'example valid comment',
    };
    return request(app)
      .post('/api/articles/2/comments')
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        const expectedResponse = badRequest;
        expect(body.errorMessage).toBe(expectedResponse);
      });
  });
  describe('PATCH /api/articles/:article_id', () => {
    test('PATCH 200: Endpoint accepts a patch object and returns an updated article_id', () => {
      const newVote = 1;
      const updateObject = { inc_votes: newVote };
      return request(app)
        .patch('/api/articles/1')
        .send(updateObject)
        .expect(200)
        .then(({ body: { updatedArticle } }) => {
          const expectedObject = {
            article_id: 1,
            title: 'Living in the shadow of a great man',
            topic: 'mitch',
            author: 'butter_bridge',
            body: 'I find this existence challenging',
            created_at: '2020-07-09T20:11:00.000Z',
            votes: 100 + newVote,
            article_img_url:
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
          };
          expect(updatedArticle).toMatchObject(expectedObject);
        });
    });
    test('PATCH 404: Endpoint returns an error when given an invalid article_id', () => {
      const newVote = 1;
      const updateObject = { inc_votes: newVote };
      return request(app)
        .patch('/api/articles/3700000')
        .send(updateObject)
        .expect(404)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(recordNotFound);
        });
    });
    test('PATCH 400: Endpoint returns an error when given an invalid data input', () => {
      const newVote = 'string';
      const updateObject = { inc_votes: newVote };
      return request(app)
        .patch('/api/articles/1')
        .send(updateObject)
        .expect(400)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(invalidInput);
        });
    });
  });
  describe('DELETE: /api/comments/:comment_id', () => {
    test('DELETE 204: Endpoint returns 204 and no content on successful delete', () => {
      return request(app)
        .delete('/api/comments/2')
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
    test('DELETE 400: Endpoint returns invalid input response when given invalid comment_id data type', () => {
      return request(app)
        .delete('/api/comments/helloAgainSaima')
        .expect(400)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(invalidInput);
        });
    });
    test('DELETE 404: Endpoint returns record not found response when given a valid comment_id, but doesnt exist', () => {
      return request(app)
        .delete('/api/comments/37')
        .expect(404)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(recordNotFound);
        });
    });
  });
  describe('GET: /api/articles?query', () => {
    test('GET 200: Endpoint returns all articles as filtered by topic', () => {
      return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(({ body: { articles } }) => {
          const expectedArticle = {
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: 'mitch',
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          };
          articles.forEach((article) => {
            expect(article).toMatchObject(expectedArticle);
          });
          expect(articles).toBeSortedBy('created_at', {
            descending: true,
          });
        });
    });
    test('GET 404: Endpoint returns 404 error for valid query, but no articles', () => {
      return request(app)
        .get('/api/articles?topic=Roisin')
        .expect(404)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(recordsNotFound);
        });
    });
    test('GET 400: Endpoint returns 400 error for invalid query', () => {
      return request(app)
        .get('/api/articles?problematicQuery=roisin')
        .expect(400)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(invalidInput);
        });
    });
  });
});

// USERS
describe('Users', () => {
  describe('USERS: /api/users', () => {
    test('GET 200: Endpoint returns all users', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users } }) => {
          const expectedObject = {
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          };
          users.forEach((user) => {
            expect(Object.keys(user).length).toBe(3);
            expect(user).toMatchObject(expectedObject);
          });
        });
    });
  });
});