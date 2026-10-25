/** Application entry point: shared display preferences and session-scoped data. */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DemoProvider } from './context/DemoContext';
import { PreferencesProvider } from './i18n/Preferences';
import App from './App';
import './styles/Global.css';
import './styles/Themes.css';
createRoot(document.getElementById('root')!).render(<StrictMode>
    <PreferencesProvider>
        <BrowserRouter>
            <DemoProvider>
                <App />
            </DemoProvider>
        </BrowserRouter>
    </PreferencesProvider>
</StrictMode>);
