import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
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
    document.documentElement.classList.add(jakartaSans.className, jakartaSans.variable);
    document.body.classList.add(jakartaSans.className, jakartaSans.variable);

    return () => {
      document.documentElement.classList.remove(jakartaSans.className, jakartaSans.variable);
      document.body.classList.remove(jakartaSans.className, jakartaSans.variable);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <Component {...pageProps} />
      </main>
    </QueryClientProvider>
  );
}
