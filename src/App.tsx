import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { DealsPage } from "@/pages/DealsPage";
import { ContactsPage } from "@/pages/ContactsPage";
import { ContactDetailPage } from "@/pages/ContactDetailPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { NewAccountRequestPage } from "@/pages/NewAccountRequestPage";
import { WorkflowRequestsPage } from "@/pages/WorkflowRequestsPage";
import { WorkflowRequestDetailPage } from "@/pages/WorkflowRequestDetailPage";
import { TasksPage } from "@/pages/TasksPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { LoginPage } from "@/pages/LoginPage";
import { RequireAuth } from "@/auth/RequireAuth";
import { ToastHost } from "@/components/ui/Toast";

export class App extends React.Component {
  render(): React.ReactNode {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="contacts/:id" element={<ContactDetailPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="accounts/new" element={<NewAccountRequestPage />} />
            <Route path="workflow-requests" element={<WorkflowRequestsPage />} />
            <Route path="workflow-requests/:id" element={<WorkflowRequestDetailPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <ToastHost />
      </BrowserRouter>
    );
  }
}
