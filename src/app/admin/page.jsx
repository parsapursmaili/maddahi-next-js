// /app/admin/page.js
"use client";

import { useState, useEffect } from "react";
import PasswordPrompt from "@/app/components/admin/PasswordPrompt";
import TermManager from "@/app/components/admin/TermManager";
import { getTermsForAdmin } from "@/app/actions/termActions";
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [terms, setTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // پس از احراز هویت، اطلاعات اولیه را بارگذاری کن
  useEffect(() => {
    if (isAuthenticated) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        const result = await getTermsForAdmin();
        if (result.success) {
          setTerms(result.data);
        } else {
          // مدیریت خطا
          console.error(result.message);
        }
        setIsLoading(false);
      };
      fetchInitialData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <PasswordPrompt onCorrectPassword={() => setIsAuthenticated(true)} />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-[var(--foreground-secondary)]">
        در حال بارگذاری اطلاعات...
      </div>
    );
  }

  return <TermManager initialTerms={terms} />;
}
