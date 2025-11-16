import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Layout } from './modules/layout/Layout';
import { LoginPage } from './pages/Login';
import { InboxPage } from './pages/Inbox';
import { QueryDetailsPage } from './pages/QueryDetails';
import { AnalyticsPage } from './pages/Analytics';
import { TeamsPage } from './pages/Teams';
import { SettingsPage } from './pages/Settings';
import { Loader } from './components/Loader';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/inbox" replace />} />
        <Route
          path="/inbox"
          element={
            <Suspense fallback={<Loader />}>
              <InboxPage />
            </Suspense>
          }
        />
        <Route path="/queries/:id" element={<QueryDetailsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route
          path="/teams"
          element={
            <Suspense fallback={<Loader />}>
              <TeamsPage />
            </Suspense>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
