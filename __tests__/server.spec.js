import http   from 'http';

describe('Example Node Server', () => {
  it('should return 200', done => {
    http.get('http://127.0.0.1:8000', res => {
      expect(res.statusCode).toBe(200);
      done();
    });
  });
});