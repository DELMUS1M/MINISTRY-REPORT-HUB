'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { categoryFieldType } from '@/lib/constants';
import { useToast } from '@/components/toaster';
import type { Report } from '@/lib/types';

export function EditReportDialog({
  report,
  onClose,
  onSaved
}: {
  report: Report;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const { showToast } = useToast();
  const fieldType = categoryFieldType(report.category);
  const [participated, setParticipated] = useState(String(!!report.participated));
  const [hours, setHours] = useState(String(report.hours ?? 0));
  const [studies, setStudies] = useState(String(report.studies ?? 0));
  const [comment, setComment] = useState(report.comment ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const patch: Partial<Report> & { edited_at: string } =
      fieldType === 'yesno'
        ? { participated: participated === 'true', edited_at: new Date().toISOString() }
        : {
            hours: parseFloat(hours) || 0,
            studies: parseInt(studies, 10) || 0,
            comment: comment.trim() || null,
            edited_at: new Date().toISOString()
          };

    const {
      data: { user }
    } = await supabase.auth.getUser();
    const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user?.id ?? '').single();

    const { error } = await supabase
      .from('reports')
      .update({ ...patch, edited_by_secretary: myProfile?.full_name ?? 'Secretary' })
      .eq('id', report.id);
    setSaving(false);
    if (error) return showToast('Could not save changes.');
    showToast('Report updated.');
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-5" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl dark:bg-navy-800" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-head mb-4 text-base font-bold text-navy-900 dark:text-white">Edit — {report.category}</h3>

        {fieldType === 'yesno' ? (
          <div className="mb-4">
            <Label htmlFor="edit-participated">Participated</Label>
            <Select id="edit-participated" value={participated} onChange={(e) => setParticipated(e.target.value)}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
        ) : (
          <>
            <div className="mb-3.5">
              <Label htmlFor="edit-hours">Hours</Label>
              <input
                id="edit-hours"
                type="number"
                step={0.25}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full rounded-[10px] border border-ink-500/20 bg-sky-50/60 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:bg-white/5"
              />
            </div>
            <div className="mb-3.5">
              <Label htmlFor="edit-studies">Bible studies</Label>
              <input
                id="edit-studies"
                type="number"
                step={1}
                value={studies}
                onChange={(e) => setStudies(e.target.value)}
                className="w-full rounded-[10px] border border-ink-500/20 bg-sky-50/60 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:bg-white/5"
              />
            </div>
            <div className="mb-5">
              <Label htmlFor="edit-comment">Comment</Label>
              <Textarea id="edit-comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
          </>
        )}

        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
