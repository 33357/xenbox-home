import type { AppProps } from 'next/app';
import ErrorBoundary from '../src/lib/ErrorBoundary';
import { ToastProvider } from '../src/contexts/ToastContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </ErrorBoundary>
  );
}