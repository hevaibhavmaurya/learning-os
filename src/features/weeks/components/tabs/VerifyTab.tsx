import {
  useMemo,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import type { CurriculumWeek } from "@/shared/content/curriculum";
import type { WeekDetailResponse } from "@/shared/contracts/weeks";
import type { GateName } from "@/shared/domain/gates";
import { ApiRequestError } from "@/shared/lib/api";
import { fmtDate, fmtDateYear } from "@/shared/lib/format";
import {
  useCreateAttemptMutation,
  useReopenEvidenceMutation,
  useSubmitEvidenceMutation,
  useUpsertEvidenceMutation,
} from "../../mutations";
import { EVIDENCE_UI, GATES_UI, SCORE_MEANING } from "../../lib/gates-ui";
import { Section } from "../Section";

type GateDraft = Record<GateName, number> & {
  assist: "independent" | "docs-only" | "assisted";
  note: string;
  coreAiAuthored: boolean;
};

const emptyDraft = (): GateDraft => ({
  recall: 0,
  build: 0,
  debug: 0,
  transfer: 0,
  assist: "independent",
  note: "",
  coreAiAuthored: false,
});

function GateSeg({
  value,
  locked,
  onChange,
  label,
}: {
  value: number;
  locked: boolean;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label={`${label} score`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const selected = value === i;
        let style: CSSProperties | undefined;
        let cls =
          "h-9 w-9 rounded-lg border text-sm font-medium tabular-nums transition-colors ";
        if (selected && i >= 3) {
          cls += "bg-forest border-transparent";
        } else if (selected && i > 0 && i < 3) {
          cls += "border-transparent";
          style = { background: "var(--amber-bg)", color: "var(--amber)" };
        } else if (selected && i === 0) {
          cls += "border-transparent";
          style = { background: "var(--sunk)", color: "var(--muted)" };
        } else {
          cls += "line hover:bg-[var(--sunk)]";
        }
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={locked}
            title={SCORE_MEANING[i]}
            className={cls}
            style={style}
            onClick={() => onChange(i)}
          >
            {i}
          </button>
        );
      })}
    </div>
  );
}

export function VerifyTab({
  week,
  detail,
  locked,
  gatesRef,
}: {
  week: CurriculumWeek;
  detail: WeekDetailResponse;
  locked: boolean;
  gatesRef: RefObject<HTMLElement | null>;
}) {
  const { toast } = useToast();
  const createAttempt = useCreateAttemptMutation(week.number);
  const upsertEvidence = useUpsertEvidenceMutation(week.number);
  const submitEvidence = useSubmitEvidenceMutation(week.number);
  const reopenEvidence = useReopenEvidenceMutation(week.number);

  const [draft, setDraft] = useState<GateDraft>(emptyDraft);
  const [evidenceDraft, setEvidenceDraft] = useState(() => ({
    artifactRef: detail.evidence?.artifactRef ?? "",
    reproducibleSteps: detail.evidence?.reproducibleSteps ?? "",
    testOutcome: detail.evidence?.testOutcome ?? "",
    testOutputs: detail.evidence?.testOutputs ?? "",
    failureRootCause: detail.evidence?.failureRootCause ?? "",
    transferCondition: detail.evidence?.transferCondition ?? "",
    transferResult: detail.evidence?.transferResult ?? "",
    explanation: detail.evidence?.explanation ?? "",
    measurementContext: detail.evidence?.measurementContext ?? "",
    measurementNa: detail.evidence?.measurementNa ?? false,
    limitation: detail.evidence?.limitation ?? "",
    helpUsed: detail.evidence?.helpUsed ?? "",
    coreAiAuthored: detail.evidence?.coreAiAuthored ?? false,
    externalReviewStatus: detail.evidence?.externalReviewStatus ?? "",
    boundedCoreEvidence: detail.evidence?.boundedCoreEvidence ?? "",
    hardwareEvidence: detail.evidence?.hardwareEvidence ?? "",
  }));

  const latest = detail.latestAttempt;
  const gatesPass = Boolean(latest?.passed);
  const evidenceDisabled = locked || detail.status === "DONE";
  const openGaps = detail.openGaps ?? [];

  const filledCount = useMemo(() => {
    let n = 0;
    const total = EVIDENCE_UI.length + (week.isBoundedCore ? 1 : 0) + (week.number === 76 ? 1 : 0);
    const checks: boolean[] = [
      Boolean(evidenceDraft.artifactRef.trim() || evidenceDraft.explanation.trim()),
      Boolean(evidenceDraft.reproducibleSteps.trim()),
      Boolean(evidenceDraft.testOutcome),
      Boolean(evidenceDraft.failureRootCause.trim()),
      Boolean(
        evidenceDraft.transferCondition.trim() &&
          evidenceDraft.transferResult.trim(),
      ),
      Boolean(evidenceDraft.explanation.trim()),
      Boolean(
        evidenceDraft.measurementNa || evidenceDraft.measurementContext.trim(),
      ),
      Boolean(evidenceDraft.limitation.trim()),
      Boolean(evidenceDraft.helpUsed.trim()),
      Boolean(evidenceDraft.externalReviewStatus.trim()),
    ];
    if (week.isBoundedCore) {
      checks.push(Boolean(evidenceDraft.boundedCoreEvidence.trim()));
    }
    if (week.number === 76) {
      checks.push(Boolean(evidenceDraft.hardwareEvidence.trim()));
    }
    n = checks.filter(Boolean).length;
    return { n, total };
  }, [evidenceDraft, week.isBoundedCore, week.number]);

  if (detail.status === "VERIFIED") {
    return <VerifiedSummary week={week} detail={detail} />;
  }

  const saveAttempt = async () => {
    if (GATES_UI.some((g) => !draft[g.key])) {
      toast("Score all four gates first. 0 means not assessed.", {
        tone: "warn",
      });
      return;
    }
    try {
      const res = await createAttempt.mutateAsync({
        weekNumber: week.number,
        recall: draft.recall,
        build: draft.build,
        debug: draft.debug,
        transfer: draft.transfer,
        assistanceLevel: draft.assist,
        assistanceNotes: draft.note,
        coreAiAuthored: draft.coreAiAuthored,
        externallyReviewed: false,
        notes: draft.note,
        expectedRevision: detail.revision,
      });
      setDraft(emptyDraft());
      toast(
        res.gapCreated
          ? "Attempt saved. Gap opened — plan a new unseen retry."
          : "Attempt saved. All gates pass. Finish the evidence next.",
      );
    } catch (err) {
      toast(
        err instanceof ApiRequestError ? err.message : "Could not save attempt",
        { tone: "warn" },
      );
    }
  };

  const persistEvidence = async (partial?: Partial<typeof evidenceDraft>) => {
    const next = { ...evidenceDraft, ...partial };
    setEvidenceDraft(next);
    try {
      await upsertEvidence.mutateAsync({
        weekNumber: week.number,
        expectedRevision: detail.revision,
        artifactRef: next.artifactRef || null,
        reproducibleSteps: next.reproducibleSteps || null,
        testOutcome:
          next.testOutcome === "pass" ||
          next.testOutcome === "fail" ||
          next.testOutcome === "not_applicable"
            ? next.testOutcome
            : null,
        testOutputs: next.testOutputs || null,
        failureRootCause: next.failureRootCause || null,
        transferCondition: next.transferCondition || null,
        transferResult: next.transferResult || null,
        explanation: next.explanation || null,
        measurementContext: next.measurementContext || null,
        measurementNa: next.measurementNa,
        limitation: next.limitation || null,
        helpUsed: next.helpUsed || null,
        coreAiAuthored: next.coreAiAuthored,
        externalReviewStatus: next.externalReviewStatus || null,
        boundedCoreEvidence: next.boundedCoreEvidence || null,
        hardwareEvidence: next.hardwareEvidence || null,
      });
    } catch {
      /* draft retained; toast on explicit submit */
    }
  };

  const trySubmit = async () => {
    await persistEvidence();
    try {
      await submitEvidence.mutateAsync({
        weekNumber: week.number,
        expectedRevision: detail.revision,
      });
      toast(`Evidence submitted. Week ${week.number} is Done, not yet verified.`);
    } catch (err) {
      toast(
        err instanceof ApiRequestError ? err.message : "Could not submit evidence",
        { tone: "warn" },
      );
    }
  };

  const gateForm = (
    <>
      <div className="flex items-baseline justify-between">
        <h2 className="serif text-2xl">
          {gatesPass ? "New attempt" : "Four gates"}
        </h2>
        <span className="text-xs muted">Each needs 3 or more. No averaging.</span>
      </div>
      <p className="text-sm muted mt-1">
        Score honestly after the unseen task. A new attempt never erases earlier
        ones.
      </p>
      <div className="mt-5 divide-y line border-y line">
        {GATES_UI.map((g) => (
          <div
            key={g.key}
            className="py-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{g.label}</div>
              <div className="text-xs muted mt-0.5">{g.description}</div>
              <div
                className={`text-xs mt-1 ${
                  draft[g.key] >= 3
                    ? "forest"
                    : draft[g.key] > 0
                      ? "amber"
                      : "muted"
                }`}
                aria-live="polite"
              >
                {SCORE_MEANING[draft[g.key]]}
              </div>
            </div>
            <GateSeg
              value={draft[g.key]}
              locked={locked}
              label={g.label}
              onChange={(v) => setDraft((d) => ({ ...d, [g.key]: v }))}
            />
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div>
          <label className="text-xs muted" htmlFor="as">
            Assistance during the attempt
          </label>
          <Select
            id="as"
            label="Assistance during the attempt"
            className="inp mt-1.5"
            disabled={locked}
            value={draft.assist}
            onValueChange={(assist) =>
              setDraft((d) => ({
                ...d,
                assist: assist as GateDraft["assist"],
              }))
            }
            options={[
              { value: "independent", label: "independent" },
              { value: "docs-only", label: "docs-only" },
              { value: "assisted", label: "assisted" },
            ]}
          />
        </div>
        <div>
          <label className="text-xs muted" htmlFor="an">
            What failed or surprised you
          </label>
          <Input
            id="an"
            className="mt-1.5"
            disabled={locked}
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm mt-3">
        <input
          type="checkbox"
          disabled={locked}
          checked={draft.coreAiAuthored}
          onChange={(e) =>
            setDraft((d) => ({ ...d, coreAiAuthored: e.target.checked }))
          }
        />
        Core solution was AI-authored (cannot support Build ≥3)
      </label>
      <div className="flex items-center gap-3 mt-4">
        <Button disabled={locked || createAttempt.isPending} onClick={() => void saveAttempt()}>
          <Icon name="save" />
          Record attempt {detail.attempts.length + 1}
        </Button>
        {GATES_UI.some((g) => draft[g.key] > 0 && draft[g.key] < 3) ? (
          <span className="text-xs amber">
            Gates under 3 will open a gap and a new unseen retry.
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      {openGaps.length ? (
        <div
          className="rounded-xl bg-rose p-4 mb-8 text-sm"
          style={{ color: "var(--ink)" }}
        >
          <div className="font-medium flex items-center gap-2">
            <span className="rose">
              <Icon name="circle-alert" />
            </span>
            {openGaps.length} open gap{openGaps.length > 1 ? "s" : ""}: practise,
            then retry on a new unseen task
          </div>
          <ul className="mt-2 space-y-1.5 ink2">
            {openGaps.map((g) => (
              <li key={g.id}>
                {g.title}.{" "}
                <span className="muted">Retry: {g.retryTask}.</span>
              </li>
            ))}
          </ul>
          <p className="text-xs muted mt-2">
            Your active week stays Week {week.number}. No penalty, no retry
            limit.
          </p>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[1fr_19rem] gap-10">
        <div className="space-y-10 min-w-0">
          {gatesPass && latest ? (
            <section>
              <h2 className="serif text-2xl">Four gates</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {GATES_UI.map((g) => (
                  <div key={g.key} className="rounded-xl sage p-4">
                    <div className="text-xs opacity-80">{g.label}</div>
                    <div className="text-2xl font-semibold mt-1 tabular-nums">
                      {latest[g.key]}
                      <span className="text-sm font-normal opacity-70"> / 4</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm muted mt-3">
                Attempt {detail.attempts.length} on {fmtDate(latest.createdAt)}{" "}
                passes every gate. {latest.assistanceLevel || "independent"}.
              </p>
            </section>
          ) : null}

          {gatesPass ? (
            <details
              id="verify-gates"
              ref={gatesRef as RefObject<HTMLDetailsElement>}
            >
              <summary className="text-sm forest flex items-center gap-1.5 cursor-pointer">
                <Icon name="plus" />
                Record another attempt
              </summary>
              <div className="mt-4">{gateForm}</div>
            </details>
          ) : (
            <section
              id="verify-gates"
              ref={gatesRef as RefObject<HTMLElement>}
            >
              {gateForm}
            </section>
          )}

          {detail.attempts.length ? (
            <Section title="Attempt history">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs muted text-left">
                      <th className="font-normal pb-2">#</th>
                      <th className="font-normal pb-2">Date</th>
                      {GATES_UI.map((g) => (
                        <th
                          key={g.key}
                          className="font-normal pb-2 text-center"
                        >
                          {g.label}
                        </th>
                      ))}
                      <th className="font-normal pb-2">Help</th>
                      <th className="font-normal pb-2">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.attempts.map((x, i) => (
                      <tr key={x.id} className="border-t line">
                        <td className="py-2.5 muted">{i + 1}</td>
                        <td>{fmtDate(x.createdAt)}</td>
                        {GATES_UI.map((g) => (
                          <td
                            key={g.key}
                            className={`text-center tabular-nums ${
                              x[g.key] < 3 ? "amber font-semibold" : ""
                            }`}
                          >
                            {x[g.key]}
                          </td>
                        ))}
                        <td className="muted">
                          {x.assistanceLevel || "—"}
                        </td>
                        <td>
                          {x.passed ? (
                            <Chip tone="v">Pass</Chip>
                          ) : (
                            <Chip tone="g">Gap</Chip>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          ) : null}

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="serif text-2xl">Evidence</h2>
              <span className="text-xs muted">
                {filledCount.n} of {filledCount.total}
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {EVIDENCE_UI.map((field) => (
                <EvidenceField
                  key={field.key}
                  field={field}
                  draft={evidenceDraft}
                  disabled={evidenceDisabled}
                  onChange={(partial) => void persistEvidence(partial)}
                />
              ))}
              {week.isBoundedCore ? (
                <div>
                  <label
                    className="text-sm font-medium flex items-center gap-2"
                    htmlFor="ev-mtp"
                  >
                    <Icon name="flag" className="muted" />
                    Bounded-core / minimum-to-pass evidence
                    {evidenceDraft.boundedCoreEvidence.trim() ? (
                      <Icon name="check" className="forest ml-auto" />
                    ) : null}
                  </label>
                  {week.minimumToPass ? (
                    <p className="text-xs muted mt-1">{week.minimumToPass}</p>
                  ) : null}
                  <Textarea
                    id="ev-mtp"
                    rows={2}
                    className="mt-1.5"
                    disabled={evidenceDisabled}
                    value={evidenceDraft.boundedCoreEvidence}
                    onChange={(e) =>
                      void persistEvidence({
                        boundedCoreEvidence: e.target.value,
                      })
                    }
                    placeholder="How you met the minimum-to-pass clause"
                  />
                </div>
              ) : null}
              {week.number === 76 || week.number === 83 || week.number === 84 ? (
                <div>
                  <label
                    className="text-sm font-medium flex items-center gap-2"
                    htmlFor="ev-hw"
                  >
                    <Icon name="cpu" className="muted" />
                    Hardware / GPU evidence
                    {evidenceDraft.hardwareEvidence.trim() ? (
                      <Icon name="check" className="forest ml-auto" />
                    ) : null}
                  </label>
                  <p className="text-xs muted mt-1">
                    {week.number === 76
                      ? "Week 76 measured GPU work requires hardware evidence; simulation alternatives are not accepted here."
                      : "Weeks 83–84 may use modeled/referenced evidence when clearly labeled with limitations."}
                  </p>
                  <Textarea
                    id="ev-hw"
                    rows={2}
                    className="mt-1.5"
                    disabled={evidenceDisabled}
                    value={evidenceDraft.hardwareEvidence}
                    onChange={(e) =>
                      void persistEvidence({
                        hardwareEvidence: e.target.value,
                      })
                    }
                    placeholder="Measured GPU evidence or labeled modeled/referenced alternative"
                  />
                </div>
              ) : null}
            </div>
            {detail.status === "DONE" ? (
              <div className="mt-4 flex items-center gap-3 text-sm">
                <Chip tone="d">
                  <Icon name="circle-check" className="!w-3 !h-3" />
                  Submitted {fmtDate(detail.submittedAt)}
                </Chip>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void reopenEvidence
                      .mutateAsync({
                        weekNumber: week.number,
                        expectedRevision: detail.revision,
                      })
                      .then(() => toast("Evidence reopened for editing"))
                      .catch((err: unknown) =>
                        toast(
                          err instanceof ApiRequestError
                            ? err.message
                            : "Could not reopen",
                          { tone: "warn" },
                        ),
                      )
                  }
                >
                  Edit evidence
                </Button>
              </div>
            ) : (
              <Button
                className="mt-4"
                disabled={locked || submitEvidence.isPending}
                onClick={() => void trySubmit()}
              >
                <Icon name="send" />
                Submit evidence
              </Button>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 self-start space-y-4">
          <div
            className={`rounded-xl ${detail.eligibility.canVerify ? "sage" : "sunk"} p-5`}
          >
            <div className="text-sm font-medium flex items-center gap-2">
              <Icon
                name={
                  detail.eligibility.canVerify ? "badge-check" : "list-checks"
                }
              />
              {detail.eligibility.canVerify
                ? "Eligible for verification"
                : "Before you can verify"}
            </div>
            {detail.eligibility.canVerify ? (
              <>
                <p className="text-sm mt-2 leading-relaxed">
                  Passing scores do not verify a week on their own. Read your
                  evidence once more, then decide.
                </p>
                <p className="text-xs mt-3 opacity-80">
                  Use the Verify button in the bar below.
                </p>
              </>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {detail.eligibility.issues.map((r) => (
                  <li key={`${r.code}-${r.message}`} className="flex gap-2 ink2">
                    <Icon
                      name="circle"
                      className="!w-3 !h-3 mt-1 shrink-0 muted"
                    />
                    {r.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs muted leading-relaxed px-1">
            Done means work and evidence are submitted. Verified means you
            reviewed passing evidence and approved it. Only Verified unlocks Week{" "}
            {week.number + 1 > 91 ? "completion" : week.number + 1}.
          </p>
        </aside>
      </div>
    </>
  );
}

function EvidenceField({
  field,
  draft,
  disabled,
  onChange,
}: {
  field: (typeof EVIDENCE_UI)[number];
  draft: Record<string, string | boolean>;
  disabled: boolean;
  onChange: (partial: Record<string, string | boolean>) => void;
}) {
  if (field.key === "tests") {
    const filled = Boolean(draft.testOutcome);
    return (
      <div>
        <label className="text-sm font-medium flex items-center gap-2" htmlFor="ev-tests">
          <Icon name={field.icon} className="muted" />
          {field.label}
          {filled ? <Icon name="check" className="forest ml-auto" /> : null}
        </label>
        <Select
          id="ev-tests"
          label="Test outcome"
          className="inp mt-1.5"
          disabled={disabled}
          value={String(draft.testOutcome || "")}
          onValueChange={(testOutcome) => onChange({ testOutcome })}
          options={[
            { value: "", label: "Select outcome…" },
            { value: "pass", label: "pass" },
            { value: "fail", label: "fail" },
            { value: "not_applicable", label: "not_applicable" },
          ]}
        />
        <Textarea
          className="mt-2"
          rows={2}
          disabled={disabled}
          placeholder={field.placeholder}
          value={String(draft.testOutputs || "")}
          onChange={(e) => onChange({ testOutputs: e.target.value })}
        />
      </div>
    );
  }

  if (field.key === "transfer") {
    const filled =
      Boolean(String(draft.transferCondition || "").trim()) &&
      Boolean(String(draft.transferResult || "").trim());
    return (
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Icon name={field.icon} className="muted" />
          {field.label}
          {filled ? <Icon name="check" className="forest ml-auto" /> : null}
        </label>
        <Input
          className="mt-1.5"
          disabled={disabled}
          placeholder="Transfer condition"
          value={String(draft.transferCondition || "")}
          onChange={(e) => onChange({ transferCondition: e.target.value })}
        />
        <Input
          className="mt-2"
          disabled={disabled}
          placeholder="Transfer result"
          value={String(draft.transferResult || "")}
          onChange={(e) => onChange({ transferResult: e.target.value })}
        />
      </div>
    );
  }

  if (field.key === "measurement") {
    const filled =
      Boolean(draft.measurementNa) ||
      Boolean(String(draft.measurementContext || "").trim());
    return (
      <div>
        <label
          className="text-sm font-medium flex items-center gap-2"
          htmlFor="ev-measurement"
        >
          <Icon name={field.icon} className="muted" />
          {field.label}
          {filled ? <Icon name="check" className="forest ml-auto" /> : null}
        </label>
        <Textarea
          id="ev-measurement"
          rows={field.rows ?? 1}
          className="mt-1.5"
          disabled={disabled || Boolean(draft.measurementNa)}
          placeholder={field.placeholder}
          value={String(draft.measurementContext || "")}
          onChange={(e) => onChange({ measurementContext: e.target.value })}
        />
        <label className="flex items-center gap-2 text-xs muted mt-2">
          <input
            type="checkbox"
            disabled={disabled}
            checked={Boolean(draft.measurementNa)}
            onChange={(e) => onChange({ measurementNa: e.target.checked })}
          />
          Justified N/A
        </label>
      </div>
    );
  }

  if (field.key === "helpUsed") {
    const filled = Boolean(String(draft.helpUsed || "").trim());
    return (
      <div>
        <label
          className="text-sm font-medium flex items-center gap-2"
          htmlFor="ev-help"
        >
          <Icon name={field.icon} className="muted" />
          {field.label}
          {filled ? <Icon name="check" className="forest ml-auto" /> : null}
        </label>
        <Textarea
          id="ev-help"
          rows={1}
          className="mt-1.5"
          disabled={disabled}
          placeholder={field.placeholder}
          value={String(draft.helpUsed || "")}
          onChange={(e) => onChange({ helpUsed: e.target.value })}
        />
        <label className="flex items-center gap-2 text-xs muted mt-2">
          <input
            type="checkbox"
            disabled={disabled}
            checked={Boolean(draft.coreAiAuthored)}
            onChange={(e) => onChange({ coreAiAuthored: e.target.checked })}
          />
          Core solution was AI-authored
        </label>
      </div>
    );
  }

  const valueKey =
    field.key === "artifactRef"
      ? "artifactRef"
      : field.key === "reproducibleSteps"
        ? "reproducibleSteps"
        : field.key === "failureRootCause"
          ? "failureRootCause"
          : field.key === "explanation"
            ? "explanation"
            : field.key === "limitation"
              ? "limitation"
              : "externalReviewStatus";
  const filled = Boolean(String(draft[valueKey] || "").trim());

  return (
    <div>
      <label
        className="text-sm font-medium flex items-center gap-2"
        htmlFor={`ev-${field.key}`}
      >
        <Icon name={field.icon} className="muted" />
        {field.label}
        {filled ? <Icon name="check" className="forest ml-auto" /> : null}
      </label>
      <Textarea
        id={`ev-${field.key}`}
        rows={field.rows ?? 1}
        className="mt-1.5"
        disabled={disabled}
        placeholder={field.placeholder}
        value={String(draft[valueKey] || "")}
        onChange={(e) => onChange({ [valueKey]: e.target.value })}
      />
    </div>
  );
}

function VerifiedSummary({
  week,
  detail,
}: {
  week: CurriculumWeek;
  detail: WeekDetailResponse;
}) {
  const latest = detail.latestAttempt;
  return (
    <div className="max-w-3xl space-y-8">
      <div className="rounded-xl sage p-5 flex items-center gap-4">
        <Icon name="badge-check" className="!w-6 !h-6" />
        <div>
          <div className="font-medium">
            Verified by you on {fmtDateYear(detail.verifiedAt)}
          </div>
          <div className="text-sm opacity-80">
            {detail.attempts.length} attempt
            {detail.attempts.length !== 1 ? "s" : ""}
            {latest
              ? ` · final scores ${GATES_UI.map((g) => `${g.label} ${latest[g.key]}`).join(", ")}`
              : ""}
          </div>
        </div>
      </div>
      <Section title="Retention reviews">
        <ul className="grid sm:grid-cols-4 gap-2">
          {detail.reviews.map((r) => {
            const offWeeks = r.offsetWeeks ?? r.reviewOffset / 7;
            const due = Date.parse(r.dueAt) <= Date.parse(detail.asOf) && !r.completedAt;
            const tone =
              r.passed === true
                ? "forest"
                : r.passed === false
                  ? "rose"
                  : due
                    ? "amber"
                    : "muted";
            return (
              <li key={r.reviewOffset} className="rounded-lg border line p-3 text-sm">
                <div className="text-xs muted">+{offWeeks} weeks</div>
                <div className="mt-0.5">{fmtDate(r.dueAt)}</div>
                <div className={`text-xs mt-1 ${tone}`}>
                  {r.passed === true
                    ? "Recalled"
                    : r.passed === false
                      ? "Gap added"
                      : due
                        ? "Due now"
                        : "Scheduled"}
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section title="Evidence on record">
        <dl className="divide-y line border-y line text-sm">
          <div className="py-2.5 grid sm:grid-cols-[12rem_1fr] gap-1">
            <dt className="muted">Artifact</dt>
            <dd className="break-words">{detail.evidence?.artifactRef || "—"}</dd>
          </div>
          <div className="py-2.5 grid sm:grid-cols-[12rem_1fr] gap-1">
            <dt className="muted">Explanation</dt>
            <dd className="break-words">{detail.evidence?.explanation || "—"}</dd>
          </div>
          <div className="py-2.5 grid sm:grid-cols-[12rem_1fr] gap-1">
            <dt className="muted">Limitation</dt>
            <dd className="break-words">{detail.evidence?.limitation || "—"}</dd>
          </div>
        </dl>
      </Section>
      <Section title="Attempt history">
        <ul className="text-sm space-y-1">
          {detail.attempts.map((x, i) => (
            <li key={x.id} className="flex gap-3">
              <span className="muted w-16">
                #{i + 1} {fmtDate(x.createdAt)}
              </span>
              <span className="tabular-nums">
                {GATES_UI.map((g) => `${g.label[0]} ${x[g.key]}`).join(" · ")}
              </span>
              {!x.passed ? <Chip tone="g">Gap</Chip> : null}
            </li>
          ))}
        </ul>
      </Section>
      {week.minimumToPass ? (
        <Section title="Bounded-core clause">
          <p className="text-sm ink2">{week.minimumToPass}</p>
        </Section>
      ) : null}
    </div>
  );
}
