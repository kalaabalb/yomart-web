export function safeContactHref(contact) {
  const href = contact?.href;
  if (typeof href !== 'string') return '';
  if (href.toLowerCase().startsWith('tel:')) {
    try {
      const phone = decodeURIComponent(href.slice(4));
      if (/^\+?[0-9().\-\s]{5,40}$/.test(phone) && phone.replace(/\D/g, '').length >= 5) return href;
    } catch { /* invalid phone encoding */ }
  }
  if (href.toLowerCase().startsWith('mailto:')) {
    try {
      const email = decodeURIComponent(href.slice(7));
      if (/^[A-Za-z0-9.!#$%&'*+/=_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(email)) return href;
    } catch { /* invalid email encoding */ }
  }
  try {
    const url = new URL(href);
    if (url.protocol === 'https:' && !url.username && !url.password && ['t.me', 'wa.me'].includes(url.hostname)) return url.href;
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* invalid contact URL */ }
  return '';
}

export function filterContactsForPlacement(contacts, placement) {
  return contacts.filter((contact) => (contact.placement === 'all' || contact.placement === placement) && safeContactHref(contact));
}
