import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

import { useWizardStore } from "@/store/wizard-store";

const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    useWizardStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main className={`${headingFont.variable} ${bodyFont.variable}`}>
        <Component {...pageProps} />
      </main>
    </QueryClientProvider>
  );
}
