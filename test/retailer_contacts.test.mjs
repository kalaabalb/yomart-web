import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { filterContactsForPlacement, safeContactHref } from '../src/retailerContacts.js';
import { RetailerContactRows } from '../src/components/RetailerContactRows.js';

test('placement filtering includes all-location contacts and excludes unrelated placements', () => {
  const contacts = [
    { placement: 'all', href: 'tel:+123456789' },
    { placement: 'product_details', href: 'https://example.org/contact' },
    { placement: 'support_page', href: 'mailto:help%40example.org' },
  ];
  assert.equal(filterContactsForPlacement(contacts, 'product_details').length, 2);
  assert.equal(filterContactsForPlacement(contacts, 'storefront_footer').length, 1);
});

test('customer contact actions accept only safe phone, email, and HTTPS links', () => {
  assert.equal(safeContactHref({ href: 'tel:%2B251%20911%20222%20333' }), 'tel:%2B251%20911%20222%20333');
  assert.equal(safeContactHref({ href: 'https://t.me/sample_contact' }), 'https://t.me/sample_contact');
  assert.equal(safeContactHref({ href: 'https://wa.me/251911222333' }), 'https://wa.me/251911222333');
  assert.equal(safeContactHref({ href: 'mailto:help@example.org' }), 'mailto:help@example.org');
  assert.equal(safeContactHref({ href: 'javascript:alert(1)' }), '');
  assert.equal(safeContactHref({ href: 'https://user:password@example.org' }), '');
});

test('empty contact results remain empty and never insert fallback retailer details', () => {
  assert.deepEqual(filterContactsForPlacement([], 'support_page'), []);
});

test('contact rows render API-provided call and email actions', () => {
  const html = renderToStaticMarkup(React.createElement(RetailerContactRows, {
    contacts: [
      { type: 'phone', value: '+251911222333', label: 'Sales', href: 'tel:%2B251911222333' },
      { type: 'email', value: 'sales@example.invalid', label: 'Sales email', href: 'mailto:sales@example.invalid' },
    ],
  }));

  assert.match(html, /href="tel:%2B251911222333"/);
  assert.match(html, /href="mailto:sales@example\.invalid"/);
  assert.match(html, />Call</);
  assert.match(html, />Email</);
});

test('contact rows omit unsafe links instead of rendering them', () => {
  const html = renderToStaticMarkup(React.createElement(RetailerContactRows, {
    contacts: [{ type: 'other', value: 'bad', label: 'Unsafe', href: 'javascript:alert(1)' }],
  }));

  assert.doesNotMatch(html, /javascript:/);
  assert.doesNotMatch(html, /Unsafe/);
});
