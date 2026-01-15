export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 text-sm font-medium mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-slate-900">₹ 12,45,000</p>
            <span className="text-emerald-600 text-xs font-medium mt-2 block">+12.5% from last month</span>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 text-sm font-medium mb-2">Pending Invoices</h3>
            <p className="text-3xl font-bold text-slate-900">23</p>
            <span className="text-amber-600 text-xs font-medium mt-2 block">Requires attention</span>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 text-sm font-medium mb-2">New Customers</h3>
            <p className="text-3xl font-bold text-slate-900">18</p>
            <span className="text-blue-600 text-xs font-medium mt-2 block">+4 this week</span>
        </div>
      </div>
    </div>
  );
}
