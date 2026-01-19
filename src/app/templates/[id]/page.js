
import InvoiceTemplateBuilder from "@/components/invoice-template/InvoiceTemplateBuilder";

export default async function EditTemplatePage({ params }) {
  // In Next.js App Router, params is an object with the dynamic route parameters
  // We pass the id to the builder so it knows which template to load
  const resolvedParams = await params;
  return (
    <div className="h-full w-full">
      <InvoiceTemplateBuilder templateId={resolvedParams.id} />
    </div>
  );
}
