import { useEffect, useState } from 'react';
import { getRetailerContacts } from '../api/catalog.js';
import { ErrorState, LoadingState } from './States.jsx';
import { filterContactsForPlacement } from '../retailerContacts.js';
import { RetailerContactRows } from './RetailerContactRows.js';

export function RetailerContacts({ placement, className = '', emptyMessage = '' }) {
  const [state, setState] = useState({ loading: true, error: '', contacts: [] });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: '', contacts: [] });
    getRetailerContacts({ signal: controller.signal })
      .then((contacts) => setState({ loading: false, error: '', contacts: filterContactsForPlacement(contacts, placement) }))
      .catch((error) => { if (error.name !== 'AbortError') setState({ loading: false, error: error.message, contacts: [] }); });
    return () => controller.abort();
  }, [placement]);

  if (state.loading) return <section className={`retailer-contacts ${className}`} aria-label="Retailer contacts"><LoadingState label="Loading contact options" /></section>;
  if (state.error) return <section className={`retailer-contacts ${className}`} aria-label="Retailer contacts"><ErrorState message="Contact options are temporarily unavailable." /></section>;
  if (!state.contacts.length) return emptyMessage ? <section className={`retailer-contacts ${className}`} aria-label="Retailer contacts"><p className="retailer-contact-empty">{emptyMessage}</p></section> : null;
  return <section className={`retailer-contacts ${className}`} aria-label="Retailer contacts">
    <h2>{placement === 'product_details' ? 'Questions about this product?' : 'Contact YoMart'}</h2>
    <RetailerContactRows contacts={state.contacts} />
  </section>;
}
