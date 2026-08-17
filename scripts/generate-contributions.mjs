import { access, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fetchContributionCalendar, renderContributionMatrix } from './contribution-matrix.mjs';

const root = resolve(import.meta.dirname, '..');
const outputPath = resolve(root, 'backplane/assets/contribution-matrix.svg');
const username = process.env.GITHUB_USERNAME ?? 'utkucaglar';

try {
  const calendar = await fetchContributionCalendar({
    token: process.env.GITHUB_TOKEN,
    username,
  });
  const svg = renderContributionMatrix(calendar, { username });
  await writeFile(outputPath, svg, 'utf8');
  console.log(`Contribution matrix refreshed: ${calendar.totalContributions} contributions`);
} catch (error) {
  try {
    await access(outputPath);
    console.warn(`Contribution refresh skipped; retaining the deployed fallback: ${error.message}`);
  } catch {
    throw error;
  }
}
