'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/toaster';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS, CONGREGATION_NAME, categoryFieldType, monthLabel } from '@/lib/constants';
import { fmtNum } from '@/lib/utils';
import type { Profile, Report } from '@/lib/types';

export function PublisherDashboard({
  profile,
  monthKey,
  currentReport,
  history
}: {
  profile: Profile;
  monthKey: string;
  currentReport: Report | null;
  history: Report[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const fieldType = categoryFieldType(profile.category ?? 'publisher');

  const [participated, setParticipated] = useState<boolean | null>(null);
  const [hours, setHours] = useState('');
  const [studies, setStudies] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function submitYesNo() {
    if (participated === null) return;
    setSaving(true);
    const { error } = await supabase.from('reports').insert({
      user_id: profile.id,
      month_key: monthKey,
      category: profile.category!,
      participated,
      hours: null,
      studies: null,
      comment: null
    });
    setSaving(false);
    if (error) return showToast('Could not submit — please try again.');
    showToast('Report submitted!');
    router.refresh();
  }

  async function submitHours() {
    const h = parseFloat(hours);
    if (isNaN(h) || h < 0) return showToast('Enter a valid number of hours.');
    setSaving(true);
    const { error } = await supabase.from('reports').insert({
      user_id: profile.id,
      month_key: monthKey,
      category: profile.category!,
      participated: null,
      hours: h,
      studies: parseInt(studies || '0', 10),
      comment: comment.trim() || null
    });
    setSaving(false);
    if (error) return showToast('Could not submit — please try again.');
    showToast('Report submitted!');
    router.refresh();
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `ministry-report-${profile.username}-${monthKey}.png`;
      a.click();
    } catch {
      showToast('Could not generate the image.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto -mt-8 max-w-3xl space-y-5 px-5 pb-24">
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        <StatBox icon="📋" label="Category" value={CATEGORY_LABELS[profile.category ?? 'publisher']} />
        {fieldType === 'yesno' ? (
          <StatBox icon={currentReport ? '✅' : '⏳'} label="This month" value={currentReport ? (currentReport.participated ? 'Participated' : 'No report') : 'Not submitted'} />
        ) : (
          <>
            <StatBox icon="⏱️" label="Hours this month" value={currentReport ? fmtNum(currentReport.hours) : '—'} />
            <StatBox icon="📖" label="Studies this month" value={currentReport ? fmtNum(currentReport.studies) : '—'} />
          </>
        )}
      </div>

      <Card>
        <CardBody>
          <h2 className="font-head text-base font-bold text-navy-900 dark:text-white">{monthLabel(monthKey)}</h2>
          <p className="mb-4 mt-1 text-[13px] text-ink-500">
            Submit once — your report locks after saving. Contact the secretary for corrections.
          </p>

          {currentReport ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-ink-500/10 bg-sky-50/60 p-5 dark:bg-white/5">
              <div className="flex flex-wrap gap-6">
                {fieldType === 'yesno' ? (
                  <Stat value={currentReport.participated ? 'Yes' : 'No'} label="Participated in the ministry" />
                ) : (
                  <>
                    <Stat value={fmtNum(currentReport.hours)} label="Hours" />
                    <Stat value={fmtNum(currentReport.studies)} label="Bible studies" />
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="muted">🔒 Submitted {new Date(currentReport.submitted_at).toLocaleDateString()}</Badge>
                <Button variant="gold" onClick={downloadCard} disabled={downloading}>
                  {downloading ? 'Preparing…' : '⬇ Download report card'}
                </Button>
              </div>
              {currentReport.comment && <p className="w-full text-[13px] text-ink-500">💬 {currentReport.comment}</p>}
            </div>
          ) : fieldType === 'yesno' ? (
            <div>
              <Label>Did you participate in the public ministry this month?</Label>
              <div className="mb-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setParticipated(true)}
                  className={`flex-1 rounded-md border-2 p-4 text-center font-bold transition ${
                    participated === true ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10' : 'border-ink-500/15 bg-sky-50/40 text-ink-700 dark:bg-white/5'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setParticipated(false)}
                  className={`flex-1 rounded-md border-2 p-4 text-center font-bold transition ${
                    participated === false ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10' : 'border-ink-500/15 bg-sky-50/40 text-ink-700 dark:bg-white/5'
                  }`}
                >
                  No
                </button>
              </div>
              <Button variant="primary" className="w-full" disabled={participated === null || saving} onClick={submitYesNo}>
                {saving ? 'Saving…' : 'Submit report'}
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="hours">Hours in the field ministry</Label>
                  <input
                    id="hours"
                    type="number"
                    min={0}
                    step={0.25}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-[10px] border border-ink-500/20 bg-sky-50/60 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:bg-white/5"
                  />
                </div>
                <div>
                  <Label htmlFor="studies">Bible studies conducted</Label>
                  <input
                    id="studies"
                    type="number"
                    min={0}
                    step={1}
                    value={studies}
                    onChange={(e) => setStudies(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-[10px] border border-ink-500/20 bg-sky-50/60 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:bg-white/5"
                  />
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Anything the secretary should know..." />
              </div>
              <Button variant="primary" className="w-full" disabled={saving} onClick={submitHours}>
                {saving ? 'Saving…' : 'Submit report'}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-head text-base font-bold text-navy-900 dark:text-white">Your report history</h2>
          <p className="mb-4 mt-1 text-[13px] text-ink-500">Your last 12 months, most recent first.</p>
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">No reports submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-ink-500/10 text-left text-[11.5px] font-bold text-ink-500">
                    <th className="py-2">Month</th>
                    {fieldType === 'yesno' ? (
                      <th>Participated</th>
                    ) : (
                      <>
                        <th>Hours</th>
                        <th>Studies</th>
                        <th>Comment</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id} className="border-b border-ink-500/10 last:border-0">
                      <td className="py-2.5">{monthLabel(r.month_key)}</td>
                      {fieldType === 'yesno' ? (
                        <td><Badge tone={r.participated ? 'good' : 'bad'}>{r.participated ? 'Yes' : 'No'}</Badge></td>
                      ) : (
                        <>
                          <td>{fmtNum(r.hours)}</td>
                          <td>{fmtNum(r.studies)}</td>
                          <td className="text-ink-500">{r.comment || '—'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Offscreen shareable report card, rendered for html-to-image capture */}
      {currentReport && (
        <div className="pointer-events-none fixed -left-[9999px] top-0">
          <div ref={cardRef} className="relative h-[628px] w-[1200px] overflow-hidden bg-gradient-to-b from-[#F7FBFF] to-[#EAF3FC] font-sans">
            <div className="absolute left-0 top-0 h-[420px] w-[420px] bg-gradient-to-br from-[#0F2A52] to-[#2E6FC4]" style={{ clipPath: 'polygon(0 0,100% 0,0 100%)' }} />
            <div className="relative flex items-start justify-between px-14 pt-11">
              <div>
                <div className="font-head text-[34px] font-extrabold tracking-wide text-[#0F2A52]">MONTHLY MINISTRY</div>
                <div className="font-head bg-gradient-to-r from-[#0F2A52] to-[#2E6FC4] bg-clip-text text-[56px] font-extrabold leading-none text-transparent">REPORT</div>
                <div className="font-head mt-4 inline-block rounded bg-gradient-to-r from-[#0F2A52] to-[#1B4F91] px-7 py-2.5 text-xl font-bold text-white">
                  FOR {monthLabel(monthKey).toUpperCase()}
                </div>
              </div>
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#F0CB6E] to-[#D9A62E] text-[42px] shadow-lg">📖</div>
            </div>
            <div className="relative mt-8 flex items-center gap-4 px-14">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-sky-100 text-2xl text-[#1B4F91]">
                {profile.full_name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="text-[15px] font-bold text-ink-500">Name</div>
                <div className="font-head text-[32px] font-extrabold text-[#0F2A52]">{profile.full_name}</div>
              </div>
            </div>
            <div className="relative mx-14 mt-7 h-px bg-ink-500/15" />
            <div className="relative mt-7 flex gap-6 px-14">
              {fieldType === 'yesno' ? (
                <div className="flex-1 rounded-2xl bg-white p-6 shadow-md">
                  <div className="mb-1.5 text-base font-bold text-[#1B4F91]">Participated in the ministry</div>
                  <div className="font-head text-5xl font-extrabold text-[#0F2A52]">{currentReport.participated ? 'YES' : 'NO'}</div>
                </div>
              ) : (
                <>
                  <div className="flex-1 rounded-2xl bg-white p-6 shadow-md">
                    <div className="mb-1.5 text-base font-bold text-[#1B4F91]">No. of Hours</div>
                    <div className="font-head text-5xl font-extrabold text-[#0F2A52]">{fmtNum(currentReport.hours)}</div>
                  </div>
                  <div className="flex-1 rounded-2xl bg-white p-6 shadow-md">
                    <div className="mb-1.5 text-base font-bold text-[#1B4F91]">Studies Conducted</div>
                    <div className="font-head text-5xl font-extrabold text-[#0F2A52]">{fmtNum(currentReport.studies)}</div>
                  </div>
                </>
              )}
            </div>
            {currentReport.comment && <div className="relative mx-14 mt-5 text-[15px] italic text-ink-700">&ldquo;{currentReport.comment}&rdquo;</div>}
            <div className="absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-r from-[#0F2A52] to-[#1B4F91]" style={{ clipPath: 'ellipse(70% 100% at 30% 100%)' }} />
            <div className="absolute bottom-4 right-10 text-[13px] font-semibold text-sky-100">{CONGREGATION_NAME}</div>
          </div>
        </div>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-head text-[22px] font-extrabold text-navy-900 dark:text-white">{value}</div>
      <div className="text-[11.5px] font-semibold text-ink-500">{label}</div>
    </div>
  );
}
