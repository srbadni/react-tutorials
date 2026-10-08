const articles = [
  { id: 1, title: 'React fundamentals', description: 'Components, props and rendering.' },
  { id: 2, title: 'React hooks', description: 'Working with state and effects.' },
  { id: 3, title: 'React Router', description: 'Navigation for React applications.' },
  { id: 4, title: 'Reactive streams', description: 'Asynchronous streams of events.' },
  { id: 5, title: 'Reading JavaScript', description: 'Learning to read unfamiliar code.' },
  { id: 6, title: 'Real-time search', description: 'Searching as the user types.' },
  { id: 7, title: 'Reasoning about state', description: 'Understanding state transitions.' },
  { id: 8, title: 'Redux patterns', description: 'Organizing application state.' },
];

// Each HTTP request gets an independent random delay. No query is prioritized.
// The options let a smoke check control timing without changing the actual demo.
export function createSearchHandler({
  random = Math.random,
  minDelayMs = 400,
  maxDelayMs = 2400,
} = {}) {
  return function searchHandler(req, res, next) {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== '/api/search') {
      next();
      return;
    }

    if (req.method !== 'GET') {
      res.writeHead(405, { Allow: 'GET', 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Use GET for this endpoint.' }));
      return;
    }

    const query = (url.searchParams.get('q') ?? '').trim();
    const requestId = url.searchParams.get('requestId');
    const delayMs = minDelayMs + Math.floor(random() * (maxDelayMs - minDelayMs + 1));
    const results = query
      ? articles.filter((article) => article.title.toLowerCase().includes(query.toLowerCase()))
      : [];

    setTimeout(() => {
      if (res.destroyed) return;
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify({ query, requestId, delayMs, results }));
    }, delayMs);
  };
}
