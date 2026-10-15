import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAlertDialog } from "@/components/ui/AlertDialog";
import { useLayer } from "@/components/ui/layer-context";
import { useToast } from "@/components/ui/Toast";
import { openDemoStateDialog } from "@/features/demo/components/DemoStateDialog";
import {
  DEMO_SNAPSHOT_META,
  type DemoSnapshotId,
  isDemoMode,
  readDataMode,
} from "@/features/demo/mode";
import { useResetDemoSnapshot } from "@/features/demo/mutations";
import { ApiRequestError } from "@/shared/lib/api";
import { fmtDateYear } from "@/shared/lib/format";
import { Section } from "@/features/weeks/components/Section";
import {
  useActivatePilot,
  useCreateOverride,
  useExportJson,
  useLogPilotInterruption,
  useResumePilot,
  usePatchSettings,
  useRevokeOverride,
} from "../mutations";
import {
  useAuditQuery,
  useOverridesQuery,
  usePilotQuery,
  useSettingsQuery,
} from "../queries";

export function SettingsScreen() {
  const { toast } = useToast();
  const alert = useAlertDialog();
  const layer = useLayer();
  const settingsQ = useSettingsQuery();
  const overridesQ = useOverridesQuery();
  const auditQ = useAuditQuery();
  const pilotQ = usePilotQuery();
  const patchSettings = usePatchSettings();
  const createOverride = useCreateOverride();
  const revokeOverride = useRevokeOverride();
  const activatePilot = useActivatePilot();
  const logInterruption = useLogPilotInterruption();
  const resumePilot = useResumePilot();
  const exportJson = useExportJson();
  const resetDemo = useResetDemoSnapshot();

  const [ovWeek, setOvWeek] = useState("");
  const [ovReason, setOvReason] = useState("");
  const [simulated, setSimulated] = useState(true);
  const [consent, setConsent] = useState(false);
  const [dataUseScope, setDataUseScope] = useState("");

  const mode = readDataMode();
  const demoOn = isDemoMode(mode);
  const demoLabel = demoOn
    ? DEMO_SNAPSHOT_META[mode.slice("demo:".length) as DemoSnapshotId].label
    : "Off";

  if (settingsQ.isLoading) {
    return (
      <div className="fade max-w-3xl space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (settingsQ.isError || !settingsQ.data) {
    return (
      <div className="fade max-w-3xl">
        <h1 className="serif text-3xl">Settings</h1>
        <p className="muted mt-2 text-sm">
          {settingsQ.error instanceof ApiRequestError
            ? settingsQ.error.message
            : "Could not load settings."}
        </p>
        <Button className="mt-4" onClick={() => void settingsQ.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const S = settingsQ.data;
  const activeOverrides = (overridesQ.data ?? []).filter((o) => o.active);
  const audit = auditQ.data ?? [];
  const pilot = pilotQ.data;

  const toggleLocking = async () => {
    if (S.lockingEnabled) {
      const ok = await alert.confirm({
        title: "Turn off strict locking?",
        text: "Every week becomes openable. Opening a week out of order is recorded as an override, never as verification. Gates and evidence are still required.",
        okLabel: "Turn off locking",
        danger: true,
        typed: "UNLOCK",
      });
      if (!ok) return;
      try {
        await patchSettings.mutateAsync({ lockingEnabled: false });
        toast("Locking off. This is in the audit log.");
      } catch (err) {
        toast(err instanceof Error ? err.message : "Update failed", {
          tone: "warn",
        });
      }
    } else {
      try {
        await patchSettings.mutateAsync({ lockingEnabled: true });
        toast("Strict locking on");
      } catch (err) {
        toast(err instanceof Error ? err.message : "Update failed", {
          tone: "warn",
        });
      }
    }
  };

  const addOverride = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(ovWeek);
    const r = ovReason.trim();
    if (!(n >= 2 && n <= 91)) {
      toast("Pick a week from 2 to 91", { tone: "warn" });
      return;
    }
    if (!r) {
      toast("Add a reason. It goes in the audit log.", { tone: "warn" });
      return;
    }
    const ok = await alert.confirm({
      title: `Unlock Week ${n} with an override?`,
      text: `Week ${n} opens for study. Week ${n - 1} stays unverified, and nothing is marked Verified.`,
      okLabel: "Unlock with override",
      typed: "OVERRIDE",
    });
    if (!ok) return;
    try {
      await createOverride.mutateAsync({ weekNumber: n, reason: r });
      setOvWeek("");
      setOvReason("");
      toast(`Week ${n} unlocked by override`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Override failed", {
        tone: "warn",
      });
    }
  };

  const onPlanStart = async (value: string) => {
    try {
      await patchSettings.mutateAsync({
        planStartDate: value || null,
      });
      toast("Plan start updated. Actual dates are unchanged.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", {
        tone: "warn",
      });
    }
  };

  const onExport = async () => {
    try {
      const data = await exportJson.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      const stamp = mode.replace(":", "-");
      a.href = URL.createObjectURL(blob);
      a.download = `learning-os-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Export downloaded");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed", {
        tone: "warn",
      });
    }
  };

  const onActivatePilot = async () => {
    const ok = await alert.confirm({
      title: "Start the pilot clock?",
      text: "This starts a four-calendar-week timeline today. It does not verify or unlock any week.",
      okLabel: "Start clock",
    });
    if (!ok) return;
    try {
      await activatePilot.mutateAsync({
        mode: simulated ? "SIMULATED" : "REAL",
        consentDocumented: simulated ? false : consent,
        dataUseScope: simulated ? undefined : dataUseScope.trim() || undefined,
      });
      toast("Pilot clock started");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Activation failed", {
        tone: "warn",
      });
    }
  };

  const dayIndex = pilot?.clock
    ? Math.min(28, Math.max(1, pilot.clock.elapsedDays + 1))
    : 1;

  return (
    <div className="fade max-w-3xl">
      <p className="text-sm muted flex items-center gap-2">Account and rules</p>
      <h1 className="serif text-4xl md:text-5xl mt-1">Settings</h1>

      <div className="mt-8 space-y-10">
        <Section title="Week locking">
          <div className="surface p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="font-medium">Strict locking</div>
                <p className="text-sm muted mt-1">
                  Weeks open one at a time after manual verification. No
                  skipping or reordering while on.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={S.lockingEnabled}
                aria-label="Strict locking"
                onClick={() => void toggleLocking()}
                className="relative h-6 w-11 rounded-full transition-colors shrink-0"
                style={{
                  background: S.lockingEnabled
                    ? "var(--forest)"
                    : "var(--line2)",
                }}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                  style={{ left: S.lockingEnabled ? "22px" : "2px" }}
                />
              </button>
            </div>

            <div className="border-t line mt-5 pt-5">
              <div className="font-medium text-sm">Unlock override</div>
              <p className="text-sm muted mt-1">
                Open a specific week without verifying the one before it.
                Recorded in the audit log. It never marks anything Verified and
                evidence is still required.
              </p>
              <form
                className="flex flex-wrap gap-2 mt-3"
                onSubmit={(e) => void addOverride(e)}
              >
                <label htmlFor="ovw" className="sr-only">
                  Week to unlock
                </label>
                <Input
                  id="ovw"
                  type="number"
                  min={2}
                  max={91}
                  className="!w-28"
                  placeholder="Week"
                  value={ovWeek}
                  onChange={(e) => setOvWeek(e.target.value)}
                />
                <label htmlFor="ovr" className="sr-only">
                  Reason
                </label>
                <Input
                  id="ovr"
                  className="flex-1 min-w-[12rem]"
                  placeholder="Reason, required"
                  value={ovReason}
                  onChange={(e) => setOvReason(e.target.value)}
                />
                <Button type="submit">
                  <Icon name="lock-open" />
                  Unlock with override
                </Button>
              </form>
              {activeOverrides.length ? (
                <ul className="mt-4 space-y-2">
                  {activeOverrides.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center gap-3 text-sm rounded-lg bg-amber border px-3 py-2"
                    >
                      <Icon name="lock-open" />
                      <span className="flex-1">
                        Week {o.weekNumber}: {o.reason}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          void revokeOverride
                            .mutateAsync(o.id)
                            .then(() => toast("Override revoked"))
                            .catch((err: unknown) =>
                              toast(
                                err instanceof Error
                                  ? err.message
                                  : "Revoke failed",
                                { tone: "warn" },
                              ),
                            );
                        }}
                      >
                        Revoke
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </Section>

        <Section title="Audit log">
          {audit.length ? (
            <ol className="border-l line ml-1.5 space-y-4">
              {audit.map((a) => {
                const warn = /override|locking_disabled|Locking dis/i.test(
                  a.action,
                );
                return (
                  <li key={a.id} className="pl-5 relative text-sm">
                    <span
                      className={`absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full ${warn ? "" : "bg-forest"}`}
                      style={warn ? { background: "var(--amber)" } : undefined}
                    />
                    <div className="flex flex-wrap gap-x-3">
                      <span className="font-medium">{formatAction(a.action)}</span>
                      <span className="text-xs muted">
                        {fmtDateYear(a.createdAt)}{" "}
                        {new Date(a.createdAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="muted">{a.detail}</div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm muted">No entries.</p>
          )}
        </Section>

        <Section title="Plan">
          <div className="surface p-5 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs muted" htmlFor="psd">
                Plan start date (planned dates only)
              </label>
              <DatePicker
                id="psd"
                label="Plan start date"
                className="mt-1.5"
                value={S.planStartDate ?? ""}
                onValueChange={(date) => void onPlanStart(date)}
              />
            </div>
            <div>
              <label className="text-xs muted" htmlFor="aem">
                Authorized email
              </label>
              <Input
                id="aem"
                type="email"
                className="mt-1.5"
                value={S.ownerEmail}
                readOnly
                aria-readonly="true"
              />
              <p className="text-xs muted mt-1.5">
                Sign-in is limited to this configured address. It cannot be
                changed from the app.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Live pilot">
          <div className="surface p-5">
            {!pilot?.activated || !pilot.pilot?.activatedAt ? (
              <>
                <p className="text-sm ink2">
                  The pilot runs on its own four-calendar-week clock, separate
                  from week locking. Start it when you actually go live. Require
                  documented consent for a real pilot, or label SIMULATED.
                </p>
                <label className="flex items-center gap-2 text-sm mt-3">
                  <input
                    type="checkbox"
                    checked={simulated}
                    onChange={(e) => setSimulated(e.target.checked)}
                  />
                  Label as SIMULATED (no consenting client yet)
                </label>
                {!simulated ? (
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      Consent and data-use boundaries documented
                    </label>
                    <Input
                      placeholder="Data-use scope"
                      value={dataUseScope}
                      onChange={(e) => setDataUseScope(e.target.value)}
                    />
                  </div>
                ) : null}
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => void onActivatePilot()}
                >
                  <Icon name="play" />
                  Activate pilot clock
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="dot"
                    style={{ background: "var(--forest)" }}
                  />
                  Day {dayIndex} of 28{" "}
                  {pilot.pilot.mode === "SIMULATED" ? (
                    <Chip tone="a">SIMULATED</Chip>
                  ) : null}
                  <span className="ml-auto text-xs muted">
                    Started {fmtDateYear(pilot.pilot.activatedAt)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-1.5 rounded-full sunk overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            background: "var(--forest)",
                            width: `${Math.max(0, Math.min(100, ((dayIndex - 1 - (i - 1) * 7) / 7) * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="text-[11px] muted mt-1">
                        Pilot week {i}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-4"
                  disabled={logInterruption.isPending || resumePilot.isPending}
                  onClick={() => {
                    void (pilot.pilot?.activeInterruptionId
                      ? resumePilot.mutateAsync()
                      : logInterruption.mutateAsync({}))
                      .then(() => toast(pilot.pilot?.activeInterruptionId ? "Pilot resumed" : "Pilot paused"))
                      .catch((err: unknown) =>
                        toast(
                          err instanceof Error
                            ? err.message
                            : "Could not log interruption",
                          { tone: "warn" },
                        ),
                      );
                  }}
                >
                  <Icon name={pilot.pilot.activeInterruptionId ? "play" : "pause"} />
                  {pilot.pilot.activeInterruptionId ? "Resume pilot" : "Pause pilot"}
                </Button>
                <span className="text-xs muted ml-2">
                  {pilot.pilot.activeInterruptionId ? "Clock paused" : `${pilot.pilot.interruptionCount ?? 0} interruptions`}
                </span>
              </>
            )}
          </div>
        </Section>

        <Section title="Data">
          <div className="surface p-5 flex flex-wrap gap-2">
            <Button onClick={() => openDemoStateDialog(layer)}>
              <Icon name="layers" />
              Demo state: {demoLabel}
            </Button>
            {demoOn ? (
              <Button
                onClick={() => {
                  void resetDemo
                    .mutateAsync()
                    .then(() => toast("Demo snapshot restored"))
                    .catch((err: unknown) =>
                      toast(
                        err instanceof Error ? err.message : "Reset failed",
                        { tone: "warn" },
                      ),
                    );
                }}
              >
                <Icon name="rotate-ccw" />
                Reset demo data
              </Button>
            ) : null}
            <Button onClick={() => void onExport()}>
              <Icon name="download" />
              Export JSON
            </Button>
          </div>
          <p className="text-xs muted mt-2">
            Progress, notes, settings and audit history are saved to your
            Learning OS account in Cloudflare D1. Media objects are stored in
            R2. Demo snapshots use an isolated in-memory adapter and never write
            to your real records.
          </p>
        </Section>
      </div>
    </div>
  );
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
