"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { PhoneOff, Plus, X, Upload, Phone, Search, Loader2, AlertCircle } from "lucide-react";
import { fetchDncEntries, insertDncEntries, deleteDncEntry, DncEntry } from "@/lib/dncData";

export default function DoNotCallPage() {
  const [entries, setEntries] = useState<DncEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDncEntries();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(numbers: string[]) {
    setShowModal(false);
    try {
      const added = await insertDncEntries(numbers);
      // Merge: prepend newly inserted rows, skip duplicates by id
      setEntries((prev) => {
        const existingIds = new Set(prev.map((e) => e.id));
        const fresh = added.filter((e) => !existingIds.has(e.id));
        return [...fresh, ...prev];
      });
    } catch {
      setError("Failed to add numbers. Please try again.");
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteDncEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Failed to remove number. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.phoneNumber.toLowerCase().includes(q));
  }, [entries, searchQuery]);

  return (
    <div className="p-4 sm:p-6 w-full">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <PhoneOff size={18} className="text-red-500" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Do Not Call List</h1>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">
              All &quot;Do Not Call&quot; numbers from all campaigns ({entries.length} total)
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors shadow-sm flex-shrink-0"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Phone Numbers</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6" />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={24} className="text-blue-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading DNC list…</p>
        </div>
      ) : (
        <>
          {/* Search bar — only show when there are entries */}
          {entries.length > 0 && (
            <div className="mb-4 relative max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phone numbers…"
                className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                <PhoneOff size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No phone numbers on the DNC list</p>
              <p className="text-xs text-gray-300 text-center px-4">
                Add phone numbers using the &quot;Add&quot; button above
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm text-gray-400">No results for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[300px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Phone Number
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                        Added
                      </th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, i) => (
                      <tr
                        key={entry.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          i === filtered.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-gray-800 font-medium">{entry.phoneNumber}</p>
                          <p className="text-gray-400 text-xs mt-0.5 sm:hidden">{entry.addedAt}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                          {entry.addedAt}
                        </td>
                        <td className="px-3 py-3">
                          {deletingId === entry.id ? (
                            <Loader2 size={13} className="text-gray-300 animate-spin mx-auto" />
                          ) : (
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Footer count */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400">
                  {filtered.length === entries.length
                    ? `${entries.length} number${entries.length !== 1 ? "s" : ""}`
                    : `${filtered.length} of ${entries.length} numbers`}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <AddPhoneNumbersModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}

function AddPhoneNumbersModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (numbers: string[]) => void;
}) {
  const [tab, setTab] = useState<"import" | "manual">("import");
  const [dragOver, setDragOver] = useState(false);
  const [manualText, setManualText] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function parseCSV(text: string): string[] {
    return text
      .split(/[\n,]/)
      .map((s) => s.replace(/[^0-9+]/g, "").trim())
      .filter((s) => s.length >= 7);
  }

  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const numbers = parseCSV(e.target?.result as string);
      if (numbers.length > 0) {
        setSaving(true);
        await onAdd(numbers);
        setSaving(false);
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleManualAdd() {
    const numbers = manualText
      .split(/[\n,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 7);
    if (numbers.length > 0) {
      setSaving(true);
      await onAdd(numbers);
      setSaving(false);
    }
  }

  function downloadSample() {
    const blob = new Blob(["phoneNumber\n+1234567890\n+0987654321"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dnc_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden flex flex-col sm:flex-row max-h-[90vh] sm:max-h-none">
        {/* Left panel — hidden on mobile */}
        <div className="hidden sm:flex w-52 bg-gray-50 border-r border-gray-100 p-6 flex-col gap-4 flex-shrink-0">
          <div className="flex flex-col items-center gap-2 mt-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Phone size={22} className="text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-gray-800 text-center">Phone Numbers Imports</p>
            <p className="text-xs text-gray-400 text-center">Manage imports and add new.</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile top bar */}
          <div className="flex sm:hidden items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Phone size={16} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">Phone Numbers Imports</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-4 sm:px-6 pt-3 sm:pt-4 gap-4 sm:gap-6">
            <button
              onClick={() => setTab("import")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "import"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Import File
            </button>
            <button
              onClick={() => setTab("manual")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "manual"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Add Manually
            </button>
            {/* Close button — desktop only */}
            <button
              onClick={onClose}
              className="hidden sm:block ml-auto mb-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto">
            {tab === "import" ? (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`w-full max-w-[220px] sm:max-w-xs aspect-square rounded-full flex flex-col items-center justify-center gap-3 border-2 border-dashed transition-colors cursor-pointer ${
                    dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"
                  }`}
                  onClick={() => fileRef.current?.click()}
                >
                  {saving ? (
                    <Loader2 size={28} className="text-blue-500 animate-spin" />
                  ) : (
                    <>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Phone size={18} className="text-indigo-400 sm:hidden" />
                        <Phone size={22} className="text-indigo-400 hidden sm:block" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 text-center px-4">
                        Import DNC numbers from a file
                      </p>
                      <p className="text-xs text-gray-400">Drop CSV file here or</p>
                      <button
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                      >
                        <Upload size={11} />
                        Select file
                      </button>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                <p className="text-xs text-gray-400 mt-5 text-center px-2">
                  The file must include the following columns: <strong>phoneNumber</strong>.<br />
                  Use Google Sheets or Microsoft Excel to create a CSV file.{" "}
                  <button onClick={downloadSample} className="text-green-600 hover:underline font-medium">
                    Download Sample CSV
                  </button>
                </p>
              </>
            ) : (
              <div className="w-full max-w-sm flex flex-col gap-3">
                <p className="text-sm text-gray-600">
                  Enter phone numbers separated by commas or new lines.
                </p>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder={"+1234567890\n+0987654321"}
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleManualAdd}
                  disabled={!manualText.trim() || saving}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving…" : "Add Numbers"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
