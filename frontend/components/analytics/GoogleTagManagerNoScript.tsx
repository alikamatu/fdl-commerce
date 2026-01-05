interface GoogleTagManagerNoScriptProps {
  gtmId?: string;
}

export default function GoogleTagManagerNoScript({ gtmId }: GoogleTagManagerNoScriptProps) {
  const id = gtmId || process.env.NEXT_PUBLIC_GTM_ID;

  if (!id) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

