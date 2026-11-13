type P = { className?: string };

export function InstagramIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2.5a9.45 9.45 0 0 0-8.13 14.3L2.5 21.5l4.82-1.37A9.46 9.46 0 1 0 12.04 2.5Zm0 17.2a7.74 7.74 0 0 1-3.94-1.08l-.28-.17-2.86.81.82-2.79-.18-.29a7.74 7.74 0 1 1 6.44 3.52Zm4.25-5.8c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.52.12-.16.23-.6.76-.74.92-.13.15-.27.17-.5.06a6.32 6.32 0 0 1-3.15-2.76c-.24-.41.24-.38.68-1.26.08-.15.04-.29-.02-.4-.06-.12-.52-1.26-.72-1.72-.19-.45-.38-.39-.52-.4h-.45a.86.86 0 0 0-.62.29 2.6 2.6 0 0 0-.81 1.94 4.52 4.52 0 0 0 .95 2.4 10.34 10.34 0 0 0 3.96 3.5c1.47.63 2.05.69 2.78.58.45-.07 1.38-.57 1.58-1.11.19-.55.19-1.01.13-1.11-.05-.1-.21-.16-.44-.28Z" />
    </svg>
  );
}
