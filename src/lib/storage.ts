import {
  buildAssignment,
  buildClassCourse,
  buildMilestones,
  buildProfile,
  buildQuests,
  buildSkillTrees,
  calculateLevel,
  createBlankProfileDraft,
  createEmptyAppData,
  createId,
  getAvatarTheme,
  getRankTitle,
  subjectPaths,
  todayIso
} from "./game";
import type {
  AppData,
  Assignment,
  AssignmentStatus,
  AssignmentType,
  ClassCourse,
  ClassDraft,
  SessionState,
  StatBlock,
  StudentProfile,
  StudentProfileDraft,
  SubjectPath
} from "../types/game";

const STORAGE_KEY = "study-xp-react-v2";
const LEGACY_STORAGE_KEY = "campus-quest-react-v1";

export function loadLocalData() {
  try {
    if (window.location.search.includes("reset=1")) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return null;
    }

    for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw) as unknown;
      const normalized = key === STORAGE_KEY ? normalizeCurrentAppData(parsed) : normalizeLegacyAppData(parsed);

      if (!normalized) {
        window.localStorage.removeItem(key);
        continue;
      }

      if (key !== STORAGE_KEY) {
        saveLocalData(normalized);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      }

      return normalized;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveLocalData(data: AppData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage failures so the app still works without persistence.
  }
}

function normalizeCurrentAppData(value: unknown): AppData | null {
  if (!isRecord(value)) {
    return null;
  }

  const session = normalizeSession(value.session);
  const fallback = createEmptyAppData(session);
  const classes = normalizeClasses(value.classes);
  const assignments = normalizeAssignments(value.assignments, classes);
  const profile = normalizeProfile(value.profile);

  return {
    session,
    onboardingComplete: Boolean(value.onboardingComplete) && classes.length > 0 && profile !== null,
    profile,
    classes,
    assignments,
    quests: buildQuests(classes, assignments),
    milestones: buildMilestones(classes, assignments),
    dailyChallenge: toString(value.dailyChallenge) || fallback.dailyChallenge,
    streakProtection: toPositiveInteger(value.streakProtection, fallback.streakProtection),
    comboCount: toPositiveInteger(value.comboCount, fallback.comboCount),
    perfectDayClaimedOn: toNullableString(value.perfectDayClaimedOn)
  };
}

function normalizeLegacyAppData(value: unknown): AppData | null {
  if (!isRecord(value)) {
    return null;
  }

  const session = normalizeSession(value.session);
  const fallback = createEmptyAppData(session);
  const classes = normalizeClasses(value.classes);
  const assignments = normalizeAssignments(value.assignments, classes);
  const profile = normalizeLegacyProfile(value.characters);

  return {
    session,
    onboardingComplete: Boolean(value.onboardingComplete) && classes.length > 0 && profile !== null,
    profile,
    classes,
    assignments,
    quests: buildQuests(classes, assignments),
    milestones: buildMilestones(classes, assignments),
    dailyChallenge: toString(value.dailyChallenge) || fallback.dailyChallenge,
    streakProtection: toPositiveInteger(value.streakProtection, fallback.streakProtection),
    comboCount: toPositiveInteger(value.comboCount, fallback.comboCount),
    perfectDayClaimedOn: toNullableString(value.perfectDayClaimedOn)
  };
}

function normalizeSession(value: unknown): SessionState | null {
  if (!isRecord(value)) {
    return null;
  }

  const mode = value.mode === "firebase" ? "firebase" : value.mode === "local" ? "local" : null;
  const userId = toString(value.userId);
  const displayName = toString(value.displayName);
  const email = toString(value.email);

  if (!mode || !userId || !displayName || !email) {
    return null;
  }

  return {
    mode,
    userId,
    displayName,
    email,
    cloudEnabled: Boolean(value.cloudEnabled),
    lastSyncedAt: toNullableString(value.lastSyncedAt)
  };
}

function normalizeProfile(value: unknown): StudentProfile | null {
  if (!isRecord(value)) {
    return null;
  }

  const draft = normalizeProfileDraft(value);
  if (!draft) {
    return null;
  }

  const base = buildProfile(draft);
  const subjectXp = normalizeSubjectXp(value.subjectXp, base.subjectXp);
  const totalXp = Math.max(
    toPositiveInteger(value.totalXp, 0),
    Object.values(subjectXp).reduce((sum, amount) => sum + amount, 0)
  );
  const level = calculateLevel(totalXp);

  return {
    ...base,
    subjectXp,
    totalXp,
    level,
    rankTitle: getRankTitle(level),
    termResets: toPositiveInteger(value.termResets, 0),
    streak: toPositiveInteger(value.streak, 0),
    lastActiveOn: toNullableString(value.lastActiveOn),
    masteryScore: toPositiveInteger(value.masteryScore, calculateMasteryScore(subjectXp)),
    statPoints: normalizeStatBlock(value.statPoints, base.statPoints),
    skillTrees: buildSkillTrees(subjectXp)
  };
}

function normalizeLegacyProfile(value: unknown): StudentProfile | null {
  if (!Array.isArray(value) || !value.length) {
    return null;
  }

  const first = value.find((item) => isRecord(item));
  if (!first || !isRecord(first)) {
    return null;
  }

  const draft = normalizeProfileDraft({
    name: first.name,
    gradeLevel: first.trackLabel,
    goal: first.goal,
    avatarTheme: first.avatarTheme
  });
  if (!draft) {
    return null;
  }

  const base = buildProfile(draft);
  const subjectXp = normalizeSubjectXp(first.subjectXp, base.subjectXp);
  const totalXp = Math.max(
    toPositiveInteger(first.totalXp, 0),
    Object.values(subjectXp).reduce((sum, amount) => sum + amount, 0)
  );
  const level = calculateLevel(totalXp);

  return {
    ...base,
    subjectXp,
    totalXp,
    level,
    rankTitle: getRankTitle(level),
    termResets: toPositiveInteger(first.prestige, 0),
    streak: toPositiveInteger(first.streak, 0),
    lastActiveOn: toNullableString(first.lastActiveOn),
    masteryScore: toPositiveInteger(first.masteryScore, calculateMasteryScore(subjectXp)),
    statPoints: normalizeStatBlock(first.statPoints, base.statPoints),
    skillTrees: buildSkillTrees(subjectXp)
  };
}

function normalizeProfileDraft(value: unknown): StudentProfileDraft | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = toString(value.name);
  const gradeLevel = toString(value.gradeLevel);
  if (!name || !gradeLevel) {
    return null;
  }

  return {
    ...createBlankProfileDraft(),
    name,
    gradeLevel,
    goal: toString(value.goal),
    avatarTheme: getAvatarTheme(toString(value.avatarTheme)).id
  };
}

function normalizeClasses(value: unknown): ClassCourse[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeClass(item))
    .filter((item): item is ClassCourse => item !== null);
}

function normalizeClass(value: unknown): ClassCourse | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = toString(value.name);
  const teacher = toString(value.teacher);
  if (!name || !teacher) {
    return null;
  }

  const draft: ClassDraft = {
    id: toString(value.id) || createId("class"),
    name,
    subject: isSubjectPath(value.subject) ? value.subject : "Math",
    teacher,
    meetingPattern: toString(value.meetingPattern) || "Weekdays"
  };

  return buildClassCourse(draft);
}

function normalizeAssignments(value: unknown, classes: ClassCourse[]): Assignment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeAssignment(item, classes))
    .filter((item): item is Assignment => item !== null);
}

function normalizeAssignment(value: unknown, classes: ClassCourse[]): Assignment | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = toString(value.title);
  if (!title) {
    return null;
  }

  const requestedClassId = toString(value.classId);
  const classId = classes.some((course) => course.id === requestedClassId)
    ? requestedClassId
    : classes[0]?.id ?? requestedClassId;

  if (!classId) {
    return null;
  }

  return buildAssignment(
    {
      id: toString(value.id) || createId("assignment"),
      classId,
      title,
      type: isAssignmentType(value.type) ? value.type : "homework",
      dueDate: toString(value.dueDate) || todayIso(),
      estimatedMinutes: toPositiveInteger(value.estimatedMinutes, 30),
      status: isAssignmentStatus(value.status) ? value.status : "upcoming"
    },
    classes
  );
}

function normalizeSubjectXp(value: unknown, fallback: Record<SubjectPath, number>) {
  return subjectPaths.reduce<Record<SubjectPath, number>>((accumulator, subject) => {
    const subjectValue = isRecord(value) ? value[subject] : undefined;
    accumulator[subject] = toPositiveInteger(subjectValue, fallback[subject]);
    return accumulator;
  }, {} as Record<SubjectPath, number>);
}

function normalizeStatBlock(value: unknown, fallback: StatBlock) {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    focus: toPositiveInteger(value.focus, fallback.focus),
    speed: toPositiveInteger(value.speed, fallback.speed),
    memory: toPositiveInteger(value.memory, fallback.memory),
    consistency: toPositiveInteger(value.consistency, fallback.consistency)
  };
}

function calculateMasteryScore(subjectXp: Record<SubjectPath, number>) {
  return Math.round(Object.values(subjectXp).reduce((sum, value) => sum + value, 0) / subjectPaths.length);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function toPositiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : fallback;
}

function isSubjectPath(value: unknown): value is SubjectPath {
  return subjectPaths.includes(value as SubjectPath);
}

function isAssignmentType(value: unknown): value is AssignmentType {
  return value === "homework" || value === "quiz" || value === "test" || value === "project" || value === "reading" || value === "routine";
}

function isAssignmentStatus(value: unknown): value is AssignmentStatus {
  return value === "upcoming" || value === "due-soon" || value === "overdue" || value === "complete";
}
