"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Save, X } from 'lucide-react';
import Sidebar from './Sidebar';
import EditPanel from './EditPanel';
import TemplatePreview from './TemplatePreview';

const initialTemplate = {
  companyDetails: {
    showLogo: true,
    accentColor: "#2563eb",
    headerTitle: "INVOICE",
    headerFontSize: 60,
    headerOpacity: 0.1,
    fields: [ 
      { key: "invoice_no", label: "Invoice No", visible: true },
      { key: "date", label: "Date", visible: true },
      { key: "name", label: "Company Name", visible: true, bold: true },
      { key: "address", label: "Address", visible: true },
      { key: "gstin", label: "GSTIN", visible: true }
    ]
  },
  invoiceMeta: {
    columnCount: 1,
    fields: []
  },
  customerDetails: {
    layout: "side-by-side",
    billing: {
        title: "Bill To",
        fields: [
            { key: "name", label: "Name", visible: true },
            { key: "address", label: "Address", visible: true },
            { key: "gstin", label: "GSTIN", visible: true },
            { key: "state", label: "State", visible: true }
        ]
    },
    shipping: {
        title: "Ship To",
        fields: [
            { key: "name", label: "Name", visible: true },
            { key: "address", label: "Address", visible: true },
            { key: "state", label: "State", visible: true }
        ]
    }
  },
  table: {
    enableResize: true,
    columns: [
      { key: "sno", label: "S.No", width: "10%", visible: true, align: "center", type: "text" },
      { key: "description", label: "Item & Description", width: "40%", visible: true, align: "left", type: "text" },
      { key: "quantity", label: "Qty", width: "15%", visible: true, align: "right", type: "number" },
      { key: "price", label: "price", width: "15%", visible: true, align: "right", type: "number" },
      { key: "total", label: "Amount", width: "20%", visible: true, align: "right", type: "number" }
    ]
  },
  summary: {
    fields: [
      { key: "subtotal", label: "Sub Total", visible: true, type: "system", sourceColumn: "total" }, // Default calculated from Total column
      { key: "grand_total", label: "Total (INR)", visible: true, bold: true, type: "system" },
    ]
  },
  footer: {
    bankDetails: {
        visible: true,
        title: "Bank Details",
        fields: [
            { key: "bank", label: "Bank", value: "HDFC Bank", visible: true },
            { key: "account", label: "Acct No", value: "6711880000", visible: true },
            { key: "ifsc", label: "IFSC", value: "HDFC000123", visible: true }
        ]
    },
    termsAndConditions: { visible: true, content: "Terms & Conditions applied." },
    signatureLabel: "Authorized Signatory"
  }
};

export default function InvoiceTemplateBuilder() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('companyDetails');
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(true);
  const [template, setTemplate] = useState(initialTemplate);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden text-foreground font-sans relative">
      {/* Save Modal Overlay */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Save Template</h3>
                    <button 
                        onClick={() => setShowSaveModal(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Template Name</label>
                        <input 
                            type="text" 
                            className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="e.g. Standard Business Invoice"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-slate-500">Give your template a recognizable name.</p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button 
                        onClick={() => setShowSaveModal(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            console.log('Saving template:', templateName, template);
                            setShowSaveModal(false);
                        }}
                        disabled={!templateName.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save size={16} />
                        Save Template
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 0. Top Navigation Bar */}
      <div className="h-[58px] border-b bg-white flex items-center justify-between px-6 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-2 font-bold text-[17px] text-slate-800 tracking-tight">
             Edit Template
          </div>
          
          <div className="flex items-center gap-2.5">
             <button 
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-1.5 px-[14px] py-[7px] text-[13px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-md transition-colors shadow-sm border border-blue-100 hover:border-blue-600"
             >
                <Save size={15} />
                Save Template
             </button>
             <button 
                onClick={() => router.push('/templates')}
                className="flex items-center gap-1.5 px-[14px] py-[7px] text-[13px] font-medium text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-md transition-colors shadow-sm border border-red-100 hover:border-red-600"
             >
                <X size={16} />
                Close
             </button>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
      {/* 1. Sidebar (Fixed Width) */}
      <div className="w-[164px] min-w-[160px] border-r bg-slate-50 z-20 shadow-[1px_0_10px_rgba(0,0,0,0.05)] h-full">
        <Sidebar activeSection={activeSection} setActiveSection={(s) => { setActiveSection(s); setIsEditPanelOpen(true); }} />
      </div>

      {/* 2. Edit Panel (Variable Width) */}
      <div 
        className={`bg-white border-r flex flex-col z-10 shadow-[1px_0_10px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out overflow-hidden ${isEditPanelOpen ? 'w-[396px] opacity-100' : 'w-0 opacity-0 border-none'}`}
      >
        <div className="w-[396px] h-full flex flex-col">
          <div className="h-14 shrink-0 border-b bg-white flex items-center justify-between px-5 sticky top-0 z-10">
             <h2 className="text-sm font-semibold capitalize tracking-tight flex items-center gap-2 text-slate-800">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block shadow-sm shadow-blue-200" />
                 {activeSection.replace(/([A-Z])/g, ' $1').trim()} Settings
             </h2>
             <button 
                onClick={() => setIsEditPanelOpen(false)} 
                className="bg-slate-100 text-slate-500 p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                title="Close Settings"
             >
                <ChevronLeft size={18} />
             </button>
          </div>
          <div className="flex-1 overflow-hidden p-5">
             <EditPanel activeSection={activeSection} template={template} setTemplate={setTemplate} />
          </div>
        </div>
      </div>

      {/* 3. Template Preview (Remaining Width) */}
      <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
          {!isEditPanelOpen && (
            <div className="absolute top-6 left-6 z-50">
                <button 
                  onClick={() => setIsEditPanelOpen(true)}
                  className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 text-white transition-all hover:scale-110 active:scale-95 group"
                  title="Open Settings"
                >
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
          )}
          <div className="absolute top-6 right-6 flex gap-2 z-20 pointer-events-none">
               <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-medium text-slate-500 border shadow-sm">
                 A4 Format · 210mm x 297mm
               </div>
          </div>
          
          {/* Scrollable Container with Auto-Scale */}
          <PreviewContainer template={template} isEditPanelOpen={isEditPanelOpen} />
      </div>
      </div>
    </div>
  );
}

function PreviewContainer({ template, isEditPanelOpen }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [manualLayout, setManualLayout] = useState({ width: 'auto', height: 'auto' });
  const [zoomMode, setZoomMode] = useState('auto'); // 'auto' | 'manual'

  // Extracted layout logic
  const calculateLayout = React.useCallback(() => {
      if (!containerRef.current || !contentRef.current) return;
      
      const container = containerRef.current;
      const content = contentRef.current;
      
      const contW = container.clientWidth;
      const contH = container.clientHeight;
      const contentW = content.offsetWidth;
      const contentH = content.offsetHeight;
      
      if (contentW === 0 || contentH === 0) return;

      const padding = 60; 
      const availW = contW - padding;
      const availH = contH - padding;

      const scaleX = availW / contentW;
      const scaleY = availH / contentH;
      
      // Calculate Auto Scale
      let autoScale = 1;
      if (isEditPanelOpen) {
          autoScale = Math.min(scaleX, scaleY, 1);
      } else {
          autoScale = Math.min(scaleX, 1.1);
      }
      const MIN_SCALE = 0.4;
      autoScale = Math.max(autoScale, MIN_SCALE);

      // Determine final scale based on mode
      // If manual, we don't change scale, BUT we need to update layout width/height if content size changed
      // Actually if content size changes (e.g. added column), we should probably re-fit (reset to auto) 
      // or at least re-calculate layout with current manual scale.
      
      // Decision: If template changes, force Auto. If only window resize, respect Manual.
      // But here `calculateLayout` runs on template change too.
      // We can use a ref to track if template changed? No, `calculateLayout` is deps on `template`.
      
      // Simple approach: Always Calculate 'Auto' Base. 
      // If mode is manual, we keep current `scale` state (which user set). 
      // However, we need to ensure manualLayout dimensions are correct for that scale.
      
      const effectiveScale = zoomMode === 'auto' ? autoScale : scale;
      
      if (zoomMode === 'auto') {
          setScale(effectiveScale);
      }

      setManualLayout({ 
          width: contentW * effectiveScale, 
          height: contentH * effectiveScale 
      });

  }, [template, isEditPanelOpen, zoomMode, scale]); // Added scale/zoomMode deps

  useEffect(() => {
    calculateLayout();

    const observer = new ResizeObserver(() => {
        requestAnimationFrame(calculateLayout);
    });
    
    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, [calculateLayout]);

  // Handler for manual zoom
  const handleManualZoom = (newScale) => {
      setZoomMode('manual');
      const clamped = Math.min(Math.max(newScale, 0.25), 2.0); // 25% to 200%
      setScale(clamped);
  };

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden">
        <div ref={containerRef} className="w-full h-full overflow-auto bg-gray-100 flex p-8">
            <div style={{ 
                width: manualLayout.width, 
                height: manualLayout.height,
                margin: 'auto',
                flexShrink: 0,
                position: 'relative'
            }}>
                <div 
                  ref={contentRef}
                  style={{ 
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  className="shadow-2xl bg-white transition-transform duration-200 ease-out will-change-transform"
                >
                  <TemplatePreview template={template} />
                </div>
            </div>
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-6 right-8 flex items-center gap-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg border border-slate-200 z-50">
            <button 
                onClick={() => setZoomMode('auto')}
                className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors ${zoomMode === 'auto' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}
                title="Fit to Screen"
            >
                <RotateCcw size={16} />
            </button>
            
            <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

            <button 
                onClick={() => handleManualZoom(scale - 0.1)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
            >
                <ZoomOut size={16} />
            </button>

            <span className="text-xs font-medium w-9 text-center text-slate-600">
                {Math.round(scale * 100)}%
            </span>

            <button 
                onClick={() => handleManualZoom(scale + 0.1)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
            >
                <ZoomIn size={16} />
            </button>
        </div>
    </div>
  );
}
