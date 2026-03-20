import type {
  AppData,
  Assignment,
  AssignmentDraft,
  AssignmentStatus,
  AssignmentType,
  ClassCourse,
  ClassDraft,
  EnergyLevel,
  GeneratedQuest,
  ProgressMilestone,
  SessionState,
  SkillNode,
  StatBlock,
  StudentProfile,
  StudentProfileDraft,
  SubjectPath
} from "../types/game";

export const subjectPaths: SubjectPath[] = [
  "Math",
  "Statistics",
  "Biology",
  "Chemistry",
  "Physics",
  "Environmental Science",
  "Geology",
  "Computer Science",
  "Data Science",
  "Engineering",
  "Nursing",
  "Public Health",
  "History",
  "Political Science",
  "Economics",
  "Business",
  "Accounting",
  "Marketing",
  "Psychology",
  "Sociology",
  "Anthropology",
  "Philosophy",
  "Law",
  "Education",
  "Reading",
  "Literature",
  "Writing",
  "Language",
  "Communications",
  "Media Studies",
  "Research",
  "Art & Design",
  "Music",
  "Study Habits",
  "Other"
];

export const avatarThemes = [
  { id: "aurora", name: "Aurora Mint", background: "linear-gradient(135deg, #7ff0c8 0%, #7cb8ff 100%)" },
  { id: "sunflare", name: "Sunflare", background: "linear-gradient(135deg, #ff9d72 0%, #ffe38b 100%)" },
  { id: "ember", name: "Ember Spark", background: "linear-gradient(135deg, #ff6f7d 0%, #ffb86e 100%)" },
  { id: "midnight", name: "Midnight Focus", background: "linear-gradient(135deg, #32467e 0%, #8cc0ff 100%)" },
  { id: "jade", name: "Jade Circuit", background: "linear-gradient(135deg, #0da58a 0%, #7ff0c8 100%)" }
] as const;

const subjectBlueprints: Record<
  SubjectPath,
  { focusArea: keyof StatBlock; studyStyle: string; accent: string }
> = {
  Math: {
    focusArea: "memory",
    studyStyle: "problem sets, worked examples, and proof review",
    accent: "#7cb8ff"
  },
  Statistics: {
    focusArea: "memory",
    studyStyle: "data interpretation, problem sets, and concept review",
    accent: "#8db7ff"
  },
  Biology: {
    focusArea: "memory",
    studyStyle: "lab notes, diagrams, and concept mapping",
    accent: "#90d97a"
  },
  Chemistry: {
    focusArea: "speed",
    studyStyle: "equation practice, reaction review, and lab prep",
    accent: "#73f1cd"
  },
  Physics: {
    focusArea: "speed",
    studyStyle: "derivations, formula reps, and problem solving",
    accent: "#8ab8ff"
  },
  "Environmental Science": {
    focusArea: "memory",
    studyStyle: "case studies, field notes, and systems review",
    accent: "#7fdf9f"
  },
  Geology: {
    focusArea: "memory",
    studyStyle: "lab samples, diagrams, and process review",
    accent: "#b8c58b"
  },
  "Computer Science": {
    focusArea: "speed",
    studyStyle: "coding reps, debugging blocks, and build checkpoints",
    accent: "#5fd3ff"
  },
  "Data Science": {
    focusArea: "speed",
    studyStyle: "analysis reps, notebook review, and model iteration",
    accent: "#78d8ff"
  },
  Engineering: {
    focusArea: "consistency",
    studyStyle: "design reviews, calculations, and project milestones",
    accent: "#9ad0ff"
  },
  Nursing: {
    focusArea: "consistency",
    studyStyle: "care plans, clinical prep, and applied review",
    accent: "#80e2d4"
  },
  "Public Health": {
    focusArea: "focus",
    studyStyle: "case review, research reading, and synthesis",
    accent: "#8ce0cf"
  },
  History: {
    focusArea: "memory",
    studyStyle: "source reading, timelines, and essay prep",
    accent: "#f3c46d"
  },
  "Political Science": {
    focusArea: "focus",
    studyStyle: "reading blocks, argument mapping, and discussion prep",
    accent: "#ffd37f"
  },
  Economics: {
    focusArea: "memory",
    studyStyle: "graph review, concept drills, and problem sets",
    accent: "#f0c06b"
  },
  Business: {
    focusArea: "consistency",
    studyStyle: "case analysis, presentation prep, and planning blocks",
    accent: "#e7bc78"
  },
  Accounting: {
    focusArea: "consistency",
    studyStyle: "ledger drills, problem sets, and exam review",
    accent: "#f0c991"
  },
  Marketing: {
    focusArea: "focus",
    studyStyle: "campaign planning, case analysis, and presentation prep",
    accent: "#ffc589"
  },
  Psychology: {
    focusArea: "memory",
    studyStyle: "study review, research recall, and applied examples",
    accent: "#ffb086"
  },
  Sociology: {
    focusArea: "focus",
    studyStyle: "reading blocks, theory notes, and response writing",
    accent: "#ffb993"
  },
  Anthropology: {
    focusArea: "focus",
    studyStyle: "field notes, reading review, and response writing",
    accent: "#ffc8a7"
  },
  Philosophy: {
    focusArea: "focus",
    studyStyle: "close reading, argument breakdowns, and reflections",
    accent: "#dcb8ff"
  },
  Law: {
    focusArea: "focus",
    studyStyle: "case briefing, close reading, and argument prep",
    accent: "#d4b0ff"
  },
  Education: {
    focusArea: "consistency",
    studyStyle: "lesson planning, observation notes, and reflection work",
    accent: "#ffd79f"
  },
  Reading: {
    focusArea: "focus",
    studyStyle: "annotation blocks and comprehension review",
    accent: "#ffd37f"
  },
  Literature: {
    focusArea: "focus",
    studyStyle: "close reading, annotations, and discussion notes",
    accent: "#ffd37f"
  },
  Writing: {
    focusArea: "focus",
    studyStyle: "drafting sprints, revision passes, and workshop prep",
    accent: "#ff9f7f"
  },
  Language: {
    focusArea: "consistency",
    studyStyle: "vocabulary reps, speaking practice, and review drills",
    accent: "#8de7c6"
  },
  "Art & Design": {
    focusArea: "focus",
    studyStyle: "studio blocks, critique prep, and iteration cycles",
    accent: "#ff9fc6"
  },
  Music: {
    focusArea: "consistency",
    studyStyle: "practice sets, listening review, and performance prep",
    accent: "#9fc5ff"
  },
  Communications: {
    focusArea: "focus",
    studyStyle: "presentation rehearsal, speaking drills, and outline work",
    accent: "#ffd790"
  },
  "Media Studies": {
    focusArea: "focus",
    studyStyle: "screening review, analysis notes, and discussion prep",
    accent: "#ffb8d2"
  },
  Research: {
    focusArea: "consistency",
    studyStyle: "source gathering, note synthesis, and writing passes",
    accent: "#b4bfff"
  },
  "Study Habits": {
    focusArea: "consistency",
    studyStyle: "routine building and recovery systems",
    accent: "#d6a2ff"
  },
  Other: {
    focusArea: "consistency",
    studyStyle: "custom review blocks, check-ins, and steady progress",
    accent: "#9fb8cf"
  }
};

const rankLadder = [
  { level: 1, title: "Starter" },
  { level: 4, title: "In Rhythm" },
  { level: 8, title: "Locked In" },
  { level: 12, title: "High Momentum" },
  { level: 16, title: "Top Form" },
  { level: 20, title: "Peak Semester" }
];

const dailyModifiers = [
  "Low-pressure mode: short wins pay extra XP today.",
  "Combo boost: three completed tasks in one sitting earn bonus momentum.",
  "Deadline focus: due-soon work gets a stronger priority score today.",
  "Recovery window: overdue tasks are easier to bounce back from today.",
  "Pomodoro bonus: full focus blocks reward extra study habit XP."
];

export function formatSubjectLabel(subject: SubjectPath, customLabel = "") {
  return subject === "Other" ? customLabel.trim() || "Other" : subject;
}

function activeSubjectPaths(subjects: SubjectPath[]) {
  const active = new Set<SubjectPath>(["Study Habits"]);

  for (const subject of subjects) {
    active.add(subject);
  }

  return [...active];
}

function skillBonusForFocusArea(focusArea: keyof StatBlock) {
  if (focusArea === "memory") {
    return "+Memory";
  }

  if (focusArea === "speed") {
    return "+Speed";
  }

  if (focusArea === "focus") {
    return "+Focus";
  }

  return "+Consistency";
}

function skillBlueprintsFor(subject: SubjectPath) {
  const subjectId = subject.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const blueprint = subjectBlueprints[subject];

  if (subject === "Study Habits") {
    return [
      { id: `${subjectId}-1`, name: "Routine Lock", tier: 1, bonus: "+Consistency", description: "Makes it easier to start and protect your study rhythm." },
      { id: `${subjectId}-2`, name: "Streak Guard", tier: 2, bonus: "+Streak Protect", description: "Off days are easier to recover from without losing momentum." },
      { id: `${subjectId}-3`, name: "Focus Loop", tier: 3, bonus: "+Pomodoro XP", description: "Full focus blocks turn into stronger habit and recovery gains." }
    ];
  }

  if (subject === "Other") {
    return [
      { id: `${subjectId}-1`, name: "Custom Foundation", tier: 1, bonus: "+Consistency", description: "Creates a stable routine for courses that do not fit a standard bucket." },
      { id: `${subjectId}-2`, name: "Flexible Flow", tier: 2, bonus: "+Combo XP", description: "Helps mixed workloads feel easier to plan and clear in one sitting." },
      { id: `${subjectId}-3`, name: "Finish Strong", tier: 3, bonus: "+Milestone XP", description: "Makes independent or custom academic work easier to close out." }
    ];
  }

  return [
    {
      id: `${subjectId}-1`,
      name: `${subject} Foundations`,
      tier: 1,
      bonus: skillBonusForFocusArea(blueprint.focusArea),
      description: `Makes ${subject.toLowerCase()} sessions easier to start and organize.`
    },
    {
      id: `${subjectId}-2`,
      name: `${subject} Flow`,
      tier: 2,
      bonus: "+Combo XP",
      description: `Longer ${subject.toLowerCase()} blocks feel smoother and more consistent.`
    },
    {
      id: `${subjectId}-3`,
      name: `${subject} Finish`,
      tier: 3,
      bonus: "+Milestone XP",
      description: `Big ${subject.toLowerCase()} deadlines feel easier to close out with ${blueprint.studyStyle}.`
    }
  ];
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function todayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createBlankProfileDraft(): StudentProfileDraft {
  return {
    name: "",
    gradeLevel: "",
    goal: "",
    avatarTheme: avatarThemes[0].id
  };
}

export function createBlankClassDraft(): ClassDraft {
  return {
    id: createId("class"),
    name: "",
    subject: "Math",
    subjectLabel: "",
    teacher: "",
    meetingPattern: "Weekdays"
  };
}

export function createBlankAssignmentDraft(classId = ""): AssignmentDraft {
  return {
    id: createId("assignment"),
    classId,
    title: "",
    type: "homework",
    dueDate: todayIso(),
    estimatedMinutes: 30,
    status: "upcoming"
  };
}

export function createEmptyAppData(session: SessionState | null): AppData {
  return {
    session,
    onboardingComplete: false,
    profile: null,
    classes: [],
    assignments: [],
    quests: [],
    milestones: [],
    dailyChallenge: dailyModifiers[0],
    streakProtection: 1,
    comboCount: 0,
    perfectDayClaimedOn: null
  };
}

export function generateWorkspace(
  session: SessionState | null,
  profileDraft: StudentProfileDraft,
  classDrafts: ClassDraft[],
  assignmentDrafts: AssignmentDraft[]
): AppData {
  const classes = classDrafts
    .filter((item) => item.name.trim() && item.teacher.trim())
    .map(buildClassCourse);
  const assignments = assignmentDrafts
    .filter((item) => item.title.trim() && item.classId)
    .map((item) => buildAssignment(item, classes));
  const profile = profileDraft.name.trim() && profileDraft.gradeLevel.trim()
    ? buildProfile(profileDraft, classes.map((item) => item.subject))
    : null;

  return {
    session,
    onboardingComplete: Boolean(profile) && classes.length > 0,
    profile,
    classes,
    assignments,
    quests: buildQuests(classes, assignments),
    milestones: buildMilestones(classes, assignments),
    dailyChallenge: dailyModifiers[dayIndex(todayIso(), dailyModifiers.length)],
    streakProtection: 1,
    comboCount: 0,
    perfectDayClaimedOn: null
  };
}

export function buildClassCourse(draft: ClassDraft): ClassCourse {
  const blueprint = subjectBlueprints[draft.subject];

  return {
    ...draft,
    subjectLabel: formatSubjectLabel(draft.subject, draft.subjectLabel),
    focusArea: blueprint.focusArea,
    studyStyle: blueprint.studyStyle,
    accent: blueprint.accent
  };
}

export function buildAssignment(draft: AssignmentDraft, classes: ClassCourse[]): Assignment {
  const classCourse = classes.find((item) => item.id === draft.classId);
  const subject = classCourse?.subject ?? "Study Habits";

  return {
    ...draft,
    status: deriveAssignmentStatus(draft.dueDate, draft.status),
    energy: deriveEnergy(draft.estimatedMinutes, draft.type, subject)
  };
}

export function buildProfile(draft: StudentProfileDraft, subjects: SubjectPath[] = []): StudentProfile {
  const seededSubjects = activeSubjectPaths(subjects);
  const subjectXp = subjectPaths.reduce<Record<SubjectPath, number>>((accumulator, subject) => {
    accumulator[subject] = subject === "Study Habits"
      ? 60
      : seededSubjects.includes(subject)
        ? 40
        : 0;
    return accumulator;
  }, {} as Record<SubjectPath, number>);
  const totalXp = Object.values(subjectXp).reduce((sum, value) => sum + value, 0);

  return {
    ...draft,
    totalXp,
    level: calculateLevel(totalXp),
    rankTitle: getRankTitle(calculateLevel(totalXp)),
    termResets: 0,
    streak: 0,
    lastActiveOn: null,
    masteryScore: calculateMasteryScore(subjectXp),
    statPoints: {
      focus: 4,
      speed: 4,
      memory: 4,
      consistency: 6
    },
    subjectXp,
    skillTrees: buildSkillTrees(subjectXp)
  };
}

export function buildSkillTrees(subjectXp: Record<SubjectPath, number>) {
  return subjectPaths.reduce<Record<SubjectPath, SkillNode[]>>((accumulator, subject) => {
    accumulator[subject] = skillBlueprintsFor(subject).map((node) => ({
      ...node,
      unlocked: subjectXp[subject] >= node.tier * 120
    }));
    return accumulator;
  }, {} as Record<SubjectPath, SkillNode[]>);
}

export function buildQuests(classes: ClassCourse[], assignments: Assignment[]): GeneratedQuest[] {
  const baseQuests = assignments.map((assignment) => assignmentToQuest(assignment, classes));
  const routineQuests = classes.map((course) => ({
    id: createId("quest"),
    classId: course.id,
    title: `${course.name} Focus Block`,
    subtitle: `${course.teacher} / ${course.meetingPattern}`,
    type: "routine" as const,
    subject: course.subject,
    subjectLabel: course.subjectLabel,
    className: course.name,
    teacherName: course.teacher,
    dueDate: todayIso(),
    difficulty: 2,
    xpReward: 80,
    timerMinutes: 20,
    proof: ["timer", "checklist"],
    checkpoints: ["Open materials", "Finish one focused block", "Write one takeaway"],
    statRewards: buildStatRewards(course.subject, "routine"),
    energy: "low" as const,
    rewardText: `Supports ${course.focusArea} and routine consistency.`,
    completed: false
  }));
  const stealthQuest: GeneratedQuest = {
    id: createId("quest"),
    title: "Low-Energy Win",
    subtitle: "A short task path for days when energy is low but momentum matters.",
    type: "stealth",
    subject: "Study Habits",
    subjectLabel: "Study Habits",
    className: "Personal",
    teacherName: "Self-managed",
    dueDate: todayIso(),
    difficulty: 1,
    xpReward: 55,
    timerMinutes: 10,
    proof: ["timer", "checklist"],
    checkpoints: ["Pick one tiny task", "Work for ten focused minutes", "Log one win"],
    statRewards: { consistency: 1, focus: 1 },
    energy: "low",
    modifier: "Recovery-friendly",
    rewardText: "Keeps the streak alive without adding shame.",
    completed: false
  };

  const overdue = assignments.filter((assignment) => assignment.status === "overdue");
  const rescueQuest: GeneratedQuest | null = overdue.length
    ? {
        id: createId("quest"),
        title: "Weekend Catch-Up",
        subtitle: `Recover ${overdue.length} overdue task${overdue.length === 1 ? "" : "s"} before they pile higher.`,
        type: "rescue",
        subject: "Study Habits",
        subjectLabel: "Study Habits",
        className: "Catch-Up",
        teacherName: "Self-managed",
        dueDate: overdue[0].dueDate,
        difficulty: 3,
        xpReward: 160,
        timerMinutes: 40,
        proof: ["timer", "notes", "checklist"],
        checkpoints: ["Clear the oldest task", "Stabilize the next due date", "Plan tomorrow's top task"],
        statRewards: { consistency: 2, focus: 1 },
        energy: "medium",
        modifier: "Catch-up bonus",
        rewardText: "Turns procrastination into a recovery path instead of a dead end.",
        completed: false
      }
    : null;

  return [...baseQuests, ...routineQuests, stealthQuest, ...(rescueQuest ? [rescueQuest] : [])].sort(sortQuests);
}

export function buildMilestones(classes: ClassCourse[], assignments: Assignment[]): ProgressMilestone[] {
  const completionRate = assignments.length
    ? Math.round((assignments.filter((assignment) => assignment.status === "complete").length / assignments.length) * 100)
    : 0;
  const majorAssignments = assignments.filter((assignment) => assignment.type === "project" || assignment.type === "quiz" || assignment.type === "test");
  const majorCompletionRate = majorAssignments.length
    ? Math.round((majorAssignments.filter((assignment) => assignment.status === "complete").length / majorAssignments.length) * 100)
    : 0;

  return [
    {
      id: createId("milestone"),
      label: "Setup",
      title: "Academic setup complete",
      summary: "Tracks whether your real courses and workload are fully represented in the app.",
      progress: Math.min(100, classes.length * 20 + assignments.length * 10),
      reward: "Cleaner priorities and better quest generation"
    },
    {
      id: createId("milestone"),
      label: "Consistency",
      title: "On-time work",
      summary: "Measures how much of your tracked work is actually getting completed.",
      progress: completionRate,
      reward: "Streak shields and combo momentum"
    },
    {
      id: createId("milestone"),
      label: "Big Work",
      title: "Exams and major projects",
      summary: "Shows how your heavier deadlines are progressing through the semester.",
      progress: majorAssignments.length ? majorCompletionRate : Math.min(100, classes.length * 12),
      reward: "Eligible for a new-term boost"
    }
  ];
}

export function completeQuest(data: AppData, questId: string): AppData {
  if (!data.profile) {
    return data;
  }

  const quest = data.quests.find((item) => item.id === questId);
  if (!quest || quest.completed) {
    return data;
  }

  const today = todayIso();
  const nextCombo = data.comboCount + 1;
  const comboBonus = nextCombo > 1 ? nextCombo * 14 : 0;
  const perfectDay = shouldAwardPerfectDay(data.quests, questId, today) && data.perfectDayClaimedOn !== today;
  const perfectDayBonus = perfectDay ? 90 : 0;
  const streakGained = updateStreak(data.profile, today);

  quest.completed = true;
  const assignment = quest.sourceAssignmentId
    ? data.assignments.find((item) => item.id === quest.sourceAssignmentId)
    : null;

  if (assignment) {
    assignment.status = "complete";
  }

  data.profile.totalXp += quest.xpReward + comboBonus + perfectDayBonus;
  data.profile.subjectXp[quest.subject] += quest.xpReward;
  data.profile.level = calculateLevel(data.profile.totalXp);
  data.profile.rankTitle = getRankTitle(data.profile.level);
  data.profile.skillTrees = buildSkillTrees(data.profile.subjectXp);
  data.profile.masteryScore = calculateMasteryScore(data.profile.subjectXp);
  data.profile.statPoints.focus += quest.statRewards.focus ?? 0;
  data.profile.statPoints.speed += quest.statRewards.speed ?? 0;
  data.profile.statPoints.memory += quest.statRewards.memory ?? 0;
  data.profile.statPoints.consistency += quest.statRewards.consistency ?? 0;

  return {
    ...data,
    comboCount: Math.min(5, nextCombo),
    streakProtection: data.streakProtection + (perfectDay ? 1 : 0),
    perfectDayClaimedOn: perfectDay ? today : data.perfectDayClaimedOn,
    milestones: buildMilestones(data.classes, data.assignments),
    quests: [...data.quests],
    assignments: [...data.assignments],
    profile: { ...data.profile },
    dailyChallenge: streakGained ? `${data.dailyChallenge} Streak secured for today.` : data.dailyChallenge
  };
}

export function startNewTerm(data: AppData): AppData {
  if (!data.profile || !canStartNewTerm(data.profile, data.milestones)) {
    return data;
  }

  const subjectXp = subjectPaths.reduce<Record<SubjectPath, number>>((accumulator, subject) => {
    accumulator[subject] = Math.round(data.profile!.subjectXp[subject] * 0.25);
    return accumulator;
  }, {} as Record<SubjectPath, number>);

  const totalXp = 180;

  return {
    ...data,
    profile: {
      ...data.profile,
      totalXp,
      level: calculateLevel(totalXp),
      rankTitle: getRankTitle(calculateLevel(totalXp)),
      termResets: data.profile.termResets + 1,
      subjectXp,
      skillTrees: buildSkillTrees(subjectXp),
      masteryScore: calculateMasteryScore(subjectXp),
      statPoints: {
        focus: data.profile.statPoints.focus + 1,
        speed: data.profile.statPoints.speed + 1,
        memory: data.profile.statPoints.memory + 1,
        consistency: data.profile.statPoints.consistency + 1
      }
    },
    streakProtection: data.streakProtection + 2
  };
}

export function canStartNewTerm(profile: StudentProfile, milestones: ProgressMilestone[]) {
  return milestones.every((milestone) => milestone.progress >= 80) && profile.level >= 15;
}

export function calculateLevel(totalXp: number) {
  return Math.floor(totalXp / 220) + 1;
}

export function getRankTitle(level: number) {
  return [...rankLadder].reverse().find((entry) => level >= entry.level)?.title ?? rankLadder[0].title;
}

export function progressToNextLevel(totalXp: number) {
  const level = calculateLevel(totalXp);
  const floorXp = (level - 1) * 220;
  return {
    level,
    currentIntoLevel: totalXp - floorXp,
    needed: 220
  };
}

export function getAvatarTheme(themeId: string) {
  return avatarThemes.find((theme) => theme.id === themeId) ?? avatarThemes[0];
}

export function formatDueLabel(dueDate: string) {
  const today = parseDate(todayIso());
  const due = parseDate(dueDate);
  const delta = Math.floor((due.getTime() - today.getTime()) / 86400000);

  if (delta === 0) {
    return "Due today";
  }

  if (delta === 1) {
    return "Due tomorrow";
  }

  if (delta < 0) {
    return `${Math.abs(delta)} day${Math.abs(delta) === 1 ? "" : "s"} late`;
  }

  return `Due in ${delta} day${delta === 1 ? "" : "s"}`;
}

function assignmentToQuest(assignment: Assignment, classes: ClassCourse[]): GeneratedQuest {
  const classCourse = classes.find((item) => item.id === assignment.classId);
  const subject = classCourse?.subject ?? "Study Habits";
  const isBoss = assignment.type === "quiz" || assignment.type === "test";
  const isLegendary = assignment.type === "project" && assignment.estimatedMinutes >= 90;
  const type = assignment.status === "overdue"
    ? "rescue"
    : isBoss
      ? "boss"
      : isLegendary
        ? "legendary"
        : assignment.type === "routine"
          ? "routine"
          : "daily";

  const checkpoints = buildCheckpoints(assignment.title, assignment.type, assignment.estimatedMinutes);
  const proof = buildProof(assignment.type);
  const statRewards = buildStatRewards(subject, type);

  return {
    id: createId("quest"),
    sourceAssignmentId: assignment.id,
    classId: assignment.classId,
    title: questTitleForAssignment(assignment),
    subtitle: `${classCourse?.name ?? "Independent Study"} / ${classCourse?.teacher ?? "Self-managed"}`,
    type,
    subject,
    subjectLabel: classCourse?.subjectLabel ?? formatSubjectLabel(subject),
    className: classCourse?.name ?? "Independent Study",
    teacherName: classCourse?.teacher ?? "Self-managed",
    dueDate: assignment.dueDate,
    difficulty: deriveDifficulty(assignment),
    xpReward: deriveXp(assignment, type),
    timerMinutes: Math.max(10, Math.round(assignment.estimatedMinutes * (isBoss ? 0.6 : 0.75))),
    proof,
    checkpoints,
    statRewards,
    energy: assignment.energy,
    modifier: assignment.status === "overdue" ? "Catch-up bonus" : undefined,
    rewardText: classCourse ? `Supports ${classCourse.studyStyle}.` : "Supports steady progress.",
    completed: assignment.status === "complete"
  };
}

function buildCheckpoints(title: string, type: AssignmentType, estimatedMinutes: number) {
  if (type === "quiz" || type === "test") {
    return ["Find weak spots", "Run a timed prep block", `Finish the ${title} review`, "Write one quick reflection"];
  }

  if (type === "project") {
    return ["Break the work into steps", "Finish the next deliverable", "Save proof of progress", "Queue the next step"];
  }

  if (type === "reading") {
    return ["Read the section", "Capture three takeaways", "Write one question"];
  }

  if (estimatedMinutes <= 20) {
    return ["Open the task", "Clear the core requirement", "Log the win"];
  }

  return ["Start a focus block", "Hit the midpoint checkpoint", "Finish and record proof"];
}

function buildProof(type: AssignmentType) {
  if (type === "quiz" || type === "test") {
    return ["timer", "notes", "checklist"];
  }

  if (type === "project") {
    return ["photo", "notes", "checklist"];
  }

  return ["timer", "checklist"];
}

function buildStatRewards(subject: SubjectPath, questType: GeneratedQuest["type"]): Partial<StatBlock> {
  const base: Partial<StatBlock> = {};

  const focusArea = subjectBlueprints[subject].focusArea;
  const rewardAmount = questType === "boss" || questType === "legendary" ? 2 : 1;
  base[focusArea] = rewardAmount;

  if (subject === "Writing" || subject === "Research" || subject === "Other") {
    base.consistency = Math.max(base.consistency ?? 0, 1);
  }

  return base;
}

function deriveDifficulty(assignment: Assignment) {
  const minutesScore = Math.ceil(assignment.estimatedMinutes / 20);
  const typeBonus = assignment.type === "test" ? 2 : assignment.type === "project" ? 1 : 0;
  const statusBonus = assignment.status === "overdue" ? 1 : 0;
  return Math.min(5, minutesScore + typeBonus + statusBonus);
}

function deriveXp(assignment: Assignment, type: GeneratedQuest["type"]) {
  const base = assignment.estimatedMinutes * 2;
  const typeBonus = type === "boss" ? 85 : type === "legendary" ? 110 : type === "rescue" ? 60 : 25;
  return base + typeBonus;
}

function deriveEnergy(minutes: number, type: AssignmentType, subject: SubjectPath): EnergyLevel {
  if (type === "quiz" || type === "test") {
    return "high";
  }

  if (subject === "Study Habits" || minutes <= 20) {
    return "low";
  }

  if (minutes >= 60 || type === "project") {
    return "high";
  }

  return "medium";
}

function deriveAssignmentStatus(dueDate: string, currentStatus: AssignmentStatus): AssignmentStatus {
  if (currentStatus === "complete") {
    return "complete";
  }

  const delta = Math.floor((parseDate(dueDate).getTime() - parseDate(todayIso()).getTime()) / 86400000);

  if (delta < 0) {
    return "overdue";
  }

  if (delta <= 1) {
    return "due-soon";
  }

  return "upcoming";
}

function calculateMasteryScore(subjectXp: Record<SubjectPath, number>) {
  const trackedValues = Object.values(subjectXp).filter((value) => value > 0);

  if (!trackedValues.length) {
    return 0;
  }

  return Math.round(trackedValues.reduce((sum, value) => sum + value, 0) / trackedValues.length);
}

function questTitleForAssignment(assignment: Assignment) {
  if (assignment.type === "quiz" || assignment.type === "test") {
    return `${assignment.title} Test Prep`;
  }

  if (assignment.type === "project") {
    return `${assignment.title} Big Milestone`;
  }

  if (assignment.type === "reading") {
    return `${assignment.title} Reading Block`;
  }

  return assignment.title;
}

function shouldAwardPerfectDay(quests: GeneratedQuest[], completedQuestId: string, today: string) {
  return quests
    .filter((quest) => quest.dueDate <= today)
    .every((quest) => quest.completed || quest.id === completedQuestId);
}

function updateStreak(profile: StudentProfile, today: string) {
  if (profile.lastActiveOn === today) {
    return false;
  }

  const lastActive = profile.lastActiveOn ? parseDate(profile.lastActiveOn) : null;
  const todayDate = parseDate(today);

  if (!lastActive) {
    profile.streak = 1;
  } else {
    const delta = Math.floor((todayDate.getTime() - lastActive.getTime()) / 86400000);
    profile.streak = delta <= 1 ? profile.streak + 1 : 1;
  }

  profile.lastActiveOn = today;
  return true;
}

function sortQuests(left: GeneratedQuest, right: GeneratedQuest) {
  return left.dueDate.localeCompare(right.dueDate) || right.difficulty - left.difficulty;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function dayIndex(value: string, modulo: number) {
  return Math.abs(Math.floor(parseDate(value).getTime() / 86400000)) % modulo;
}
