export type SubjectPath =
  | "Math"
  | "Statistics"
  | "Biology"
  | "Chemistry"
  | "Physics"
  | "Environmental Science"
  | "Geology"
  | "Computer Science"
  | "Data Science"
  | "Engineering"
  | "Nursing"
  | "Public Health"
  | "History"
  | "Political Science"
  | "Economics"
  | "Business"
  | "Accounting"
  | "Marketing"
  | "Psychology"
  | "Sociology"
  | "Anthropology"
  | "Philosophy"
  | "Law"
  | "Education"
  | "Reading"
  | "Literature"
  | "Writing"
  | "Language"
  | "Communications"
  | "Media Studies"
  | "Research"
  | "Art & Design"
  | "Music"
  | "Study Habits"
  | "Other";
export type AssignmentType = "homework" | "quiz" | "test" | "project" | "reading" | "routine";
export type AssignmentStatus = "upcoming" | "due-soon" | "overdue" | "complete";
export type QuestType = "daily" | "boss" | "routine" | "rescue" | "legendary" | "stealth";
export type EnergyLevel = "low" | "medium" | "high";
export type AuthMode = "local" | "firebase";

export interface StatBlock {
  focus: number;
  speed: number;
  memory: number;
  consistency: number;
}

export interface SkillNode {
  id: string;
  name: string;
  tier: number;
  unlocked: boolean;
  description: string;
  bonus: string;
}

export interface StudentProfileDraft {
  name: string;
  gradeLevel: string;
  goal: string;
  avatarTheme: string;
}

export interface StudentProfile extends StudentProfileDraft {
  totalXp: number;
  level: number;
  rankTitle: string;
  termResets: number;
  streak: number;
  lastActiveOn: string | null;
  masteryScore: number;
  statPoints: StatBlock;
  subjectXp: Record<SubjectPath, number>;
  skillTrees: Record<SubjectPath, SkillNode[]>;
}

export interface ClassDraft {
  id: string;
  name: string;
  subject: SubjectPath;
  subjectLabel: string;
  teacher: string;
  meetingPattern: string;
}

export interface ClassCourse extends ClassDraft {
  focusArea: keyof StatBlock;
  studyStyle: string;
  accent: string;
}

export interface AssignmentDraft {
  id: string;
  classId: string;
  title: string;
  type: AssignmentType;
  dueDate: string;
  estimatedMinutes: number;
  status: AssignmentStatus;
}

export interface Assignment extends AssignmentDraft {
  energy: EnergyLevel;
}

export interface GeneratedQuest {
  id: string;
  sourceAssignmentId?: string;
  classId?: string;
  title: string;
  subtitle: string;
  type: QuestType;
  subject: SubjectPath;
  subjectLabel: string;
  className: string;
  teacherName: string;
  dueDate: string;
  difficulty: number;
  xpReward: number;
  timerMinutes: number;
  proof: string[];
  checkpoints: string[];
  statRewards: Partial<StatBlock>;
  energy: EnergyLevel;
  modifier?: string;
  rewardText: string;
  completed: boolean;
}

export interface ProgressMilestone {
  id: string;
  label: string;
  title: string;
  summary: string;
  progress: number;
  reward: string;
}

export interface SessionState {
  mode: AuthMode;
  userId: string;
  displayName: string;
  email: string;
  cloudEnabled: boolean;
  lastSyncedAt: string | null;
}

export interface AppData {
  session: SessionState | null;
  onboardingComplete: boolean;
  profile: StudentProfile | null;
  classes: ClassCourse[];
  assignments: Assignment[];
  quests: GeneratedQuest[];
  milestones: ProgressMilestone[];
  dailyChallenge: string;
  streakProtection: number;
  comboCount: number;
  perfectDayClaimedOn: string | null;
}
