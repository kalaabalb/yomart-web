import { createElement as h } from 'react';
import { safeContactHref } from '../retailerContacts.js';

export function RetailerContactRows({ contacts }) {
  const rows = contacts.map((contact, index) => {
    const href = safeContactHref(contact);
    if (!href) return null;
    const external = href.startsWith('https:');
    const action = contact.type === 'phone' ? 'Call'
      : contact.type === 'email' ? 'Email'
        : contact.type === 'telegram' ? 'Telegram'
          : contact.type === 'whatsapp' ? 'WhatsApp' : 'Open';
    return h('a', {
      key: `${contact.type}-${contact.value}-${index}`,
      href,
      className: 'retailer-contact-link',
      target: external ? '_blank' : undefined,
      rel: external ? 'noopener noreferrer' : undefined,
    }, h('span', null,
      h('strong', null, contact.label),
      contact.description ? h('small', null, contact.description) : null,
    ), h('span', { className: 'contact-action' }, action));
  }).filter(Boolean);
  return h('div', { className: 'retailer-contact-list' }, ...rows);
}
