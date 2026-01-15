import "./globals.css";
import { OrganizationProvider } from "@/context/OrganizationContext";
import AppLayout from "@/components/layout/AppLayout";

export const metadata = {
  title: "BizBill Manager",
  description: "Manage your business invoices easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        <OrganizationProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </OrganizationProvider>
      </body>
    </html>
  );
}
