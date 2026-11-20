"use client";

import { Tabs } from "@base-ui/react/tabs";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Download,
  FileCheck2,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { GrowthPlanCard } from "@/components/career/growth-plan-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  buildCareerGrounding,
  canCompleteAction,
  matchEvidence,
  type CareerState,
  type Evidence,
  type Memory,
  type MatchRow,
} from "@/lib/career/domain";
import type { CareerReview } from "@/lib/career/codex";

type WorkspaceData = CareerState & { codexAvailable: boolean };
type Save = (url: string, body: unknown, method?: string) => Promise<boolean>;
const tabs = ["overview", "evidence", "map", "memory", "growth"] as const;
type Tab = (typeof tabs)[number];
const categories = {
  profile: "职业背景",
  goal: "求职目标",
  preference: "工作偏好",
  constraint: "现实约束",
  feedback: "复盘反馈",
};
const sources = {
  self_report: "本人自述",
  artifact: "作品 / 项目材料",
  interview: "面试记录",
};
const fieldClass =
  "w-full min-h-[44px] rounded-lg border border-input bg-surface px-3 py-2 text-ui-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const buttonClass = buttonVariants();
const quietButton = buttonVariants({ variant: "outline" });

async function requestJson(url: string, body?: unknown, method = "GET") {
  const response = await fetch(url, {
    method,
    cache: "no-store",
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "请求未完成，请重试。");
  return result;
}

export function CareerWorkspace() {
  const t = useTranslations("app");
  const workspaceT = useTranslations("app.careerWorkspace");
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [requirements, setRequirements] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [editingMemory, setEditingMemory] = useState<Memory | undefined>();
  const [editingEvidence, setEditingEvidence] = useState<
    Evidence | undefined
  >();
  const [review, setReview] = useState<CareerReview | null>(null);
  const refresh = useCallback(
    async () => setData(await requestJson("/api/career")),
    [],
  );

  useEffect(() => {
    let active = true;
    requestJson("/api/career")
      .then((value) => {
        if (active) setData(value);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const match = useMemo(
    () =>
      data && requiredSkills.length
        ? matchEvidence(requiredSkills, data.evidence)
        : null,
    [data, requiredSkills],
  );
  const save: Save = async (url, body, method = "POST") => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await requestJson(url, body, method);
      setReview(null);
      await refresh();
      setMessage("已保存。");
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "操作未完成。");
      return false;
    } finally {
      setBusy(false);
    }
  };

  async function remove(
    kind: "memories" | "evidence",
    item: Memory | Evidence,
  ) {
    if (
      !window.confirm(
        `从${kind === "memories" ? "职业记忆库" : "能力证据库"}删除“${"key" in item ? item.key : item.title}”？`,
      )
    )
      return;
    if (
      await save(
        `/api/career/${kind}/${item.id}`,
        { revision: item.revision },
        "DELETE",
      )
    ) {
      setEditingMemory(undefined);
      setEditingEvidence(undefined);
    }
  }

  async function runReview() {
    setReviewBusy(true);
    setReview(null);
    setError("");
    setMessage("");
    try {
      setReview(
        (await requestJson("/api/career/review", { requiredSkills }, "POST"))
          .review,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "复盘未完成。");
    } finally {
      setReviewBusy(false);
    }
  }

  function exportProfile() {
    if (!data) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            format: "tracefolio-career-v1",
            exportedAt: new Date().toISOString(),
            memories: data.memories,
            evidence: data.evidence,
            actions: data.actions,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tracefolio-career-profile.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function addGap(row: MatchRow) {
    return save("/api/career/growth", {
      skill: row.skill,
      title: `补齐 ${row.skill} 的能力证据`,
      evidenceTarget: row.nextAction,
    });
  }

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(value) => {
        setTab(value as Tab);
        setError("");
        setMessage("");
      }}
      className="workspace-stack"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-ui-block gap-y-ui-control">
        <Tabs.List aria-label={t("nav.intelligence")} className="flex min-w-0 flex-wrap gap-1">
          {tabs.map((key) => (
            <Tabs.Tab
              key={key}
              value={key}
              className="min-h-[44px] rounded-lg px-3 text-ui-meta font-medium text-muted-foreground transition-colors duration-150 hover:bg-surface-low hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-active:bg-brand-muted data-active:font-semibold data-active:text-brand motion-reduce:transition-none sm:px-4 sm:text-ui-body"
            >
              {workspaceT(key)}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {tab === "memory" ? (
          <Button variant="ghost" disabled={!data} onClick={exportProfile}>
            <Download aria-hidden />
            {workspaceT("export")}
          </Button>
        ) : null}
      </div>
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-destructive-soft px-4 py-3 text-ui-body text-destructive"
        >
          {error}
          {!data && (
            <button
              className={quietButton}
              onClick={() =>
                refresh()
                  .then(() => setError(""))
                  .catch((cause) => setError(cause.message))
              }
            >
              重试加载
            </button>
          )}
        </div>
      )}
      {message && (
        <p
          role="status"
          className="rounded-lg bg-success-soft px-4 py-3 text-ui-body text-success"
        >
          {message}
        </p>
      )}
      {!data ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" />
          {workspaceT("loading")}
        </div>
      ) : (
        <>
          <Tabs.Panel value="overview">
            <CareerOverview
              data={data}
              onOpenEvidence={(item) => {
                setEditingEvidence(item);
                setTab("evidence");
              }}
              onNavigate={setTab}
            />
          </Tabs.Panel>

          <Tabs.Panel value="map" className="max-w-[720px] space-y-ui-section">
              <Panel title={workspaceT("compareRole")}>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      setReview(null);
                      const skills = [
                        ...new Set(
                          requirements
                            .split(/[,，、;；\n]+/)
                            .map((item) => item.trim())
                            .filter(Boolean),
                        ),
                      ];
                      if (
                        !skills.length ||
                        skills.length > 30 ||
                        skills.some((skill) => skill.length > 80)
                      ) {
                        setError(
                          "请填写 1–30 项技能，每项不超过 80 个字符。需要时请分批分析。",
                        );
                        return;
                      }
                      setError("");
                      setRequiredSkills(skills);
                    }}
                    className="space-y-3"
                  >
                    <Field label="岗位必需技能（用逗号分隔）">
                      <Textarea
                        required
                        maxLength={2400}
                        className={fieldClass}
                        rows={3}
                        placeholder="例如：Python, RAG, FastAPI, PostgreSQL"
                        value={requirements}
                        onChange={(event) =>
                          setRequirements(event.target.value)
                        }
                      />
                    </Field>
                    <button className={buttonClass} type="submit">
                      分析证据覆盖
                      <ArrowRight size={15} />
                    </button>
                  </form>
                  {match && (
                    <div className="mt-5 space-y-4" aria-live="polite">
                      <div className="flex flex-wrap gap-4 rounded-xl bg-brand-muted p-4">
                        <div>
                          <strong className="text-2xl text-brand-foreground">
                            {match.coveragePercent}%
                          </strong>
                          <p className="mt-1 text-xs text-muted-foreground">
                            有已确认材料的技能标签
                          </p>
                        </div>
                        <div className="border-l border-hero-border pl-4">
                          <strong className="text-2xl text-brand-foreground">
                            {match.artifactCoveragePercent}%
                          </strong>
                          <p className="mt-1 text-xs text-muted-foreground">
                            有作品或面试材料的标签
                          </p>
                        </div>
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        覆盖率按技能标签计算。材料由本人确认，未经独立核验。
                      </p>
                      {match.rows.map((row) => (
                        <div
                          key={row.skill}
                          className="rounded-xl border border-line p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <strong className="text-sm">{row.skill}</strong>
                            <Badge variant={row.support === "artifact" ? "success" : row.support === "self_report" ? "material" : "warning"}>
                              {row.support === "artifact"
                                ? "有作品 / 面试材料"
                                : row.support === "self_report"
                                  ? "目前只有自述"
                                  : "待补充证据"}
                            </Badge>
                          </div>
                          {row.evidenceIds.map((id) => {
                            const item = data.evidence.find(
                              (candidate) => candidate.id === id,
                            );
                            return (
                              item && (
                                <button
                                  key={id}
                                  onClick={() => {
                                    setEditingEvidence(item);
                                    setTab("evidence");
                                  }}
                                  className="mt-2 block text-left text-xs leading-5 text-brand underline underline-offset-4"
                                >
                                  {item.title}
                                </button>
                              )
                            );
                          })}
                          {row.support !== "artifact" && (
                            <>
                              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                                {row.nextAction}
                              </p>
                              <button
                                className={`${quietButton} mt-2`}
                                disabled={busy || reviewBusy}
                                onClick={() => addGap(row)}
                              >
                                <Plus size={14} />
                                加入成长计划
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      <button
                        className={quietButton}
                        disabled={
                          !data.codexAvailable ||
                          !data.evidence.some(
                            (item) =>
                              item.status === "accepted" && item.useInAI,
                          ) ||
                          busy ||
                          reviewBusy
                        }
                        onClick={runReview}
                      >
                        {reviewBusy ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Sparkles size={15} />
                        )}
                        用 Codex 复盘
                      </button>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {data.codexAvailable
                          ? "复盘会将你允许用于 AI 的记忆和证据发送至所配置的模型服务。"
                          : "配置 Codex 后可复盘。"}
                      </p>
                    </div>
                  )}
                </Panel>
              <details className="rounded-lg border border-line bg-surface px-4 py-3">
                <summary className="cursor-pointer text-ui-body font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{workspaceT("inspectAiMaterials")}</summary>
                <pre className="mt-3 whitespace-pre-wrap break-words text-ui-meta text-muted-foreground">{buildCareerGrounding(data, requiredSkills.join(" ")) || workspaceT("noAiMaterials")}</pre>
              </details>
              {review && (
                <Panel
                  title="Codex 证据复盘"
                  description="AI 建议"
                >
                  <p className="text-sm leading-7">{review.summary}</p>
                  <div className="mt-4 space-y-3">
                    {review.findings.map((item, index) => (
                      <div
                        className="rounded-xl border border-line p-4"
                        key={index}
                      >
                        <Badge>
                          {item.basis === "artifact"
                            ? "作品 / 面试材料"
                            : "用户自述"}
                        </Badge>
                        <p className="mt-2 text-sm leading-7">{item.claim}</p>
                        {item.evidenceIds.map((id) => {
                          const source = data.evidence.find(
                            (candidate) => `evidence:${candidate.id}` === id,
                          );
                          return (
                            source && (
                              <p
                                key={id}
                                className="mt-1 text-xs text-muted-foreground"
                              >
                                依据：{source.title} · {source.sourceRef}
                              </p>
                            )
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <h3 className="mt-ui-block text-ui-label font-semibold">
                    项目深挖与待澄清问题
                  </h3>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
                    {review.questions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <h3 className="mt-ui-block text-ui-label font-semibold">建议下一步</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
                    {review.nextSteps.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </Panel>
              )}
          </Tabs.Panel>

          <Tabs.Panel value="memory" keepMounted>
            <div className="workspace-grid items-start">
              <Panel
                className="workspace-span-6"
                title={editingMemory ? "修正职业记忆" : "新增职业记忆"}
              >
                <MemoryForm
                  key={editingMemory?.id ?? "new"}
                  item={editingMemory}
                  save={save}
                  busy={busy || reviewBusy}
                  done={() => setEditingMemory(undefined)}
                />
              </Panel>
              <div className={cn("workspace-span-6", data.memories.length > 0 && "divide-y divide-line rounded-xl border border-line bg-surface")}>
                {data.memories.length === 0 && (
                  <Empty title="暂无职业记忆" />
                )}
                {data.memories.map((item) => (
                  <article
                    key={item.id}
                    className="min-w-0 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{categories[item.category]}</Badge>
                      <Badge variant={item.confirmed ? "success" : "warning"}>{item.confirmed ? "本人已确认" : "待确认"}</Badge>
                      {item.expiresAt &&
                        new Date(item.expiresAt) <= new Date() && (
                          <Badge variant="secondary">已过期</Badge>
                        )}
                    </div>
                    <h3 className="mt-3 font-semibold">{item.key}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                      {item.content}
                    </p>
                    <p className="mt-3 break-words text-xs text-muted-foreground">
                      来源：{item.source} ·{" "}
                      {item.useInAI ? "允许用于 AI" : "仅本机保存"}
                      {item.expiresAt
                        ? ` · 有效至 ${new Date(item.expiresAt).toLocaleDateString("zh-CN")}`
                        : ""}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        disabled={busy || reviewBusy}
                        className={quietButton}
                        onClick={() => setEditingMemory(item)}
                      >
                        编辑
                      </button>
                      <button
                        aria-label={`删除记忆 ${item.key}`}
                        disabled={busy || reviewBusy}
                        className={quietButton}
                        onClick={() => remove("memories", item)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="evidence" keepMounted>
            <div className="workspace-grid items-start">
              <Panel
                className="workspace-span-6"
                title={editingEvidence ? "复核能力证据" : "新增能力证据"}
                description="链接仅用于标记来源。"
              >
                <EvidenceForm
                  key={editingEvidence?.id ?? "new"}
                  item={editingEvidence}
                  save={save}
                  busy={busy || reviewBusy}
                  done={() => setEditingEvidence(undefined)}
                />
              </Panel>
              <div className={cn("workspace-span-6", data.evidence.length > 0 && "divide-y divide-line rounded-xl border border-line bg-surface")}>
                {data.evidence.length === 0 && (
                  <Empty title="暂无能力证据" />
                )}
                {data.evidence.map((item) => (
                  <article
                    key={item.id}
                    className="min-w-0 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="material">{sources[item.sourceType]}</Badge>
                      <Badge variant={item.status === "accepted" ? "success" : item.status === "rejected" ? "secondary" : "warning"}>
                        {item.status === "accepted"
                          ? "本人已确认"
                          : item.status === "rejected"
                            ? "已排除"
                            : "待确认"}
                      </Badge>
                    </div>
                    <h3 className="mt-3 font-semibold">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                      {item.contribution}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.skills.map((skill) => (
                        <Badge variant="secondary" key={skill}>{skill}</Badge>
                      ))}
                    </div>
                    <p className="mt-3 break-all text-xs leading-6 text-muted-foreground">
                      来源：{item.sourceRef}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.useInAI ? "允许用于 AI" : "仅本机保存"} ·
                      未经独立核验
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        disabled={busy || reviewBusy}
                        className={quietButton}
                        onClick={() => setEditingEvidence(item)}
                      >
                        查看 / 编辑
                      </button>
                      <button
                        aria-label={`删除证据 ${item.title}`}
                        disabled={busy || reviewBusy}
                        className={quietButton}
                        onClick={() => remove("evidence", item)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="growth" className="max-w-[720px]">
            <div className="grid gap-ui-block">
              {data.actions.length === 0 && (
                <Empty title="暂无成长任务">
                  <Button variant="outline" onClick={() => setTab("map")}>{workspaceT("compareRole")}</Button>
                </Empty>
              )}
              {data.actions.map((action) => (
                <GrowthPlanCard
                  key={action.id}
                  action={action}
                  candidates={data.evidence.filter((item) => canCompleteAction(action, item))}
                  completionEvidence={data.evidence.find((item) => item.id === action.completionEvidenceId)}
                  busy={busy || reviewBusy}
                  onAddEvidence={() => {
                    setEditingEvidence(undefined);
                    setTab("evidence");
                  }}
                  onSave={(completionEvidenceId) => save(`/api/career/growth/${action.id}`, { completionEvidenceId }, "PATCH")}
                />
              ))}
            </div>
          </Tabs.Panel>
        </>
      )}
    </Tabs.Root>
  );
}

function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-line bg-surface p-ui-block sm:p-ui-section", className)}>
      <h2 className="text-ui-section font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-ui-body text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-ui-block">{children}</div>
    </section>
  );
}
function CareerOverview({
  data,
  onOpenEvidence,
  onNavigate,
}: {
  data: WorkspaceData;
  onOpenEvidence: (item?: Evidence) => void;
  onNavigate: (tab: Tab) => void;
}) {
  const t = useTranslations("app.careerWorkspace");
  const pending = data.evidence.find((item) => item.status === "pending");
  const hasEvidence = data.evidence.some((item) => item.status !== "rejected");
  const activeActions = data.actions.filter((item) => item.status === "open");
  const activeAction = activeActions[0];
  const task = pending
    ? { title: pending.title, label: t("reviewEvidence"), run: () => onOpenEvidence(pending) }
    : !hasEvidence
      ? { title: t("firstEvidence"), label: t("openEvidence"), run: () => onOpenEvidence() }
      : activeAction
        ? { title: activeAction.title, label: t("growth"), run: () => onNavigate("growth") }
        : { title: t("compareRole"), label: t("map"), run: () => onNavigate("map") };
  const recent = data.evidence.slice(0, 3);
  const counts = [
    { tab: "evidence", value: data.evidence.length, label: t("evidenceCount", { count: data.evidence.length }) },
    { tab: "memory", value: data.memories.length, label: t("memoryCount", { count: data.memories.length }) },
    { tab: "growth", value: activeActions.length, label: t("growthCount", { count: activeActions.length }) },
  ] as const;

  return (
    <div className="workspace-stack max-w-[960px]">
      <section className="rounded-2xl bg-brand-muted p-6 sm:p-8">
        <p className="mb-2 text-ui-meta font-medium text-brand">{t("nextStep")}</p>
        <h2 className="max-w-[680px] text-ui-title font-semibold [overflow-wrap:anywhere] sm:text-ui-title-wide">{task.title}</h2>
        <Button type="button" className="mt-5" onClick={task.run}>{task.label}<ArrowRight aria-hidden /></Button>
      </section>
      {recent.length ? (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
            <h2 className="text-ui-section font-semibold">{t("recentEvidence")}</h2>
            <Button variant="ghost" onClick={() => onNavigate("evidence")}>{t("viewEvidence")}</Button>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {recent.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => onOpenEvidence(item)} className="flex min-h-[52px] w-full items-center gap-3 rounded-lg px-4 py-2 text-left hover:bg-brand-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                  <FileCheck2 aria-hidden className="size-4 shrink-0 text-brand" />
                  <span className="min-w-0 flex-1 truncate text-ui-body font-medium" title={item.title}>{item.title}</span>
                  <Badge variant={item.status === "accepted" ? "success" : item.status === "pending" ? "warning" : "secondary"}>{t(`evidenceStatus.${item.status}`)}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {counts.some((item) => item.value) ? (
        <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-2 text-ui-meta text-muted-foreground">
          {counts.filter((item) => item.value).map((item) => (
            <button key={item.tab} type="button" onClick={() => onNavigate(item.tab)} className="min-h-[44px] text-left hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-ring">{item.label}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-line px-4 py-5">
      <p className="text-ui-body text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-ui-meta font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
function Checkbox({
  name,
  children,
  checked,
}: {
  name: string;
  children: ReactNode;
  checked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 text-ui-meta text-muted-foreground">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="mt-1 size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      {children}
    </label>
  );
}

function MemoryForm({
  item,
  save,
  busy,
  done,
}: {
  item?: Memory;
  save: Save;
  busy: boolean;
  done: () => void;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const expires = String(fields.get("expiresAt") || "");
    const body = {
      key: fields.get("key"),
      category: fields.get("category"),
      content: fields.get("content"),
      source: fields.get("source"),
      confirmed: fields.has("confirmed"),
      useInAI: fields.has("useInAI"),
      expiresAt: expires
        ? new Date(expires + "T23:59:59+08:00").toISOString()
        : null,
      ...(item ? { revision: item.revision } : {}),
    };
    if (
      await save(
        `/api/career/memories${item ? `/${item.id}` : ""}`,
        body,
        item ? "PATCH" : "POST",
      )
    ) {
      form.reset();
      done();
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <Field label="记忆主题">
          <Input
            name="key"
            required
            maxLength={100}
            defaultValue={item?.key}
            placeholder="例如：目标岗位"
          />
        </Field>
        <Field label="分类">
          <select
            name="category"
            defaultValue={item?.category ?? "goal"}
            className={fieldClass}
          >
            {Object.entries(categories).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="内容">
          <Textarea
            name="content"
            required
            maxLength={4000}
            rows={4}
            defaultValue={item?.content}
            placeholder="用自己的话描述一个稳定、具体的事实或偏好。"
            className="field-sizing-fixed"
          />
        </Field>
        <Field label="来源说明">
          <Input
            name="source"
            required
            maxLength={500}
            defaultValue={item?.source ?? "本人填写"}
          />
        </Field>
        <Field label="有效期（可选，按北京时间）">
          <input
            type="date"
            name="expiresAt"
            defaultValue={
              item?.expiresAt
                ? new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Shanghai",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(new Date(item.expiresAt))
                : ""
            }
            className={fieldClass}
          />
        </Field>
        <Checkbox name="confirmed" checked={item?.confirmed}>
          我确认这条记忆准确，愿意在未来求职中继续使用。
        </Checkbox>
        <Checkbox name="useInAI" checked={item?.useInAI}>
          允许将这条记忆发送至我配置的模型服务，用于个性化分析。
        </Checkbox>
        <div className="flex gap-2">
          <button className={buttonClass}>
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            {item ? "保存修正" : "保存记忆"}
          </button>
          {item && (
            <button className={quietButton} type="button" onClick={done}>
              取消编辑
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

function EvidenceForm({
  item,
  save,
  busy,
  done,
}: {
  item?: Evidence;
  save: Save;
  busy: boolean;
  done: () => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) titleRef.current?.focus();
  }, [item]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const body = {
      title: fields.get("title"),
      sourceType: fields.get("sourceType"),
      sourceRef: fields.get("sourceRef"),
      excerpt: fields.get("excerpt"),
      contribution: fields.get("contribution"),
      skills: String(fields.get("skills"))
        .split(/[,，、;；\n]+/)
        .map((skill) => skill.trim())
        .filter(Boolean),
      status: fields.get("status"),
      useInAI: fields.has("useInAI"),
      ...(item ? { revision: item.revision } : {}),
    };
    if (
      await save(
        `/api/career/evidence${item ? `/${item.id}` : ""}`,
        body,
        item ? "PATCH" : "POST",
      )
    ) {
      form.reset();
      done();
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <Field label="证据标题">
          <Input
            ref={titleRef}
            name="title"
            className="scroll-mt-24"
            required
            maxLength={160}
            defaultValue={item?.title}
            placeholder="例如：知识库检索服务的后端实现"
          />
        </Field>
        <Field label="材料类型">
          <select
            name="sourceType"
            defaultValue={item?.sourceType ?? "self_report"}
            className={fieldClass}
          >
            {Object.entries(sources).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="链接或材料定位">
          <Input
            name="sourceRef"
            required
            maxLength={1000}
            defaultValue={item?.sourceRef}
            placeholder="例如：仓库链接、PR #12、方案文档第 3 页"
          />
        </Field>
        <Field label="原始材料摘录">
          <Textarea
            name="excerpt"
            required
            maxLength={6000}
            rows={4}
            defaultValue={item?.excerpt}
            placeholder="粘贴能够支持这项能力的原文，保留必要上下文。"
            className="field-sizing-fixed"
          />
        </Field>
        <Field label="我具体做了什么">
          <Textarea
            name="contribution"
            required
            maxLength={2000}
            rows={3}
            defaultValue={item?.contribution}
            placeholder="说明你负责的部分、做过的取舍和可核查的结果。"
            className="field-sizing-fixed"
          />
        </Field>
        <Field label="这份材料支持的技能（用逗号分隔）">
          <Input
            name="skills"
            required
            maxLength={2400}
            defaultValue={item?.skills.join(", ")}
            placeholder="例如：Python, RAG, FastAPI"
          />
        </Field>
        <Field label="复核状态">
          <select
            name="status"
            defaultValue={item?.status ?? "pending"}
            className={fieldClass}
          >
            <option value="pending">待我复核</option>
            <option value="accepted">我已核对材料与个人贡献</option>
            <option value="rejected">排除这份材料</option>
          </select>
        </Field>
        <Checkbox name="useInAI" checked={item?.useInAI}>
          允许将这份材料发送至我配置的模型服务，用于能力分析和面试准备。
        </Checkbox>
        <div className="flex gap-2">
          <button className={buttonClass}>
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            {item ? "保存复核" : "保存证据"}
          </button>
          {item && (
            <button className={quietButton} type="button" onClick={done}>
              取消编辑
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}
