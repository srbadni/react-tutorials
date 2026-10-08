import React, { useEffect, useRef, useState } from 'react';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [lastAppliedResponse, setLastAppliedResponse] = useState(null);
  const [events, setEvents] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');
  const [exampleRunning, setExampleRunning] = useState(false);
  const requestSequence = useRef(0);

  useEffect(() => {
    const searchQuery = query.trim();
    if (!searchQuery) {
      setResults([]);
      setLastAppliedResponse(null);
      return;
    }

    // IDs are ONLY for the event log. They never decide which result is accepted.
    const requestId = ++requestSequence.current;
    const startedAt = performance.now();
    const params = new URLSearchParams({ q: searchQuery, requestId: String(requestId) });

    setError('');
    setPendingCount((count) => count + 1);
    setEvents((previous) => [...previous, { requestId, query: searchQuery, phase: 'start' }]);

    // INTENTIONALLY BUGGY: requests overlap; every response writes to the same state.
    fetch(`/api/search?${params}`, { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((data) => {
          setResults(data.results); // <-- The race condition lives here.
          setLastAppliedResponse({ query: data.query, requestId, delayMs: data.delayMs });
          setEvents((previous) => [
            ...previous,
            {
              requestId,
              query: searchQuery,
              phase: 'applied',
              elapsedMs: Math.round(performance.now() - startedAt),
            },
          ]);
        })
        .catch((failure) => {
          setError(failure.message);
          setEvents((previous) => [
            ...previous,
            { requestId, query: searchQuery, phase: 'error' },
          ]);
        })
        .finally(() => setPendingCount((count) => count - 1));

    // Intentionally no cleanup, abort, ignore flag, or latest-request check.
  }, [query]);

  async function runExample() {
    // The button is disabled while requests are pending. Reset only the display/log.
    setExampleRunning(true);
    setQuery('');
    setEvents([]);
    requestSequence.current = 0;
    await wait(50);
    setQuery('rea'); // Request A
    await wait(120);
    setQuery('react'); // Request B; A is still in flight.
    setExampleRunning(false);
  }

  // This comparison just exposes the bug visually. It NEVER blocks setResults.
  const stale = lastAppliedResponse !== null && lastAppliedResponse.query !== query.trim();
  const raceVisible = stale && pendingCount === 0;

  return (
      <main className="app-shell">
        <header className="intro">
          <span className="eyebrow" dir="ltr">REACT / RACE LAB</span>
          <h1>کدام پاسخ آخر می‌رسد؟</h1>
          <p>سرچ زنده با تأخیر تصادفی؛ هر پاسخ مستقیماً نتیجه‌ها را بازنویسی می‌کند.</p>
        </header>

        <section className="search-card" aria-labelledby="search-title">
          <div className="section-top">
            <h2 id="search-title">عبارت جست‌وجو</h2>
            <span className="delay-label">تأخیر: ۴۰۰ تا ۲۴۰۰ میلی‌ثانیه</span>
          </div>
          <label className="sr-only" htmlFor="search">جست‌وجوی زنده</label>
          <input
              id="search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              placeholder="Type rea, then react…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={exampleRunning}
          />
          <div className="search-footer">
            <button onClick={runExample} disabled={exampleRunning || pendingCount > 0}>
              اجرای <bdi dir="ltr">rea → react</bdi>
            </button>
            <span className="pending" role="status">درخواست‌های در حال اجرا: {pendingCount}</span>
          </div>
          <p className="hint">اگر خطا دیده نشد، دوباره اجرا کن. ترتیب پاسخ‌ها در هر بار اجرا ممکن است فرق کند.</p>
        </section>

        {error && <p className="error" role="alert">خطای درخواست: <bdi>{error}</bdi></p>}

        <div className="panels">
          <section className="panel" aria-labelledby="results-title">
            <div className="section-top">
              <h2 id="results-title">نتیجه‌ها</h2>
              <span className={`badge ${raceVisible ? 'badge-stale' : ''}`}>
              {raceVisible ? 'پاسخ قدیمی نمایش داده شده' : pendingCount > 0 ? 'در حال جست‌وجو' : 'وضعیت فعلی'}
            </span>
            </div>
            <div className="response-meta" aria-live="polite" data-testid="response-meta">
              {lastAppliedResponse ? (
                  <>
                    پاسخ ثبت‌شده: <code>{lastAppliedResponse.query}</code>
                    <span> / درخواست #{lastAppliedResponse.requestId}</span>
                  </>
              ) : 'هنوز پاسخی ثبت نشده است.'}
            </div>
            {results.length ? (
                <ul className="results" data-testid="results">
                  {results.map((result) => (
                      <li key={result.id} dir="ltr">
                        <h3>{result.title}</h3>
                        <p>{result.description}</p>
                      </li>
                  ))}
                </ul>
            ) : (
                <p className="empty">{lastAppliedResponse ? 'نتیجه‌ای پیدا نشد.' : 'برای شروع تایپ کن یا مثال را اجرا کن.'}</p>
            )}
          </section>

          <section className="panel" aria-labelledby="events-title">
            <div className="section-top">
              <h2 id="events-title">ترتیب رویدادها</h2>
              <span className="delay-label">از بالا به پایین</span>
            </div>
            {events.length ? (
                <ol className="events" aria-live="polite" data-testid="events">
                  {events.map((event, index) => (
                      <li key={index} className={`event event-${event.phase}`}>
                        <span className="event-marker" aria-hidden="true" />
                        <div>
                          <span>{event.phase === 'start' ? 'شروع' : event.phase === 'applied' ? 'پاسخ و ثبت در state' : 'خطا'}</span>
                          <strong> #{event.requestId} · <bdi>{event.query}</bdi></strong>
                          {event.elapsedMs !== undefined && <small>{event.elapsedMs} ms</small>}
                        </div>
                      </li>
                  ))}
                </ol>
            ) : <p className="empty">شروع و رسیدن هر درخواست اینجا ثبت می‌شود.</p>}
          </section>
        </div>
        <footer className="page-footer">برای دیدن race، دنبال ترتیب «شروع A، شروع B، پاسخ B، پاسخ A» بگرد.</footer>
      </main>
  );
}
