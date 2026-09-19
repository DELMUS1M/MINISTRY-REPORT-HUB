'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditReportDialog } from '@/components/secretary/edit-report-dialog';
import { CATEGORY_LABELS, CONGREGATION_NAME, categoryFieldType, monthLabel } from '@/lib/constants';
import { fmtNum } from '@/lib/utils';
import { useToast } from '@/components/toaster';
import type { Profile, Report } from '@/lib/types';

export function SecretaryDashboard({ monthKey: initialMonthKey }: { monthKey: string }) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [monthKey, setMonthKey] = useState(initialMonthKey);
  const [reports, setReports] = useState<Report[]>([]);
  const [publishers, setPublishers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Report | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: reportRows }, { data: profileRows }] = await Promise.all([
      supabase.from('reports').select('*').eq('month_key', monthKey),
      supabase.from('profiles').select('*').eq('role', 'publisher')
    ]);
    setReports(reportRows ?? []);
    setPublishers(profileRows ?? []);
    setLoading(false);
  }, [supabase, monthKey]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: reflect new/edited reports the moment publishers submit them.
  useEffect(() => {
    const channel = supabase
      .channel('reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, load]);

  const nameById = new Map(publishers.map((p) => [p.id, p]));
  let totalHours = 0;
  let totalStudies = 0;
  let yesCount = 0;
  let yesTotal = 0;
  reports.forEach((r) => {
    if (categoryFieldType(r.category) === 'yesno') {
      yesTotal++;
      if (r.participated) yesCount++;
    } else {
      totalHours += Number(r.hours) || 0;
      totalStudies += Number(r.studies) || 0;
    }
  });
  const reportedIds = new Set(reports.map((r) => r.user_id));
  const missing = publishers.filter((p) => !reportedIds.has(p.id));

  async function exportExcel() {
    if (reports.length === 0) return showToast('Nothing to export for this month.');
    const XLSX = await import('xlsx');
    const data = reports.map((r) => {
      const p = nameById.get(r.user_id);
      const type = categoryFieldType(r.category);
      return {
        Name: p?.full_name ?? '—',
        Category: CATEGORY_LABELS[r.category],
        Participated: type === 'yesno' ? (r.participated ? 'Yes' : 'No') : '',
        Hours: type === 'hours' ? r.hours : '',
        'Bible Studies': type === 'hours' ? r.studies : '',
        Comment: r.comment ?? ''
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, monthLabel(monthKey));
    XLSX.writeFile(wb, `ministry-report-${monthKey}.xlsx`);
  }

  async function exportPDF() {
    if (reports.length === 0) return showToast('Nothing to export for this month.');
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Monthly Ministry Report — ${monthLabel(monthKey)}`, 14, 18);
    doc.setFontSize(10);
    doc.text(CONGREGATION_NAME, 14, 25);
    const body = reports.map((r) => {
      const p = nameById.get(r.user_id);
      const type = categoryFieldType(r.category);
      return [
        p?.full_name ?? '—',
        CATEGORY_LABELS[r.category],
        type === 'yesno' ? (r.participated ? 'Yes' : 'No') : '',
        type === 'hours' ? fmtNum(r.hours) : '',
        type === 'hours' ? fmtNum(r.studies) : '',
        r.comment ?? ''
      ];
    });
    // @ts-expect-error -- autoTable plugin augments jsPDF at runtime
    doc.autoTable({
      startY: 32,
      head: [['Name', 'Category', 'Participated', 'Hours', 'Studies', 'Comment']],
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 42, 82] }
    });
    doc.save(`ministry-report-${monthKey}.pdf`);
  }

  return (
    <div className="mx-auto -mt-8 max-w-4xl space-y-5 px-5 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="rounded-[10px] border border-ink-500/20 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 dark:bg-navy-800"
          />
          <Button variant="secondary" onClick={load}>↻ Refresh</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportExcel}>⬇ Export Excel</Button>
          <Button variant="gold" onClick={exportPDF}>⬇ Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatBox icon="👥" label="Reports received" value={`${reports.length} / ${publishers.length}`} />
        <StatBox icon="⏱️" label="Total hours" value={fmtNum(totalHours)} />
        <StatBox icon="📖" label="Total studies" value={fmtNum(totalStudies)} />
        <StatBox icon="✅" label="Participated" value={`${yesCount} / ${yesTotal}`} />
      </div>

      <Card>
        <CardBody>
          <h2 className="font-head text-base font-bold text-navy-900 dark:text-white">Reports this month</h2>
          <p className="mb-4 mt-1 text-[13px] text-ink-500">All submitted reports for {monthLabel(monthKey)}.</p>
          {loading ? (
            <p className="py-6 text-center text-sm text-ink-500">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">No reports submitted for this month yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-ink-500/10 text-left text-[11.5px] font-bold text-ink-500">
                    <th className="py-2">Name</th>
                    <th>Category</th>
                    <th>Details</th>
                    <th>Comment</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reports
                    .slice()
                    .sort((a, b) => (nameById.get(a.user_id)?.full_name ?? '').localeCompare(nameById.get(b.user_id)?.full_name ?? ''))
                    .map((r) => {
                      const p = nameById.get(r.user_id);
                      const type = categoryFieldType(r.category);
                      return (
                        <tr key={r.id} className="border-b border-ink-500/10 last:border-0">
                          <td className="py-2.5">{p?.full_name ?? '—'}</td>
                          <td><Badge tone="gold">{CATEGORY_LABELS[r.category]}</Badge></td>
                          <td>
                            {type === 'yesno' ? (
                              <Badge tone={r.participated ? 'good' : 'bad'}>{r.participated ? 'Yes' : 'No'}</Badge>
                            ) : (
                              `${fmtNum(r.hours)} hrs · ${fmtNum(r.studies)} studies`
                            )}
                          </td>
                          <td className="text-ink-500">{r.comment || '—'}</td>
                          <td>
                            <button className="rounded-lg border border-ink-500/15 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-sky-50 dark:text-sky-100 dark:hover:bg-white/5" onClick={() => setEditing(r)}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-head text-base font-bold text-navy-900 dark:text-white">Haven&apos;t reported yet</h2>
          <p className="mb-4 mt-1 text-[13px] text-ink-500">Publishers with no report on file for {monthLabel(monthKey)}.</p>
          {missing.length === 0 ? (
            <p className="text-sm text-ink-500">Everyone has reported this month. 🎉</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missing.map((p) => (
                <span key={p.id} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-ink-700 dark:bg-white/5 dark:text-sky-100/80">
                  {p.full_name}
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {editing && (
        <EditReportDialog
          report={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-500/10 bg-white p-4 shadow-soft dark:bg-navy-800/60">
      <div className="text-xl">{icon}</div>
      <div className="mt-1 text-[11.5px] font-semibold text-ink-500">{label}</div>
      <div className="font-head mt-0.5 text-xl font-extrabold text-navy-900 dark:text-white">{value}</div>
    </div>
  );
}
