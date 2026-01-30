"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  User,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

// Collapsible Section Component
const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
    >
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </h2>
        <button className="text-slate-400">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="px-6 pb-6">
          <div className="border-t border-slate-100 mb-6"></div>
          {children}
        </div>
      )}
    </section>
  );
};

export default function EditInvoicePage() {
  const router = useRouter();
  
  const [invoiceId, setInvoiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState(null);
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loadedTemplateId, setLoadedTemplateId] = useState(null);
  const dataFetchedRef = useRef(false);

  // Popup State
  const [saveResult, setSaveResult] = useState({ show: false, success: false, message: '' });

  // Invoice State
  const [invoiceData, setInvoiceData] = useState({
    header: {},
    meta: {},
    customer: {
      bill_to: {},
      ship_to: {},
    },
    items: [],
    footer: {},
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedId = sessionStorage.getItem('editInvoiceId');
        if (!storedId) {
            router.push('/invoices');
            return;
        }
        setInvoiceId(storedId);
    }
  }, [router]);

  useEffect(() => {
      if (invoiceId && !dataFetchedRef.current) {
          dataFetchedRef.current = true;
          loadInitialData(invoiceId);
      }
  }, [invoiceId]);

  const loadInitialData = async (id) => {
    try {
      // 0. Ensure we have a template ID, either from storage (preferred) or we'll hope it's in the invoice
      let currentTemplateId = null;
      if (typeof window !== 'undefined') {
          currentTemplateId = sessionStorage.getItem('editTemplateId');
      }

      // 1. Fetch Template FIRST if we have the ID, otherwise we have to fetch invoice first
      let tplData = null;
      let customers = [];
      let invData = null;

      // Parallel Fetch Strategy based on if we know the template ID
      if (currentTemplateId) {
          const [tplRes, custRes, invRes] = await Promise.all([
             apiFetch(`/v1/templates/${currentTemplateId}`),
             apiFetch("/v1/customers/summary"),
             apiFetch(`/v1/invoices/${id}`)
          ]);

          if (tplRes.ok) {
              const json = await tplRes.json();
              tplData = json.data || json;
              setTemplate(tplData);
              setLoadedTemplateId(currentTemplateId);
          }
          if (custRes.ok) {
              const json = await custRes.json();
              customers = json.data || [];
              setCustomerList(customers);
          }
           if (invRes.ok) {
              const json = await invRes.json();
              invData = json.data || json;
              setSelectedCustomerId(invData.customer_id);
          }
      } else {
          // Fallback: Fetch Invoice first to get Template ID
          console.warn("No template ID in storage, fetching invoice first...");
          const invRes = await apiFetch(`/v1/invoices/${id}`);
          if (!invRes.ok) throw new Error("Failed to load invoice details");
          
          const invJson = await invRes.json();
          invData = invJson.data || invJson;
          
          currentTemplateId = invData.template_id || invData.template?.template_id;
          if (!currentTemplateId) throw new Error("Invoice does not have a linked template and none provided.");

          setLoadedTemplateId(currentTemplateId);
          setSelectedCustomerId(invData.customer_id);

          const [tplRes, custRes] = await Promise.all([
             apiFetch(`/v1/templates/${currentTemplateId}`),
             apiFetch("/v1/customers/summary"),
          ]);
           if (tplRes.ok) {
              const json = await tplRes.json();
              tplData = json.data || json;
              setTemplate(tplData);
          }
           if (custRes.ok) {
              const json = await custRes.json();
              customers = json.data || [];
              setCustomerList(customers);
          }
      }

      if (tplData && invData) {
        populateInvoiceData(invData, tplData);
      } else {
          throw new Error("Failed to load necessary data");
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Network or Template error occurred");
    } finally {
      setLoading(false);
    }
  };

  const populateInvoiceData = (invData, tmpl) => {
    const newState = {
      header: {},
      meta: {},
      customer: { bill_to: {}, ship_to: {} },
      items: [],
      footer: {},
    };

    const mapToObj = (fieldsArr) => {
        if (!Array.isArray(fieldsArr)) return {};
        return fieldsArr.reduce((acc, field) => {
            acc[field.key] = field.value || "";
            return acc;
        }, {});
    };

    // Header
    if (invData.header?.fields) {
        newState.header = mapToObj(invData.header.fields);
    }

    // Meta
    if (invData.invoice_meta?.fields) {
        newState.meta = mapToObj(invData.invoice_meta.fields);
    }

    // Customer
    if (invData.customer_details) {
        if (invData.customer_details.bill_to?.fields) {
            newState.customer.bill_to = mapToObj(invData.customer_details.bill_to.fields);
        }
        if (invData.customer_details.ship_to?.fields) {
            newState.customer.ship_to = mapToObj(invData.customer_details.ship_to.fields);
        }
    }

    // Items
    if (invData.items?.fields && Array.isArray(invData.items.fields)) {
        newState.items = invData.items.fields.map(item => ({
            ...item,
            id: item.id || Date.now() + Math.random() 
        }));
    } else if (Array.isArray(invData.items)) {
         newState.items = invData.items.map(item => ({
            ...item,
            id: item.id || Date.now() + Math.random()
        }));
    } else {
        newState.items = [{ id: Date.now() }];
    }

    // Footer
    if (invData.footer?.fields) {
        newState.footer = mapToObj(invData.footer.fields);
    }

    setInvoiceData(newState);
  };

  const handleCustomerSelect = async (customerId) => {
    setSelectedCustomerId(customerId);
    const selected = customerList.find((c) => c.customer_id == customerId);
    if (!selected) return;

    const shipToFields = template.customer_details?.ship_to?.fields || [];
    const nameField = shipToFields.find((f) => f.label === "Name");

    if (nameField) {
      handleInputChange(
        "customer",
        nameField.key,
        selected.customer_name,
        "ship_to",
      );
    }

    try {
      const res = await apiFetch(`/v1/customers/${customerId}`);
      if (res.ok) {
        const json = await res.json();
        const details = json.data;
        const addressObj = details.address || {};

        const parts = [];
        if (addressObj.street) parts.push(addressObj.street);
        if (addressObj.city) parts.push(addressObj.city);

        let complexPart = "";
        if (addressObj.state) complexPart += addressObj.state;
        if (addressObj.zip_code)
          complexPart += (complexPart ? " - " : "") + addressObj.zip_code;

        if (complexPart) parts.push(complexPart);

        const fullAddress = parts.join(", ");

        setInvoiceData((prev) => {
          const newData = { ...prev };
          newData.customer = { ...prev.customer };
          newData.customer.ship_to = { ...prev.customer.ship_to };

          shipToFields.forEach((field) => {
            const label = (field.label || "").toLowerCase();
            const key = field.key;

            if (label === "address") {
              newData.customer.ship_to[key] = fullAddress;
            } else if (label === "state") {
              newData.customer.ship_to[key] = addressObj.state || "";
            } else if (label.toLowerCase().includes("gst")) {
              newData.customer.ship_to[key] = details.gst_no || "";
            }
          });
          return newData;
        });
      }
    } catch (error) {
      console.error("Error fetching customer details", error);
    }
  };

  const handleInputChange = (section, key, value, subSection = null) => {
    setInvoiceData((prev) => {
      const newData = { ...prev };
      if (subSection) {
        newData[section][subSection][key] = value;
      } else {
        newData[section][key] = value;
      }
      return newData;
    });
  };

  const evaluateFormula = (formula, row, labelToKey) => {
    if (!formula) return "";
    let expression = formula;

    const matches = expression.match(/\[(.*?)\]/g);

    if (matches) {
      for (const match of matches) {
        const label = match.slice(1, -1);
        const key = labelToKey[label];
        let val = 0;
        if (key) {
          const rawVal = row[key];
          val = parseFloat(rawVal);
          if (isNaN(val)) val = 0;
        }
        expression = expression.split(match).join(val);
      }
    }

    try {
      const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, "");
      if (!safeExpression.trim()) return "";
      // eslint-disable-next-line no-new-func
      const result = new Function("return " + safeExpression)();
      return isFinite(result) ? Number(result.toFixed(2)) : "";
    } catch (err) {
      return "";
    }
  };

  const handleItemChange = (index, key, value) => {
    setInvoiceData((prev) => {
      const newItems = [...prev.items];
      let currentItem = { ...newItems[index], [key]: value };

      if (template?.items?.columns) {
        const columns = template.items.columns;
        const labelToKey = {};
        columns.forEach((col) => (labelToKey[col.label] = col.key));

        for (let i = 0; i < 2; i++) {
          columns.forEach((col) => {
            if ((col.type === "formula" || col.formula) && col.key !== key) {
              const calculated = evaluateFormula(
                col.formula,
                currentItem,
                labelToKey,
              );
              if (calculated !== "") {
                currentItem[col.key] = calculated;
              }
            }
          });
        }
      }

      newItems[index] = currentItem;
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now() }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (invoiceData.items.length <= 1) return;
    setInvoiceData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
  };

  const handleSave = async () => {
    const payload = {
      template_id: loadedTemplateId,
      customer_id: selectedCustomerId,
    };

    const mapFields = (fields, dataObj) => {
      return fields.map((field) => ({
        key: field.key,
        label: field.label || field.label,
        value: dataObj[field.key] || "",
      }));
    };

    if (template.header?.fields) {
      payload.header = {
        fields: mapFields(template.header.fields, invoiceData.header),
      };
    }

    if (template.invoice_meta?.fields) {
      payload.invoice_meta = {
        fields: mapFields(template.invoice_meta.fields, invoiceData.meta),
      };
    }

    if (template.customer_details) {
      payload.customer_details = {};
      if (template.customer_details.bill_to?.fields) {
        payload.customer_details.bill_to = {
          fields: mapFields(
            template.customer_details.bill_to.fields,
            invoiceData.customer.bill_to,
          ),
        };
      }
      if (template.customer_details.ship_to?.fields) {
        payload.customer_details.ship_to = {
          fields: mapFields(
            template.customer_details.ship_to.fields,
            invoiceData.customer.ship_to,
          ),
        };
      }
    }

    if (template.footer?.fields) {
      payload.footer = {
        fields: mapFields(template.footer.fields, invoiceData.footer),
      };
    }

    payload.items = { fields: invoiceData.items };

    try {
      setIsSaving(true);
      const res = await apiFetch(`/v1/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveResult({
            show: true,
            success: true,
            message: "Invoice updated successfully."
        });
      } else {
        const data = await res.json();
        setSaveResult({
            show: true,
            success: false,
            message: data.message || "Failed to update invoice."
        });
      }
    } catch (e) {
      console.error("Save error:", e);
      setSaveResult({
        show: true,
        success: false,
        message: "An unexpected error occurred while saving."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClosePopup = () => {
    if (saveResult.success) {
        router.push("/invoices");
    }
    setSaveResult({ ...saveResult, show: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-500 font-medium">
            Loading invoice details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-100 max-w-md text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Error
          </h3>
          <p className="text-slate-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push("/invoices")}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/invoices')}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Edit Invoice</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={16} />
                Update Invoice
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {template.header?.fields?.length > 0 && (
          <CollapsibleSection title="Header Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {template.header?.fields?.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {field.label || field.label}
                  </label>
                  <input
                    type={field.type || (field.label?.toLowerCase().includes("date") ? "date" : "text")}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder={`Enter ${field.label || field.label}`}
                    value={invoiceData.header[field.key] || ""}
                    onChange={(e) =>
                      handleInputChange("header", field.key, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {template.invoice_meta?.fields?.length > 0 && (
          <CollapsibleSection title="Invoice Details">
            <div
              className={`grid grid-cols-1 md:grid-cols-${template.invoice_meta?.column_layout || 4} gap-6`}
            >
              {template.invoice_meta?.fields?.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    type={field.type || (field.label?.toLowerCase().includes("date") ? "date" : "text")}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={invoiceData.meta[field.key] || ""}
                    onChange={(e) =>
                      handleInputChange("meta", field.key, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {(template.customer_details?.bill_to?.fields?.length > 0 ||
          template.customer_details?.ship_to?.fields?.length > 0) && (
          <CollapsibleSection title="Customer Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {template.customer_details?.bill_to?.fields?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    {template.customer_details?.bill_to?.title || "Bill To"}
                  </h3>
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                    {template.customer_details?.bill_to?.fields?.map(
                      (field) => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 uppercase">
                            {field.label}
                          </label>
                          <input
                            type={field.type || "text"}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder={field.label}
                            value={
                              invoiceData.customer.bill_to[field.key] || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "customer",
                                field.key,
                                e.target.value,
                                "bill_to",
                              )
                            }
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {template.customer_details?.ship_to?.fields?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    {template.customer_details?.ship_to?.title || "Ship To"}
                  </h3>
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                    {template.customer_details?.ship_to?.fields?.map(
                      (field) => {
                        const label = field.label || field.label;
                        if (label === "Name") {
                          return (
                            <div key={field.key} className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-500 uppercase">
                                {label}
                              </label>
                              <div className="relative">
                                <select
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                                  value={
                                    invoiceData.customer.ship_to[field.key] ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleInputChange(
                                      "customer",
                                      field.key,
                                      val,
                                      "ship_to",
                                    );
                                    const cust = customerList.find(
                                      (c) => c.customer_name === val,
                                    );
                                    if (cust)
                                      handleCustomerSelect(cust.customer_id);
                                  }}
                                >
                                  <option value="">Select Customer</option>
                                  {customerList.map((c) => (
                                    <option
                                      key={c.customer_id}
                                      value={c.customer_name}
                                    >
                                      {c.customer_name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                  size={14}
                                />
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={field.key} className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">
                              {label}
                            </label>
                            <input
                              type={field.type || "text"}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              placeholder={label}
                              value={
                                invoiceData.customer.ship_to[field.key] || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "customer",
                                  field.key,
                                  e.target.value,
                                  "ship_to",
                                )
                              }
                            />
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Items">
          <div className="space-y-4">
            {invoiceData.items.map((item, index) => (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm relative group hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                  <h4 className="text-sm font-bold text-slate-700">
                    Item #{index + 1}
                  </h4>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                  {template.items?.columns?.map((col) => {
                    if (col.label === "S.No" || col.key === "sno") return null;

                    return (
                      <div
                        key={`${item.id}-${col.key}`}
                        className="space-y-1.5"
                      >
                        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                          {col.label}
                        </label>
                        <input
                          type={col.type || "text"}
                          className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 ${col.type === "number" ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-medium text-slate-700" : ""}`}
                          placeholder={col.label}
                          value={item[col.key] || ""}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) =>
                            handleItemChange(index, col.key, e.target.value)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddItem}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 w-full justify-center border border-blue-100 border-dashed"
          >
            <Plus size={16} />
            Add New Item
          </button>
        </CollapsibleSection>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {template.footer?.fields?.length > 0 && (
            <div className="w-full md:flex-1">
              <CollapsibleSection title="Bank Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                      {template.footer?.title || "Bank Details"}
                    </h3>
                    {template.footer?.show_bank_details && (
                      <div className="space-y-2 text-sm text-slate-600">
                        {template.footer?.fields?.map((field) => {
                          if (field.label === "Authorized Signatory")
                            return null;
                          return (
                            <div key={field.key} className="flex gap-2">
                              <span className="font-medium min-w-[80px]">
                                {field.label || field.label}:
                              </span>
                              <span>{field.value || "-"}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          )}

          <div className="w-full md:flex-1 space-y-6">
            {template.total?.fields?.length > 0 && (
              <CollapsibleSection title="Summary">
                <div className="space-y-3">
                  {template.total?.fields?.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`text-sm ${field.bold ? "font-bold text-slate-800" : "text-slate-600"}`}
                      >
                        {field.label || field.label}
                      </span>
                      <span
                        className={`text-sm ${field.bold ? "font-bold text-slate-800" : "text-slate-900"}`}
                      >
                        0.00
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}
          </div>
        </div>
      </div>

       {saveResult.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 p-6 relative">
             <button 
                onClick={handleClosePopup}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
             >
                <X size={20} />
             </button>
             
             <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    saveResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                    {saveResult.success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                </div>
                
                <h3 className={`text-lg font-bold mb-2 ${
                    saveResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                    {saveResult.success ? 'Success!' : 'Error'}
                </h3>
                
                <p className="text-slate-600 mb-6">
                    {saveResult.message}
                </p>
                
                <button
                    onClick={handleClosePopup}
                    className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-sm mt-2"
                >
                    Close
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
