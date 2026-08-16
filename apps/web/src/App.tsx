import { AppRouter } from '@/router/index.js';
import { ThemeProvider } from '@/lib/theme.js';
import { ServiceProvider } from '@/lib/services/index.js';

export default function App() {
  return (
    <ThemeProvider>
      <ServiceProvider>
        <AppRouter />
      </ServiceProvider>
    </ThemeProvider>
  );
}
