import { Priority } from "@prisma/client";

/**
 * STRONG urgency / blocker signals
 * These are business-critical
 */
const HIGH_URGENCY_KEYWORDS = [
  "money not received",
  "loan disbursement",
  "disbursement failed",
  "payment failed",
  "loan rejected",
  "account blocked",
  "blocked",
];

/**
 * Actionable intent (status / process)
 * These are not urgent but need attention
 */
const MEDIUM_INTENT_KEYWORDS = [
  "status",
  "update",
  "applied",
  "application",
  "review",
  "processing",
  "approval",
  "approved",
  "disbursement date",
  "when will",
  "how long",
];

/**
 * Friction / dissatisfaction signals
 */
const FRUSTRATION_KEYWORDS = [
  "still",
  "again",
  "not satisfied",
  "no response",
  "waiting",
  "delay",
  "why",
];

export function evaluatePriority(content: string): {
  priority: Priority;
  score: number; // 1–10
  reason: string;
} {
  const text = content.toLowerCase();

  let score = 1; // base score
  const reasons: string[] = [];

  // Strong urgency / blockers (2–3 points each)
  for (const keyword of HIGH_URGENCY_KEYWORDS) {
    if (text.includes(keyword)) {
      score += 3;
      reasons.push(`Blocker detected: "${keyword}"`);
    }
  }

  // Explicit urgency words
  if (text.includes("urgent") || text.includes("asap")) {
    score += 3;
    reasons.push("Explicit urgency requested");
  }

  // Actionable intent (1–2 points)
  for (const keyword of MEDIUM_INTENT_KEYWORDS) {
    if (text.includes(keyword)) {
      score += 2;
      reasons.push(`Status / intent detected: "${keyword}"`);
      break; // avoid stacking too much
    }
  }

  // Frustration / repeated follow-ups (1 point)
  for (const keyword of FRUSTRATION_KEYWORDS) {
    if (text.includes(keyword)) {
      score += 1;
      reasons.push(`Friction signal detected: "${keyword}"`);
      break;
    }
  }

  // Direct question (usually needs reply)
  if (text.includes("?")) {
    score += 1;
    reasons.push("Direct question asked");
  }

  // Cap score between 1 and 10
  score = Math.min(score, 10);

  // Final priority mapping
  let priority: Priority = Priority.LOW;

  if (score >= 8) {
    priority = Priority.HIGH;
  } else if (score >= 4) {
    priority = Priority.MEDIUM;
  }

  return {
    priority,
    score,
    reason: reasons.join("; "),
  };
}
