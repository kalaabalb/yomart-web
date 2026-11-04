import test from 'node:test';
import assert from 'node:assert/strict';
import { customerDestination, orderStatusLabel, recordedCollectionPoint } from '../src/orders/fulfillment.js';

test('customer destination maps the legacy street field to optional area and never fabricates coordinates', () => {
  assert.deepEqual(customerDestination({ phone: '555', city: 'Bahir Dar', street: '' }), {
    phone: '555', city: 'Bahir Dar', area: '', coordinates: '',
  });
  assert.equal(customerDestination({ city: 'Bahir Dar' }).coordinates, '');
});

test('customer status copy distinguishes collection from legacy delivery statuses', () => {
  assert.equal(orderStatusLabel('ready_for_collection'), 'Ready for collection');
  assert.equal(orderStatusLabel('collected'), 'Collected');
  assert.equal(orderStatusLabel('delivered'), 'Delivered');
});

test('collection point is displayed only when staff recorded complete details', () => {
  assert.equal(recordedCollectionPoint(null), null);
  assert.equal(recordedCollectionPoint({ name: 'Site' }), null);
  assert.deepEqual(recordedCollectionPoint({ name: 'Site', address: 'Address', city: 'City' }), {
    name: 'Site', address: 'Address', city: 'City',
  });
});
