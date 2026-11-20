import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const root = fileURLToPath(new URL("../", import.meta.url));
const databaseUrl = `file:${fileURLToPath(new URL("../prisma/ui-preview.db", import.meta.url))}`;
const migration = spawnSync(process.execPath, ["scripts/migrate.mjs"], {
  cwd: root,
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: "inherit",
});
if (migration.error) throw migration.error;
if (migration.status !== 0) process.exit(migration.status ?? 1);

const memories = [
  { id: "ui-preview-goal", key: "【演示】目标岗位", category: "goal", content: "林小满希望找一份面向公共服务的数据产品实习，兼顾数据分析与体验设计。", confirmed: true },
  { id: "ui-preview-preference", key: "【演示】工作偏好", category: "preference", content: "希望参与端到端的项目，定期和设计、工程伙伴一起做原型评审。", confirmed: false },
  { id: "ui-preview-constraint", key: "【演示】过期的到岗安排", category: "constraint", content: "暑期学期结束前每周可到岗三天。", confirmed: true, expiresAt: new Date("2020-01-01T00:00:00Z") },
];

const evidence = [
  { id: "ui-preview-transit", title: "【演示】公交到站情报板", sourceType: "artifact", excerpt: "使用虚构到站记录，计算早晚高峰的中位等待时间。", contribution: "用 Python 编写采样和聚合逻辑，输出时段对比图。", skills: ["python", "数据可视化"], status: "accepted" },
  { id: "ui-preview-long-read", title: "【演示】从一周借阅记录到可复现报告：校园图书馆高峰时段、热门主题与异常借阅分析面试记录", sourceType: "interview", excerpt: "讲解了虚构记录中的空日期处理、时段聚合以及重复事件去除。", contribution: "负责展示 Python 分析脚本，解释采样范围与限制。", skills: ["python", "数据分析"], status: "accepted" },
  { id: "ui-preview-garden", title: "【演示】社区花园志愿排班看板", sourceType: "artifact", excerpt: "为虚构活动制作可键盘操作的排班界面。", contribution: "用 React 和 TypeScript 实现编辑、筛选与撤销。", skills: ["react", "typescript", "无障碍"], status: "accepted" },
  { id: "ui-preview-draft", title: "【演示】周末步道路况图", sourceType: "artifact", excerpt: "有一份本地原型，尚待核对数据来源。", contribution: "整理虚构地理数据，制作图层切换原型。", skills: ["python", "地图可视化"], status: "pending" },
  { id: "ui-preview-report", title: "【演示】容器调度自评", sourceType: "self_report", excerpt: "阅读过调度相关资料，暂未提供可核对的项目。", contribution: "记录学过的命令和概念。", skills: ["kubernetes"], status: "accepted" },
  { id: "ui-preview-unverified", title: "【演示】版本来源缺失的性能对比截图", sourceType: "artifact", excerpt: "截图未说明运行版本和数据规模。", contribution: "尝试用 SQL 预聚合报表。", skills: ["sql"], status: "rejected" },
];

const actions = [
  { id: "ui-preview-python", skill: "python", title: "【演示】补齐 Python 的能力证据", evidenceTarget: "关联一个可复现的作品或面试记录，说明取样过程和验证结果。", updatedAt: new Date("2025-07-04T12:00:00Z") },
  { id: "ui-preview-accessibility", skill: "无障碍", title: "【演示】为排班看板补充键盘操作、焦点顺序与错误提示的可用性证据", evidenceTarget: "从添加班次到撤销操作，记录一次完整的键盘验证。", updatedAt: new Date("2025-07-03T12:00:00Z") },
  { id: "ui-preview-kubernetes", skill: "kubernetes", title: "【演示】记录一次容器部署", evidenceTarget: "补充部署过程、健康检查和一次回滚记录。", updatedAt: new Date("2025-07-02T12:00:00Z") },
  { id: "ui-preview-react", skill: "react", title: "【演示】完善志愿排班的交互记录", evidenceTarget: "保留筛选、编辑与撤销的实现说明。", status: "done", completionEvidenceId: "ui-preview-garden", updatedAt: new Date("2025-07-01T12:00:00Z") },
];

const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
try {
  await prisma.$transaction([
    ...memories.map((record) => prisma.careerMemory.upsert({
      where: { id: record.id },
      update: {},
      create: { ...record, source: "UI 演示数据", useInAI: false },
    })),
    ...evidence.map((record) => prisma.capabilityEvidence.upsert({
      where: { id: record.id },
      update: {},
      create: { ...record, sourceRef: "UI 演示数据", useInAI: false },
    })),
    ...actions.map((record) => prisma.growthAction.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    })),
  ]);
  console.log(`UI preview ready: ${memories.length} memories, ${evidence.length} evidence records, ${actions.length} growth actions.`);
} finally {
  await prisma.$disconnect();
}
