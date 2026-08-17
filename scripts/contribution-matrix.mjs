const GRAPHQL_URL = 'https://api.github.com/graphql';

const QUERY = `
  query ContributionMatrix($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          months {
            name
            firstDay
            totalWeeks
          }
          weeks {
            firstDay
            contributionDays {
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

const levelColors = ['#0A1C10', '#143F22', '#1F7137', '#2EAD50', '#4EE87A'];
const levelNumbers = new Map([
  ['NONE', 0],
  ['FIRST_QUARTILE', 1],
  ['SECOND_QUARTILE', 2],
  ['THIRD_QUARTILE', 3],
  ['FOURTH_QUARTILE', 4],
]);

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const dateValue = (value) => new Date(`${value}T00:00:00Z`).getTime();

export async function fetchContributionCalendar({ token, username, fetchImpl = fetch }) {
  if (!token) throw new Error('GITHUB_TOKEN is required to refresh the contribution matrix');
  if (!username) throw new Error('GITHUB_USERNAME is required to refresh the contribution matrix');

  const response = await fetchImpl(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'utkucaglar-profile-matrix',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: username } }),
  });

  if (!response.ok) throw new Error(`GitHub GraphQL request failed (${response.status})`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.map(({ message }) => message).join('; '));
  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error(`No contribution calendar returned for ${username}`);
  return calendar;
}

export function renderContributionMatrix(calendar, { username }) {
  const weeks = (calendar.weeks ?? []).slice(-53);
  const days = weeks.flatMap(({ contributionDays = [] }) => contributionDays);
  if (!weeks.length || !days.length) throw new Error('Contribution calendar must contain at least one day');

  const total = Number(calendar.totalContributions ?? 0);
  const activeDays = days.filter(({ contributionCount }) => contributionCount > 0).length;
  const peak = days.reduce((highest, day) => (
    day.contributionCount > highest.contributionCount ? day : highest
  ), days[0]);
  const gridX = 338;
  const gridY = 106;
  const pitchX = 16;
  const pitchY = 20;
  const cellSize = 12;
  const firstWeekTime = dateValue(weeks[0].firstDay);
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  let lastMonthColumn = -5;
  const monthLabels = (calendar.months ?? []).map((month) => {
    const column = Math.max(0, Math.min(weeks.length - 1, Math.floor((dateValue(month.firstDay) - firstWeekTime) / weekMs)));
    if (column - lastMonthColumn < 4) return '';
    lastMonthColumn = column;
    return `<text x="${gridX + column * pitchX}" y="86" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="11" font-weight="700" letter-spacing="1.4">${escapeXml(month.name.toUpperCase())}</text>`;
  }).filter(Boolean).join('\n  ');

  const cells = weeks.flatMap((week, weekIndex) => week.contributionDays.map((day) => {
    const level = levelNumbers.get(day.contributionLevel) ?? 0;
    const x = gridX + weekIndex * pitchX;
    const y = gridY + day.weekday * pitchY;
    return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" data-date="${escapeXml(day.date)}" data-count="${day.contributionCount}" data-level="${level}" fill="${levelColors[level]}" stroke="#315E39" stroke-width="0.6"><title>${escapeXml(day.date)}: ${day.contributionCount} contributions</title></rect>`;
  })).join('\n  ');

  const totalText = total.toLocaleString('en-US');
  const accessibleLabel = `${username} contribution matrix: ${total} contributions in the last year`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="280" viewBox="0 0 1200 280" role="img" aria-label="${escapeXml(accessibleLabel)}" data-total-contributions="${total}" data-active-days="${activeDays}" data-peak-load="${peak.contributionCount}">
  <defs>
    <pattern id="matrix-grid" width="18" height="18" patternUnits="userSpaceOnUse">
      <path d="M18 0H0V18" fill="none" stroke="#173421" stroke-width="1"/>
    </pattern>
    <linearGradient id="matrix-panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#07180E"/>
      <stop offset="1" stop-color="#020B06"/>
    </linearGradient>
  </defs>
  <path d="M22 1H1178L1199 22V258L1178 279H22L1 258V22Z" fill="url(#matrix-panel)" stroke="#315E39" stroke-width="2"/>
  <path d="M22 1H1178L1199 22V258L1178 279H22L1 258V22Z" fill="url(#matrix-grid)" opacity="0.32"/>
  <path d="M310 22V258M310 72H1199M22 1V18H5M1178 1V18H1195M22 279V262H5M1178 279V262H1195" fill="none" stroke="#315E39" stroke-width="1.5"/>
  <path d="M310 52H470L486 36H760M310 252H448L464 268H780" fill="none" stroke="#4EE87A" stroke-width="1" opacity="0.46"/>
  <circle cx="22" cy="22" r="5" fill="#020B06" stroke="#708876"/>
  <circle cx="1178" cy="22" r="5" fill="#020B06" stroke="#708876"/>
  <circle cx="22" cy="258" r="5" fill="#020B06" stroke="#708876"/>
  <circle cx="1178" cy="258" r="5" fill="#020B06" stroke="#708876"/>
  <text x="34" y="42" fill="#4EE87A" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="14" font-weight="700" letter-spacing="2.5">CONTRIBUTION MATRIX</text>
  <text x="34" y="66" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="11" font-weight="700" letter-spacing="1.7">LAST 365 DAYS · PUBLIC BUS</text>
  <text x="34" y="145" fill="#E5F2D8" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="54" font-weight="800" letter-spacing="2">${totalText}</text>
  <text x="36" y="170" fill="#B8C9AD" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="12" font-weight="700" letter-spacing="2.3">CONTRIBUTIONS</text>
  <path d="M34 192H276" fill="none" stroke="#315E39" stroke-width="1.5"/>
  <text x="34" y="218" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="11" font-weight="700" letter-spacing="1.4">ACTIVE DAYS</text>
  <text x="164" y="218" fill="#4EE87A" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="18" font-weight="800">${activeDays}</text>
  <text x="34" y="246" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="11" font-weight="700" letter-spacing="1.4">PEAK LOAD</text>
  <text x="164" y="246" fill="#4EE87A" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="18" font-weight="800">${peak.contributionCount}</text>
  <text x="336" y="42" fill="#4EE87A" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="13" font-weight="700" letter-spacing="2.1">${escapeXml(username.toUpperCase())} // ACTIVITY SIGNAL MAP</text>
  <text x="1166" y="42" text-anchor="end" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="10" font-weight="700" letter-spacing="1.5">AUTO REFRESH / 24H</text>
  ${monthLabels}
  <text x="326" y="138" text-anchor="end" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="10">MON</text>
  <text x="326" y="178" text-anchor="end" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="10">WED</text>
  <text x="326" y="218" text-anchor="end" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="10">FRI</text>
  ${cells}
  <text x="1005" y="267" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="10" letter-spacing="1">IDLE</text>
  ${levelColors.map((color, index) => `<rect x="${1045 + index * 20}" y="258" width="12" height="12" rx="2" fill="${color}" stroke="#315E39" stroke-width="0.6"/>`).join('\n  ')}
  <text x="1152" y="267" fill="#708876" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="10" letter-spacing="1">LOAD</text>
</svg>
`;
}
