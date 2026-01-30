"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InvoiceTemplateBuilder from "@/components/invoice-template/InvoiceTemplateBuilder";
import { Loader2 } from "lucide-react";

export default function EditTemplatePage() {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = sessionStorage.getItem("editTemplateId"); // Changed key to match invoices pattern or unique key
      if (!storedId) {
        router.push("/templates");
        return;
      }
      setTemplateId(storedId);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!templateId) return null;

  return (
    <div className="h-full w-full">
       <InvoiceTemplateBuilder 
          templateId={templateId} 
          onBack={() => router.push("/templates")}
       />
    </div>
  );
}
