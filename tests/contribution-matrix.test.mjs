import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const moduleUrl = new URL('../scripts/contribution-matrix.mjs', import.meta.url);
const matrixModule = await import(moduleUrl).catch(() => null);

const levels = [
  'NONE',
  'FIRST_QUARTILE',
  'SECOND_QUARTILE',
  'THIRD_QUARTILE',
  'FOURTH_QUARTILE',
];

const counts = [0, 1, 2, 3, 4, 5, 6, 0, 0, 1, 1, 2, 3, 14];
const dates = Array.from({ length: 14 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 7, 2 + index));
  return date.toISOString().slice(0, 10);
});

const calendarFixture = {
  totalContributions: 42,
  months: [{ name: 'Aug', firstDay: '2026-08-02', totalWeeks: 2 }],
  weeks: [0, 1].map((weekIndex) => ({
    firstDay: dates[weekIndex * 7],
    contributionDays: counts.slice(weekIndex * 7, weekIndex * 7 + 7).map((contributionCount, dayIndex) => ({
      date: dates[weekIndex * 7 + dayIndex],
      contributionCount,
      contributionLevel: levels[Math.min(contributionCount, 4)],
      weekday: dayIndex,
    })),
  })),
};

test('renderer turns contribution calendar data into an accessible technical matrix', () => {
  assert.ok(matrixModule, 'contribution matrix module must exist');
  const svg = matrixModule.renderContributionMatrix(calendarFixture, { username: 'utkucaglar' });
  assert.match(svg, /<svg[^>]+viewBox="0 0 1200 280"/);
  assert.match(svg, /aria-label="utkucaglar contribution matrix: 42 contributions in the last year"/);
  assert.match(svg, /data-total-contributions="42"/);
  assert.match(svg, /data-active-days="11"/);
  assert.match(svg, /data-peak-load="14"/);
  assert.equal((svg.match(/data-date="/g) ?? []).length, 14);
  assert.match(svg, /data-level="4"[^>]+fill="#4EE87A"/);
  assert.match(svg, />CONTRIBUTION MATRIX</);
  assert.match(svg, />AUG</);
  assert.doesNotMatch(svg.replace('http://www.w3.org/2000/svg', ''), /<script|@import|https?:\/\/|xlink:href/i);
});

test('GraphQL client returns the documented contribution calendar shape', async () => {
  assert.ok(matrixModule, 'contribution matrix module must exist');
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      json: async () => ({
        data: {
          user: {
            contributionsCollection: { contributionCalendar: calendarFixture },
          },
        },
      }),
    };
  };
  const calendar = await matrixModule.fetchContributionCalendar({
    token: 'test-token',
    username: 'utkucaglar',
    fetchImpl,
  });
  assert.deepEqual(calendar, calendarFixture);
  assert.equal(request.url, 'https://api.github.com/graphql');
  assert.equal(request.options.headers.authorization, 'Bearer test-token');
  const body = JSON.parse(request.options.body);
  assert.equal(body.variables.login, 'utkucaglar');
  assert.match(body.query, /contributionLevel/);
  assert.match(body.query, /months/);
});

test('committed contribution matrix is self-contained and deployed to Pages', async () => {
  const source = await readFile(new URL('../assets/contribution-matrix.svg', import.meta.url), 'utf8').catch(() => null);
  assert.ok(source, 'committed contribution matrix must exist');
  assert.match(source, /<svg[^>]+viewBox="0 0 1200 280"/);
  assert.match(source, />CONTRIBUTION MATRIX</);
  const dayCount = (source.match(/data-date="/g) ?? []).length;
  assert.ok(dayCount >= 365 && dayCount <= 371);
  assert.doesNotMatch(source.replace('http://www.w3.org/2000/svg', ''), /<script|@import|https?:\/\/|xlink:href/i);
  assert.ok(Buffer.byteLength(source) < 90_000);
  const deployed = await readFile(new URL('../backplane/assets/contribution-matrix.svg', import.meta.url)).catch(() => null);
  assert.ok(deployed, 'Pages contribution matrix copy must exist');
  assert.deepEqual(deployed, Buffer.from(source));
});
