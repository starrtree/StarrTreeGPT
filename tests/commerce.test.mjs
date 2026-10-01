import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const temporary = mkdtempSync(join(tmpdir(), 'starrtree-commerce-'));
const output = join(temporary, 'catalog.cjs');
buildSync({ entryPoints: ['app/CommerceCatalog.tsx'], outfile: output, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', alias: { react: require.resolve('react'), 'react/jsx-runtime': require.resolve('react/jsx-runtime') }, external: [require.resolve('react'), require.resolve('react/jsx-runtime')] });
const Catalog = require(output).default;
const html = renderToStaticMarkup(React.createElement(Catalog));
rmSync(temporary, { recursive: true });
const catalog = JSON.parse(readFileSync(new URL('../app/commerce-catalog.json', import.meta.url)));
const find = name => catalog.find(item => item.name === name);
const card = item => html.split(`data-service="${item.id}"`)[1].split('</article>')[0];

test('A: direct poster purchase renders the exact Run 1 $125 test link', () => {
  const item = find('Poster / Flyer Design');
  assert.equal(item.price, '$125');
  assert.equal(item.paymentLink, 'https://buy.stripe.com/test_00w5kF87393r9rX92K63K09');
  assert.ok(card(item).includes(`href="${item.paymentLink}"`));
  assert.ok(card(item).includes('Buy · Test Checkout'));
});
test('B: assistant deposit retains $250 deposit / $500 starting distinction and scope approval', () => {
  const item = find('Custom GPT / AI Assistant Starter');
  assert.equal(item.priceId, 'price_1UIPMxR3m5Mdthc7JskZAKgA');
  assert.equal(item.paymentLink, 'https://buy.stripe.com/test_14A14p2MJ3J7fQl0we63K0b');
  assert.equal(item.price, '$500 starting');
  assert.match(item.terms, /\$250 deposit/);
  assert.match(card(item), /Deposit only/);
  assert.match(card(item), /Pay Deposit · confirmation needed/);
  assert.ok(!card(item).includes(`href="${item.paymentLink}"`));
});
test('C: care uses the existing monthly checkout and site-eligibility acknowledgment', () => {
  const item = find('Website Care Plan');
  assert.equal(item.price, '$99 / month');
  assert.equal(item.model, 'Recurring monthly');
  assert.equal(item.paymentLink, 'https://buy.stripe.com/test_8x2bJ34UR0wVaw1dj063K05');
  assert.match(card(item), /Subscribe · confirmation needed/);
  assert.match(card(item), /approved my site for care/);
});
test('D: consultation preserves the exact $150 test checkout and manual calendar invitation', () => {
  const item = find('AI / Creative Tech Consultation');
  assert.equal(item.paymentLink, 'https://buy.stripe.com/test_4gMaEZafb0wVfQldj063K0i');
  assert.equal(item.price, '$150 / hour');
  assert.equal(item.minutes, '60');
  assert.match(card(item), /Book Consultation · confirmation needed/);
  assert.match(card(item), /After payment verification/);
  assert.match(card(item), /Payment alone does not reserve a slot/);
  assert.ok(!html.includes('calendar.google.com'));
});
