import { render, screen } from '@testing-library/react';
import App from './App';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import ForgotPassword from './components/ForgotPassword';
import ErrorBoundary from './components/ErrorBoundary';

const AllProviders = ({ children }) => (
  <ThemeProvider>
    <ToastProvider>
      {children}
    </ToastProvider>
  </ThemeProvider>
);

test('renders login page with sign in options', () => {
  render(
    <AllProviders>
      <App />
    </AllProviders>
  );
  expect(screen.getByText(/log in with/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  expect(screen.getByText(/sign up now/i)).toBeInTheDocument();
});

test('renders forgot password page', () => {
  render(
    <AllProviders>
      <ForgotPassword />
    </AllProviders>
  );
  expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
});

test('error boundary shows fallback when child throws', () => {
  const Throw = () => {
    throw new Error('test error');
  };
  render(
    <ErrorBoundary>
      <Throw />
    </ErrorBoundary>
  );
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
});
