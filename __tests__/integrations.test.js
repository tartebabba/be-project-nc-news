const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const endpoints = require('../endpoints.json');
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
describe('TOPICS', () => {
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
describe('ARTICLES', () => {
  describe('GET /api/articles - all articles', () => {
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
          articles.forEach((articles) => {
            expect(Object.keys(articles)).toEqual(expectedKeys);
            expect(articles).toMatchObject(expectedArticle);
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
      test('GET 200: Endpoint returns all articles with query sorted by created_at as DEFAULT', () => {
        return request(app)
          .get('/api/articles?topic=mitch')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy('created_at', {
              descending: true,
            });
          });
      });
      test('GET 200: Endpoint returns all articles with author query sorted by created_at as DEFAULT', () => {
        return request(app)
          .get('/api/articles?author=butter_bridge')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy('created_at', {
              descending: true,
            });
          });
      });
      test('GET 200: Endpoint returns all articles sorted by valid column with specified order_by - ASC', () => {
        const sortColumn = 'topic';
        return request(app)
          .get(`/api/articles?order_by=asc&&sort_by=${sortColumn}`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy(sortColumn, {
              descending: false,
            });
          });
      });
      test('GET 200: Endpoint returns all articles sorted by valid column', () => {
        const sortColumn = 'topic';
        return request(app)
          .get(`/api/articles?sort_by=${sortColumn}`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy(sortColumn, {
              descending: true,
            });
          });
      });
      test('GET 400: Endpoint returns an error when sort_by is an invalid column', () => {
        const sortColumn = 'invalidColumn';
        return request(app)
          .get(`/api/articles?sort_by=${sortColumn}`)
          .expect(400)
          .then(({ body: { errorMessage } }) => {
            expect(errorMessage).toBe(invalidInput);
          });
      });
      test('GET 200: Endpoint returns all articles sorted by valid column with default DESC order', () => {
        const sortColumn = 'title';
        return request(app)
          .get(`/api/articles?sort_by=${sortColumn}`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy(sortColumn, {
              descending: true,
            });
          });
      });
      test('GET 400: Endpoint returns an bad request error when one query of N query is invalid', () => {
        const sortColumn = 'invalidColumn';
        const orderBy = 'desc';
        return request(app)
          .get(`/api/articles?sort_by=${sortColumn}&&order_by=${orderBy}`)
          .expect(400)
          .then(({ body: { errorMessage } }) => {
            expect(errorMessage).toBe(invalidInput);
          });
      });
    });
    describe('GET /api/articles?page&&limit', () => {
      test('GET 200: Endpoint returns a default number of records for per page + able to specify page', () => {
        const limit = 5;
        const page = 2;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { articles } }) => {
            const expectedArticleObject = {
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
            articles.forEach((article) => {
              expect(article).toMatchObject(expectedArticleObject);
            });
            expect(articles.length).toBe(limit);
          });
      });
      test('GET 200: Endpoint returns a default number of records and on page one with no page limit query', () => {
        const limit = 10;
        return request(app)
          .get(`/api/articles?topic=mitch`)
          .expect(200)
          .then(({ body: { articles } }) => {
            const expectedArticleObject = {
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
            articles.forEach((article) => {
              expect(article).toMatchObject(expectedArticleObject);
            });
            expect(articles.length).toBe(limit);
          });
      });
      test('GET 200: Endpoint returns a default number of records and on page one with no page limit query', () => {
        const limit = 10;
        return request(app)
          .get(`/api/articles`)
          .expect(200)
          .then(({ body: { articles } }) => {
            const expectedArticleObject = {
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
            articles.forEach((article) => {
              expect(article).toMatchObject(expectedArticleObject);
            });
            expect(articles.length).toBe(limit);
          });
      });
      test('GET 404: Endpoint returns a bad request error when given an non-valid page', () => {
        const limit = 5;
        const page = 37;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(404)
          .then(({ body: { errorMessage } }) => {
            expect(errorMessage).toEqual(recordsNotFound);
          });
      });
      test('GET 404: Endpoint returns a records not found error when given a page exceeding the limit', () => {
        const limit = 13;
        const page = 2;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(404)
          .then(({ body: { errorMessage } }) => {
            expect(errorMessage).toEqual(recordsNotFound);
          });
      });
      test('GET 400: Endpoint returns a records not found error when given a page exceeding the limit', () => {
        const limit = 'string';
        const page = 1;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(400)
          .then(({ body: { errorMessage } }) => {
            expect(errorMessage).toEqual(invalidInput);
          });
      });
      test('GET 400: Endpoint returns a records not found error when given a page exceeding the limit', () => {
        const limit = 10;
        const page = 'string';
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(400)
          .then(({ body: { errorMessage } }) => {
            expect(errorMessage).toEqual(invalidInput);
          });
      });
      test('GET 200: Endpoint return articles up to the limit, even when given limit exceeding article count', () => {
        const limit = 50;
        const page = 1;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { articles } }) => {
            const expectedArticleObject = {
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
            articles.forEach((article) => {
              expect(article).toMatchObject(expectedArticleObject);
            });
            expect(articles.length).toBeLessThanOrEqual(limit);
          });
      });
      test('GET 200: Endpoint return articles equal to the limit', () => {
        const limit = 13;
        const page = 1;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { articles } }) => {
            const expectedArticleObject = {
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
            articles.forEach((article) => {
              expect(article).toMatchObject(expectedArticleObject);
            });
            expect(articles.length).toBeLessThanOrEqual(limit);
          });
      });
      test('GET 200: Endpoint return articles equal to the limit with count', () => {
        const limit = 13;
        const page = 1;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { articles } }) => {
            const expectedArticleObject = {
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
            articles.forEach((article) => {
              expect(article).toMatchObject(expectedArticleObject);
            });
            expect(articles.length).toBeLessThanOrEqual(limit);
          });
      });
      test('GET 200: Endpoint return articles equal to the limit with count exceeding article count', () => {
        const limit = 50;
        const page = 1;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { articles, total_count } }) => {
            const expectedArticleObject = {
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
            articles.forEach((article) => {
              expect(article).toMatchObject(expectedArticleObject);
            });
            expect(articles.length).toBeLessThanOrEqual(limit);
            expect(total_count).toBe(13);
          });
      });
    });
  });
  describe('GET /api/articles/:article_id - specific articles', () => {
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
    describe('GET /api/articles/:article_id/comments?page&&limit', () => {
      test('GET 200: Endpoint returns a default number of records for per page + able to specify page', () => {
        const limit = 3;
        const page = 1;
        return request(app)
          .get(`/api/articles/1/comments?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { comments, total_count } }) => {
            const article_id = 1;
            const expectedComment = {
              comment_id: expect.any(Number),
              article_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            };
            comments.forEach((comment) => {
              expect(comment.article_id).toBe(article_id);
              expect(comment).toMatchObject(expectedComment);
            });
            expect(total_count).toBe(limit);
          });
      });
      test('GET 200: Endpoint returns a default number of records and on page one with no page limit query', () => {
        const limit = 5;
        return request(app)
          .get(`/api/articles/1/comments`)
          .expect(200)
          .then(({ body: { comments, total_count } }) => {
            const article_id = 1;
            const expectedComment = {
              comment_id: expect.any(Number),
              article_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            };
            comments.forEach((comment) => {
              expect(comment.article_id).toBe(article_id);
              expect(comment).toMatchObject(expectedComment);
            });
            expect(total_count).toBe(limit);
          });
      });
      test('GET 200: Endpoint returns a default number of comments and on page one with no page limit query', () => {
        const limit = 5;
        return request(app)
          .get(`/api/articles/1/comments`)
          .expect(200)
          .then(({ body: { comments, total_count } }) => {
            const article_id = 1;
            const expectedComment = {
              comment_id: expect.any(Number),
              article_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            };
            comments.forEach((comment) => {
              expect(comment.article_id).toBe(article_id);
              expect(comment).toMatchObject(expectedComment);
            });
            expect(total_count).toBe(limit);
          });
      });
      test('GET 200: Endpoint returns an empty array when given an non-valid page', () => {
        const limit = 5;
        const page = 370;
        return request(app)
          .get(`/api/articles/1/comments?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([]);
          });
      });
      test('GET 200: Endpoint returns a records not found error when given a page exceeding the limit', () => {
        const limit = 50;
        const page = 2;
        return request(app)
          .get(`/api/articles/1/comments?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([]);
          });
      });
      test('GET 400: Endpoint returns a invalid error when given an invalid arguement', () => {
        const limit = 'string';
        const page = 1;
        return request(app)
          .get(`/api/articles/1/comments?page=${page}&&limit=${limit}`)
          .expect(400)
          .then(({ body: { errorMessage } }) => {
            expect(errorMessage).toEqual(invalidInput);
          });
      });
      test('GET 400: Endpoint returns a records not found error when given a page exceeding the limit', () => {
        const limit = 10;
        const page = 'string';
        return request(app)
          .get(`/api/articles/1/comments?page=${page}&&limit=${limit}`)
          .expect(400)
          .then(({ body: { errorMessage } }) => {
            expect(errorMessage).toEqual(invalidInput);
          });
      });
      test('GET 200: Endpoint return articles up to the limit, even when given limit exceeding article count', () => {
        const limit = 500;
        const page = 1;
        return request(app)
          .get(`/api/articles/1/comments?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { comments, total_count } }) => {
            expect(total_count).toBeLessThanOrEqual(limit);
            expect(comments.length).toBeLessThanOrEqual(limit);
          });
      });
      test('GET 200: Endpoint return articles equal to the limit', () => {
        const limit = 11;
        const page = 1;
        return request(app)
          .get(`/api/articles/1/comments?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { comments, total_count } }) => {
            expect(comments.length).toBe(limit);
          });
      });
      test('GET 200: Endpoint return articles equal to the limit with count', () => {
        const limit = 11;
        const page = 1;
        return request(app)
          .get(`/api/articles/1/comments?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { comments, total_count } }) => {
            expect(total_count).toBe(limit);
          });
      });
      test('GET 200: Endpoint return articles equal to the limit with count exceeding article count', () => {
        const limit = 50;
        const page = 1;
        return request(app)
          .get(`/api/articles?page=${page}&&limit=${limit}`)
          .expect(200)
          .then(({ body: { comments, total_count } }) => {
            expect(total_count).toBeLessThanOrEqual(limit);
          });
      });
    });
  });
  describe('POST /api/articles', () => {
    test('POST 200: Endpoint adds a new article and returns the new article with additional properties', () => {
      const newArticle = {
        author: 'butter_bridge',
        title: 'new article',
        body: 'article body',
        topic: 'mitch',
        article_img_url: 'url example',
      };
      return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(200)
        .then(({ body: { newArticle } }) => {
          const expectedArticle = {
            author: newArticle.author,
            title: newArticle.title,
            body: newArticle.body,
            topic: newArticle.topic,
            article_img_url: newArticle.article_img_url,
            article_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          };
          expect(newArticle).toMatchObject(expectedArticle);
        });
    });
    test('POST 400: Endpoint returns bad request when given posting an article by an invalid author', () => {
      const newArticle = {
        author: 'invalidUser',
        title: 'new article',
        body: 'article body',
        topic: 'mitch',
        article_img_url: 'url example',
      };
      return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(badRequest);
        });
    });
    test('POST 400: Endpoint returns bad request when given posting an article by an invalid topic', () => {
      const newArticle = {
        author: 'butter_bridge',
        title: 'new article',
        body: 'article body',
        topic: 'invalidArticle',
        article_img_url: 'url example',
      };
      return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(badRequest);
        });
    });
    test('POST 400: Endpoint returns bad request when given posting an article by an invalid topic', () => {
      const newArticle = {
        author: 'butter_bridge',
        title: 'new article',
        topic: 'mitch',
      };
      return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(badRequest);
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
});

// USERS
describe('USERS', () => {
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
  describe('USERS: /api/users/:username', () => {
    test('GET 200: Endpoints returns the specified user', () => {
      return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body: { user } }) => {
          const expectedUser = {
            username: 'butter_bridge',
            name: 'jonny',
            avatar_url:
              'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
          };
          expect(user).toMatchObject(expectedUser);
        });
    });
    test('GET 404: Endpoint returns not found error when username is valid but non-existent', () => {
      return request(app)
        .get('/api/users/invalid_user')
        .expect(404)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(recordNotFound);
        });
    });
    test.todo(
      'GET 400: Endpoint returns bad request error when given a username with invalid characters'
    );
  });
});

// COMMENTS
describe('COMMENTS', () => {
  describe('PATCH: /api/comments/:comment_id', () => {
    test('PATCH 200: Endpoint returns updated comment with votes field updated', () => {
      const newVote = 1;
      const update = {
        inc_votes: newVote,
      };
      return request(app)
        .patch('/api/comments/1')
        .send(update)
        .expect(200)
        .then(({ body: { updatedComment } }) => {
          expectedComment = {
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: 'butter_bridge',
            votes: 16 + newVote,
            created_at: '2020-04-06T12:17:00.000Z',
          };
          expect(updatedComment).toMatchObject(expectedComment);
        });
    });
    test('PATCH 400: Endpoint returns invalid input error when given invalid update data type', () => {
      const newVote = 'invalid data';
      const update = {
        inc_votes: newVote,
      };
      return request(app)
        .patch('/api/comments/1')
        .send(update)
        .expect(400)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(invalidInput);
        });
    });
    test('PATCH 404: Endpoints returns record not found error when given valid but non-existent ID', () => {
      const newVote = 3;
      const update = {
        inc_votes: newVote,
      };
      return request(app)
        .patch('/api/comments/4563')
        .send(update)
        .expect(404)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(recordNotFound);
        });
    });
    test('PATCH 400: Endpoints return bad request when given an invalid comment_id url', () => {
      const newVote = 3;
      const update = {
        inc_votes: newVote,
      };
      return request(app)
        .patch('/api/comments/invalidID')
        .send(update)
        .expect(400)
        .then(({ body: { errorMessage } }) => {
          expect(errorMessage).toBe(invalidInput);
        });
    });
  });
});