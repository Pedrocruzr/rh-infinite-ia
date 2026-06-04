'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export function ClarityScript() {
  const pathname = usePathname();

  // Apenas rodar o script nas páginas logadas do SaaS (que começam com /app)
  const shouldRender = pathname?.startsWith('/app');

  if (!shouldRender) {
    return null;
  }

  return (
    <Script id="microsoft-clarity" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "wxwkb70lm2");
      `}
    </Script>
  );
}
