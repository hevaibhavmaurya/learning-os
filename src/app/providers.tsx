import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayerProvider } from "@/components/ui/layer-context";
import { ToastProvider } from "@/components/ui/Toast";
import { applyTheme, getTheme } from "@/app/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    applyTheme(getTheme());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getTheme() === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Toast must wrap Layer so dialogs opened via layer.open() can toast. */}
      <ToastProvider>
        <LayerProvider>{children}</LayerProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
