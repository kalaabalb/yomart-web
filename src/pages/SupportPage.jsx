import { LifeBuoy } from 'lucide-react';
import { RetailerContacts } from '../components/RetailerContacts.jsx';

export default function SupportPage() {
  return <div className="page-wrap support-page">
    <span className="eyebrow"><LifeBuoy size={14} /> CUSTOMER CARE</span>
    <h1>How can we help?</h1>
    <p>Choose one of the currently available contact options below.</p>
    <RetailerContacts placement="support_page" emptyMessage="No contact options are available right now." />
  </div>;
}
