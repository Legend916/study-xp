import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import "./styles.css";
import {
  clearFirebaseConfig,
  getFirebaseConfigDraft,
  getFirebaseConfigSource,
  hasFirebaseConfig,
  loadCloudData,
  saveCloudData,
  saveFirebaseConfig,
  signInEmail,
  signInGoogle,
  signOutCloud
} from "./lib/firebase";
import {
  avatarThemes,
  buildSkillTrees,
  canStartNewTerm,
  completeQuest,
  createBlankAssignmentDraft,
  createBlankClassDraft,
  createBlankProfileDraft,
  createEmptyAppData,
  createId,
  formatDueLabel,
  generateWorkspace,
  getAvatarTheme,
  getRankTitle,
  progressToNextLevel,
  startNewTerm,
  subjectPaths,
  todayIso
} from "./lib/game";
import { loadLocalData, saveLocalData } from "./lib/storage";
import type {
  AppData,
  Assignment,
  AssignmentDraft,
  ClassCourse,
  ClassDraft,
  GeneratedQuest,
  ProgressMilestone,
  QuestType,
  SessionState,
  StudentProfile,
  StudentProfileDraft,
  SubjectPath
} from "./types/game";
import type { FirebaseClientConfig, FirebaseConfigSource } from "./lib/firebase";

type TimerState = {
  questId: string;
  label: string;
  remainingSeconds: number;
  mode: "quest" | "pomodoro";
};

const initialData = loadLocalData() ?? createEmptyAppData(null);

function App() {
  const [data, setData] = useState<AppData>(initialData);
  const [profileDraft, setProfileDraft] = useState<StudentProfileDraft>(() => initialData.profile ? toProfileDraft(initialData.profile) : createBlankProfileDraft());
  const [classDrafts, setClassDrafts] = useState<ClassDraft[]>(() => initialData.classes.length ? initialData.classes.map(toClassDraft) : [createBlankClassDraft()]);
  const [assignmentDrafts, setAssignmentDrafts] = useState<AssignmentDraft[]>(() => initialData.assignments.length ? initialData.assignments.map(toAssignmentDraft) : [createBlankAssignmentDraft()]);
  const [authForm, setAuthForm] = useState({ displayName: "", email: "", password: "" });
  const [firebaseConfigDraft, setFirebaseConfigDraft] = useState<FirebaseClientConfig>(() => getFirebaseConfigDraft());
  const [firebaseConfigSource, setFirebaseConfigSource] = useState<FirebaseConfigSource>(() => getFirebaseConfigSource());
  const [firebaseReady, setFirebaseReady] = useState(() => hasFirebaseConfig());
  const [showCloudSetup, setShowCloudSetup] = useState(() => !hasFirebaseConfig());
  const [statusMessage, setStatusMessage] = useState("Set up your real classes and let the app turn them into a motivating school dashboard.");
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [privateMode, setPrivateMode] = useState(false);
  const [playMode, setPlayMode] = useState<"Chill" | "Competitive" | "Exam Week">("Chill");
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [pomodoroBonusReady, setPomodoroBonusReady] = useState(false);

  const profile = data.profile;
  const bestNextQuest = useMemo(() => getBestNextQuest(data.quests, playMode), [data.quests, playMode]);
  const dueSoon = useMemo(
    () => [...data.assignments].filter((assignment) => assignment.status !== "complete").sort((left, right) => left.dueDate.localeCompare(right.dueDate)).slice(0, 5),
    [data.assignments]
  );
  const semesterProgress = useMemo(() => {
    if (!data.milestones.length) {
      return 0;
    }

    return Math.round(data.milestones.reduce((sum, milestone) => sum + milestone.progress, 0) / data.milestones.length);
  }, [data.milestones]);

  useEffect(() => {
    saveLocalData(data);
  }, [data]);

  useEffect(() => {
    if (!data.session?.cloudEnabled) {
      return;
    }

    setSyncState("saving");
    const timeout = window.setTimeout(async () => {
      try {
        await saveCloudData(data.session!.userId, data);
        setSyncState("saved");
      } catch {
        setSyncState("error");
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [data]);

  useEffect(() => {
    if (!timer) {
      return;
    }

    if (timer.remainingSeconds <= 0) {
      setStatusMessage(`${timer.label} finished. ${timer.mode === "pomodoro" ? "Pomodoro bonus armed." : "Checkpoint ready to claim."}`);
      if (timer.mode === "pomodoro") {
        setPomodoroBonusReady(true);
      }
      setTimer(null);
      return;
    }

    const interval = window.setInterval(() => {
      setTimer((current) => current ? { ...current, remainingSeconds: current.remainingSeconds - 1 } : null);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timer]);

  function restoreDraftsFromData(source: AppData) {
    setProfileDraft(source.profile ? toProfileDraft(source.profile) : createBlankProfileDraft());
    setClassDrafts(source.classes.length ? source.classes.map(toClassDraft) : [createBlankClassDraft()]);
    setAssignmentDrafts(source.assignments.length ? source.assignments.map(toAssignmentDraft) : [createBlankAssignmentDraft(source.classes[0]?.id ?? "")]);
  }

  function refreshFirebaseSetupState() {
    setFirebaseConfigDraft(getFirebaseConfigDraft());
    setFirebaseConfigSource(getFirebaseConfigSource());
    setFirebaseReady(hasFirebaseConfig());
  }

  function handleSaveCloudSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      saveFirebaseConfig(firebaseConfigDraft);
      refreshFirebaseSetupState();
      setShowCloudSetup(false);
      setStatusMessage("Cloud sync is configured on this device. Email and Google sign-in are now ready.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Cloud setup could not be saved.");
    }
  }

  function handleClearCloudSetup() {
    clearFirebaseConfig();
    refreshFirebaseSetupState();
    setShowCloudSetup(true);
    setStatusMessage("Saved Firebase setup was removed from this browser. Local mode still works.");
  }

  function handleLocalStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = authForm.displayName.trim() || authForm.email.trim().split("@")[0] || "Student";
    const session: SessionState = {
      mode: "local",
      userId: `local-${createId("user")}`,
      displayName,
      email: authForm.email.trim() || "local@studyxp.app",
      cloudEnabled: false,
      lastSyncedAt: null
    };

    setData((current) => ({ ...(current.profile || current.classes.length ? current : createEmptyAppData(session)), session }));
    setStatusMessage("Local profile ready. Progress will stay on this device until cloud sync is configured.");
  }

  async function handleCloudEmail(createAccount: boolean) {
    try {
      const credentials = await signInEmail(authForm.email.trim(), authForm.password, createAccount);
      const session: SessionState = {
        mode: "firebase",
        userId: credentials.user.uid,
        displayName: credentials.user.displayName || authForm.displayName || credentials.user.email?.split("@")[0] || "Student",
        email: credentials.user.email || authForm.email.trim(),
        cloudEnabled: true,
        lastSyncedAt: null
      };
      const cloudData = await loadCloudData(credentials.user.uid);
      const nextData = cloudData ? { ...cloudData, session } : createEmptyAppData(session);
      setData(nextData);
      restoreDraftsFromData(nextData);
      setStatusMessage(createAccount ? "Cloud account created. Progress will sync across devices." : "Cloud account loaded from Firebase.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Cloud sign-in failed.");
    }
  }

  async function handleGoogleAuth() {
    try {
      const credentials = await signInGoogle();
      const session: SessionState = {
        mode: "firebase",
        userId: credentials.user.uid,
        displayName: credentials.user.displayName || credentials.user.email?.split("@")[0] || "Student",
        email: credentials.user.email || "student@studyxp.app",
        cloudEnabled: true,
        lastSyncedAt: null
      };
      const cloudData = await loadCloudData(credentials.user.uid);
      const nextData = cloudData ? { ...cloudData, session } : createEmptyAppData(session);
      setData(nextData);
      restoreDraftsFromData(nextData);
      setStatusMessage("Google login connected. Cloud save is now active.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Google sign-in failed.");
    }
  }

  async function handleSignOut() {
    if (data.session?.mode === "firebase" && hasFirebaseConfig()) {
      try {
        await signOutCloud();
      } catch {
        // Ignore sign-out cleanup failures in local shell.
      }
    }

    setData((current) => ({ ...current, session: null }));
    setStatusMessage("Signed out. Your local setup is still here when you come back.");
  }

  function handleGenerateWorkspace() {
    const next = generateWorkspace(data.session, profileDraft, classDrafts, assignmentDrafts);
    setData(next);
    setStatusMessage("Your real schedule is now mapped into XP, focus blocks, and recovery paths.");
  }

  function handleReopenSetup() {
    restoreDraftsFromData(data);
    setData((current) => ({ ...current, onboardingComplete: false }));
    setStatusMessage("Setup reopened. You can adjust your profile, classes, and assignments without losing the account shell.");
  }

  function handleCompleteQuest(questId: string) {
    setData((current) => {
      let next = completeQuest(current, questId);

      if (pomodoroBonusReady && next.profile) {
        next.profile.totalXp += 60;
        next.profile.subjectXp["Study Habits"] += 60;
        next.profile.level = progressToNextLevel(next.profile.totalXp).level;
        next.profile.rankTitle = getRankTitle(next.profile.level);
        next.profile.skillTrees = buildSkillTrees(next.profile.subjectXp);
        next.profile.masteryScore = Math.round(Object.values(next.profile.subjectXp).reduce((sum, value) => sum + value, 0) / subjectPaths.length);
        next = { ...next, profile: { ...next.profile }, comboCount: Math.min(5, next.comboCount + 1) };
      }

      return next;
    });

    setPomodoroBonusReady(false);
    setStatusMessage(pomodoroBonusReady ? "Quest cleared with a Pomodoro bonus." : "Quest cleared and progress updated.");
  }

  function handleNewTermReset() {
    if (!profile) {
      return;
    }

    setData((current) => startNewTerm(current));
    setStatusMessage("New-term boost activated. Long-term progress carries forward while the semester resets cleanly.");
  }

  function handleStartQuestTimer(quest: GeneratedQuest) {
    setTimer({ questId: quest.id, label: `${quest.title} timer`, remainingSeconds: quest.timerMinutes * 60, mode: "quest" });
  }

  function handleStartPomodoro() {
    setTimer({ questId: "pomodoro", label: "Pomodoro focus block", remainingSeconds: 25 * 60, mode: "pomodoro" });
    setPomodoroBonusReady(false);
  }

  if (!data.session) {
    return (
      <main className="screen-shell">
        <section className="auth-hero">
          <div className="hero-copy">
            <p className="eyebrow">Study XP</p>
            <h1>Make real schoolwork feel rewarding without pretending it is fantasy.</h1>
            <p className="lede">
              Study XP is a school-first dashboard that turns real classes, assignments, and focus time into levels, streaks, XP, and clear next steps.
            </p>
            <div className="feature-strip">
              <FeaturePill text="Real classes" />
              <FeaturePill text="XP and streaks" />
              <FeaturePill text="Focus tools" />
              <FeaturePill text="Cloud-ready sync" />
            </div>
          </div>

          <div className="panel auth-panel">
            <h2>Start your account</h2>
            <p className="panel-copy">{statusMessage}</p>
            <form className="auth-form" onSubmit={handleLocalStart}>
              <label>
                <span>Display name</span>
                <input value={authForm.displayName} onChange={(event) => setAuthForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Ava Martinez" />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="student@email.com" />
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="For cloud sign-in" />
              </label>
              <div className="button-row">
                <button className="button primary" type="submit">Continue in local mode</button>
                <button className="button secondary" type="button" disabled={!firebaseReady} onClick={() => void handleCloudEmail(false)}>Cloud sign in</button>
                <button className="button secondary" type="button" disabled={!firebaseReady} onClick={() => void handleCloudEmail(true)}>Create cloud account</button>
                <button className="button ghost" type="button" disabled={!firebaseReady} onClick={() => void handleGoogleAuth()}>Google</button>
              </div>
            </form>
            <div className="button-row auth-tools">
              <button className="button ghost" type="button" onClick={() => setShowCloudSetup((current) => !current)}>
                {showCloudSetup ? "Hide cloud setup" : firebaseReady ? "Edit cloud setup" : "Set up cloud sync"}
              </button>
              {firebaseConfigSource === "browser" && (
                <button className="button ghost" type="button" onClick={handleClearCloudSetup}>
                  Clear saved setup
                </button>
              )}
            </div>
            {showCloudSetup && (
              <form className="panel config-panel" onSubmit={handleSaveCloudSetup}>
                <SectionHeader
                  title="Cloud Setup"
                  subtitle="Paste your Firebase web app keys here. This is the public client config Firebase expects in browser apps."
                />
                <div className="card-grid config-grid">
                  <label className="wide">
                    <span>API key</span>
                    <input value={firebaseConfigDraft.apiKey} onChange={(event) => updateFirebaseConfigDraft(setFirebaseConfigDraft, "apiKey", event.target.value)} placeholder="AIza..." />
                  </label>
                  <label>
                    <span>Auth domain</span>
                    <input value={firebaseConfigDraft.authDomain} onChange={(event) => updateFirebaseConfigDraft(setFirebaseConfigDraft, "authDomain", event.target.value)} placeholder="your-app.firebaseapp.com" />
                  </label>
                  <label>
                    <span>Project ID</span>
                    <input value={firebaseConfigDraft.projectId} onChange={(event) => updateFirebaseConfigDraft(setFirebaseConfigDraft, "projectId", event.target.value)} placeholder="your-project-id" />
                  </label>
                  <label>
                    <span>Storage bucket</span>
                    <input value={firebaseConfigDraft.storageBucket} onChange={(event) => updateFirebaseConfigDraft(setFirebaseConfigDraft, "storageBucket", event.target.value)} placeholder="your-app.firebasestorage.app" />
                  </label>
                  <label>
                    <span>Messaging sender ID</span>
                    <input value={firebaseConfigDraft.messagingSenderId} onChange={(event) => updateFirebaseConfigDraft(setFirebaseConfigDraft, "messagingSenderId", event.target.value)} placeholder="1234567890" />
                  </label>
                  <label>
                    <span>App ID</span>
                    <input value={firebaseConfigDraft.appId} onChange={(event) => updateFirebaseConfigDraft(setFirebaseConfigDraft, "appId", event.target.value)} placeholder="1:1234567890:web:abcdef" />
                  </label>
                </div>
                <div className="button-row">
                  <button className="button primary" type="submit">Save cloud setup</button>
                  {firebaseConfigSource === "browser" && (
                    <button className="button secondary" type="button" onClick={handleClearCloudSetup}>
                      Remove saved keys
                    </button>
                  )}
                </div>
                <p className="note">
                  If you want Google sign-in to work, add `study-xp.pages.dev` and any custom domain to Firebase Auth authorized domains.
                </p>
              </form>
            )}
            <p className="note">
              {firebaseReady
                ? firebaseConfigSource === "env"
                  ? "Cloud sync is configured for this site, so email and Google auth can sync progress to Firestore."
                  : "Cloud sync is configured in this browser, so email and Google auth are ready on this device."
                : "Cloud sync is not set up yet. Add your Firebase web app keys below once, then the cloud login buttons will turn on."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!data.onboardingComplete) {
    return (
      <main className="screen-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Setup</p>
            <h1>Build your real school dashboard</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-badge">{data.session.cloudEnabled ? "Cloud ready" : "Local only"}</span>
            <button className="button ghost" onClick={() => void handleSignOut()}>Sign out</button>
          </div>
        </header>

        <section className="setup-grid">
          <div className="panel">
            <SectionHeader title="Student Profile" subtitle="One real student profile built for school." />
            <div className="stack">
              <div className="card-grid">
                <div className="avatar-preview" style={{ background: getAvatarTheme(profileDraft.avatarTheme).background }}>
                  <span>{initialsFor(profileDraft.name || profileDraft.gradeLevel || "SX")}</span>
                </div>
                <label>
                  <span>Name</span>
                  <input value={profileDraft.name} onChange={(event) => updateProfileDraft(setProfileDraft, "name", event.target.value)} placeholder="Ava Martinez" />
                </label>
                <label>
                  <span>Grade level</span>
                  <input value={profileDraft.gradeLevel} onChange={(event) => updateProfileDraft(setProfileDraft, "gradeLevel", event.target.value)} placeholder="8th Grade" />
                </label>
                <label className="wide">
                  <span>Goal</span>
                  <input value={profileDraft.goal} onChange={(event) => updateProfileDraft(setProfileDraft, "goal", event.target.value)} placeholder="Raise algebra scores and stay consistent after school." />
                </label>
                <label className="wide">
                  <span>Avatar theme</span>
                  <select value={profileDraft.avatarTheme} onChange={(event) => updateProfileDraft(setProfileDraft, "avatarTheme", event.target.value)}>
                    {avatarThemes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="panel">
            <SectionHeader title="My Classes" subtitle="Classes stay real. The app adds structure, urgency, and rewards." />
            <div className="stack">
              {classDrafts.map((draft) => (
                <div className="card-grid" key={draft.id}>
                  <label>
                    <span>Class name</span>
                    <input value={draft.name} onChange={(event) => updateClassDraft(setClassDrafts, draft.id, "name", event.target.value)} placeholder="Algebra I" />
                  </label>
                  <label>
                    <span>Subject</span>
                    <select value={draft.subject} onChange={(event) => updateClassDraft(setClassDrafts, draft.id, "subject", event.target.value as SubjectPath)}>
                      {subjectPaths.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Teacher</span>
                    <input value={draft.teacher} onChange={(event) => updateClassDraft(setClassDrafts, draft.id, "teacher", event.target.value)} placeholder="Mr. Carter" />
                  </label>
                  <label>
                    <span>Meeting pattern</span>
                    <input value={draft.meetingPattern} onChange={(event) => updateClassDraft(setClassDrafts, draft.id, "meetingPattern", event.target.value)} placeholder="Mon / Wed / Fri" />
                  </label>
                </div>
              ))}
            </div>
            <button className="button secondary" onClick={() => setClassDrafts((current) => [...current, createBlankClassDraft()])}>Add class</button>
          </div>

          <div className="panel">
            <SectionHeader title="Assignments" subtitle="Homework becomes daily quests. Tests and projects become higher-stakes missions." />
            <div className="stack">
              {assignmentDrafts.map((draft) => (
                <div className="card-grid" key={draft.id}>
                  <label className="wide">
                    <span>Title</span>
                    <input value={draft.title} onChange={(event) => updateAssignmentDraft(setAssignmentDrafts, draft.id, "title", event.target.value)} placeholder="Chapter 4 problem set" />
                  </label>
                  <label>
                    <span>Class</span>
                    <select value={draft.classId} onChange={(event) => updateAssignmentDraft(setAssignmentDrafts, draft.id, "classId", event.target.value)}>
                      <option value="">Choose class</option>
                      {classDrafts.map((item) => <option key={item.id} value={item.id}>{item.name || "Untitled class"}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Type</span>
                    <select value={draft.type} onChange={(event) => updateAssignmentDraft(setAssignmentDrafts, draft.id, "type", event.target.value as AssignmentDraft["type"])}>
                      <option value="homework">Homework</option>
                      <option value="reading">Reading</option>
                      <option value="quiz">Quiz</option>
                      <option value="test">Test</option>
                      <option value="project">Project</option>
                      <option value="routine">Routine</option>
                    </select>
                  </label>
                  <label>
                    <span>Due date</span>
                    <input type="date" value={draft.dueDate} onChange={(event) => updateAssignmentDraft(setAssignmentDrafts, draft.id, "dueDate", event.target.value)} />
                  </label>
                  <label>
                    <span>Minutes</span>
                    <input type="number" min="10" step="5" value={draft.estimatedMinutes} onChange={(event) => updateAssignmentDraft(setAssignmentDrafts, draft.id, "estimatedMinutes", Number(event.target.value))} />
                  </label>
                </div>
              ))}
            </div>
            <button className="button secondary" onClick={() => setAssignmentDrafts((current) => [...current, createBlankAssignmentDraft(classDrafts[0]?.id ?? "")])}>Add assignment</button>
          </div>
        </section>

        <section className="panel onboarding-summary">
          <SectionHeader title="What Gets Generated Automatically" subtitle="Everything stays grounded in real schoolwork while still feeling rewarding." />
          <div className="feature-grid">
            <FeatureCard title="Quest engine" text="Assignments turn into daily tasks, test prep sessions, focus blocks, and catch-up missions." />
            <FeatureCard title="Skill tracking" text="Math, Reading, Science, Writing, and Study Habits each get their own XP and unlocks." />
            <FeatureCard title="Class dashboards" text="Every class keeps its real teacher and meeting pattern while showing where effort pays off." />
            <FeatureCard title="Focus support" text="Pomodoro mode, streak shields, combo bonuses, and low-energy recovery paths are built in." />
          </div>
          <div className="button-row">
            <button className="button primary" onClick={handleGenerateWorkspace}>Build my dashboard</button>
          </div>
        </section>
      </main>
    );
  }

  const levelProgress = profile ? progressToNextLevel(profile.totalXp) : null;

  return (
    <main className="screen-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Study XP Dashboard</p>
          <h1>{profile ? `${profile.name}'s school dashboard` : "School dashboard"}</h1>
          <p className="panel-copy">{statusMessage}</p>
        </div>
        <div className="topbar-actions">
          <label className="toggle">
            <input type="checkbox" checked={privateMode} onChange={(event) => setPrivateMode(event.target.checked)} />
            <span>Private mode</span>
          </label>
          <select className="mode-select" value={playMode} onChange={(event) => setPlayMode(event.target.value as typeof playMode)}>
            <option>Chill</option>
            <option>Competitive</option>
            <option>Exam Week</option>
          </select>
          <span className={`status-badge ${syncState}`}>{data.session.cloudEnabled ? `Cloud ${syncState}` : "Local save"}</span>
          <button className="button ghost" onClick={handleReopenSetup}>Edit setup</button>
          <button className="button ghost" onClick={() => void handleSignOut()}>Sign out</button>
        </div>
      </header>

      <section className="dashboard-grid">
        <article className="panel hero-card">
          <div className="hero-character">
            {profile && <AvatarBadge profile={profile} large />}
            <div>
              <p className="eyebrow">Student Profile</p>
              <h2>{profile?.name}</h2>
              <p className="hero-meta">{profile?.gradeLevel} / Level {profile?.level} / {profile?.rankTitle}</p>
              <p className="panel-copy">{profile?.goal}</p>
            </div>
          </div>
          {levelProgress && (
            <div className="level-block">
              <div className="level-inline">
                <strong>True level {levelProgress.level}</strong>
                <span>{levelProgress.currentIntoLevel}/{levelProgress.needed} XP to next level</span>
              </div>
              <div className="progress-bar"><span style={{ width: `${(levelProgress.currentIntoLevel / levelProgress.needed) * 100}%` }} /></div>
            </div>
          )}
          <div className="metric-grid">
            <MetricCard label="Term resets" value={String(profile?.termResets ?? 0)} note="New-term boosts after a strong semester." hidden={privateMode} />
            <MetricCard label="Streak" value={`${profile?.streak ?? 0} days`} note="Protected by recovery paths." hidden={false} />
            <MetricCard label="Mastery" value={`${profile?.masteryScore ?? 0}`} note="Average subject XP strength." hidden={privateMode} />
            <MetricCard label="Semester" value={`${semesterProgress}%`} note="Tracks setup, consistency, and big work." hidden={false} />
          </div>
          <div className="button-row">
            <button className="button secondary" onClick={handleStartPomodoro}>Start Pomodoro</button>
            <button className="button secondary" onClick={handleNewTermReset} disabled={!profile || !canStartNewTerm(profile, data.milestones)}>Start new-term boost</button>
          </div>
        </article>

        <article className="panel">
          <SectionHeader title="Best Next Task" subtitle={`${playMode} mode adjusts urgency and pressure.`} />
          {bestNextQuest ? (
            <div className="best-next-card">
              <div>
                <span className={`quest-tag ${bestNextQuest.type}`}>{questTypeLabel(bestNextQuest.type)}</span>
                <h3>{bestNextQuest.title}</h3>
                <p>{bestNextQuest.subtitle}</p>
              </div>
              <div className="quest-metrics">
                <span>{formatDueLabel(bestNextQuest.dueDate)}</span>
                <span>{bestNextQuest.timerMinutes} min</span>
                <span>{bestNextQuest.xpReward} XP</span>
              </div>
              <div className="button-row">
                <button className="button primary" onClick={() => handleStartQuestTimer(bestNextQuest)}>Start timer</button>
                <button className="button secondary" onClick={() => handleCompleteQuest(bestNextQuest.id)}>Claim clear</button>
              </div>
            </div>
          ) : <p className="panel-copy">All current quests are cleared. Add more assignments in setup to generate the next wave.</p>}

          <div className="timer-card">
            <h3>Focus timer</h3>
            <p>{timer ? timer.label : "No active timer"}</p>
            <strong>{timer ? formatTimer(timer.remainingSeconds) : pomodoroBonusReady ? "Bonus ready" : "25:00"}</strong>
            <span>{pomodoroBonusReady ? "Your next quest gets a +60 XP Pomodoro bonus." : "Pomodoro mode and quest timers live here."}</span>
          </div>
        </article>
      </section>

      <section className="dashboard-grid secondary">
        <article className="panel">
          <SectionHeader title="Subject XP" subtitle="See exactly where your progress is coming from." />
          {profile && (
            <div className="subject-progress-grid">
              {subjectPaths.map((subject) => (
                <div className="metric-card" key={subject}>
                  <span>{subject}</span>
                  <strong>{privateMode ? "Hidden" : `${profile.subjectXp[subject]} XP`}</strong>
                  <div className="progress-bar compact">
                    <span style={{ width: `${Math.min(100, (profile.subjectXp[subject] / 480) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <SectionHeader title="Stats" subtitle="Focus, Speed, Memory, and Consistency grow with completed work." />
          {profile && (
            <div className="stats-stack">
              {Object.entries(profile.statPoints).map(([key, value]) => <StatRow key={key} label={key} value={value} />)}
            </div>
          )}
          <div className="rewards-row">
            <RewardChip label={`Streak shields: ${data.streakProtection}`} />
            <RewardChip label={`Combo chain: ${data.comboCount}`} />
            <RewardChip label={pomodoroBonusReady ? "Pomodoro buff armed" : "Pomodoro buff idle"} />
          </div>
        </article>
      </section>

      <section className="dashboard-grid tertiary">
        <article className="panel">
          <SectionHeader title="Classes" subtitle="Real classes, teachers, and meeting patterns with clear reward focus." />
          <div className="zone-grid">
            {data.classes.map((course) => (
              <div className="zone-card" key={course.id} style={{ borderColor: `${course.accent}55` }}>
                <div className="quest-line">
                  <span className="quest-tag neutral">{course.subject}</span>
                  <span className="accent-dot" style={{ background: course.accent }} />
                </div>
                <h3>{course.name}</h3>
                <p>{course.teacher}</p>
                <span>{course.meetingPattern}</span>
                <small>Best for {course.focusArea} through {course.studyStyle}.</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionHeader title="Upcoming Work" subtitle="Real due dates still drive priority." />
          <div className="due-list">
            {dueSoon.map((assignment) => (
              <div className="due-item" key={assignment.id}>
                <div>
                  <strong>{assignment.title}</strong>
                  <span>{assignment.type} / {formatDueLabel(assignment.dueDate)}</span>
                </div>
                <span className={`quest-tag ${assignment.status}`}>{assignment.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <SectionHeader title="Quest Board" subtitle="Generated from your assignments, routines, catch-up paths, and focus tools." />
        <div className="quest-board">
          {data.quests.map((quest) => (
            <article className={`quest-card ${quest.completed ? "complete" : ""}`} key={quest.id}>
              <div className="quest-line">
                <span className={`quest-tag ${quest.type}`}>{questTypeLabel(quest.type)}</span>
                <span>{formatDueLabel(quest.dueDate)}</span>
              </div>
              <h3>{quest.title}</h3>
              <p>{quest.subtitle}</p>
              <div className="quest-metrics">
                <span>{quest.xpReward} XP</span>
                <span>{quest.timerMinutes} min</span>
                <span>{quest.energy} energy</span>
              </div>
              <ul className="checkpoint-list">
                {quest.checkpoints.map((checkpoint) => <li key={checkpoint}>{checkpoint}</li>)}
              </ul>
              <div className="proof-row">
                {quest.proof.map((proof) => <span className="proof-chip" key={proof}>{proof}</span>)}
              </div>
              <div className="button-row">
                <button className="button secondary" disabled={quest.completed} onClick={() => handleStartQuestTimer(quest)}>Timer</button>
                <button className="button primary" disabled={quest.completed} onClick={() => handleCompleteQuest(quest.id)}>
                  {quest.completed ? "Cleared" : "Claim clear"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-grid tertiary">
        <article className="panel">
          <SectionHeader title="Skill Trees" subtitle="Each subject has a separate progression line tied to real work." />
          {profile && (
            <div className="skill-grid">
              {subjectPaths.map((subject) => (
                <div className="skill-card" key={subject}>
                  <div className="skill-head">
                    <strong>{subject}</strong>
                    <span>{profile.subjectXp[subject]} XP</span>
                  </div>
                  <div className="skill-nodes">
                    {profile.skillTrees[subject].map((node) => (
                      <div className={`skill-node ${node.unlocked ? "unlocked" : ""}`} key={node.id}>
                        <strong>{node.name}</strong>
                        <span>{node.bonus}</span>
                        <small>{node.description}</small>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <SectionHeader title="Semester Milestones" subtitle="Progress checkpoints based on setup, on-time work, and major assignments." />
          <div className="story-grid">
            {data.milestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, note, hidden }: { label: string; value: string; note: string; hidden: boolean }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{hidden ? "Hidden" : value}</strong>
      <small>{note}</small>
    </div>
  );
}

function AvatarBadge({ profile, large = false }: { profile: StudentProfile; large?: boolean }) {
  const theme = getAvatarTheme(profile.avatarTheme);
  return (
    <div className={`avatar-badge ${large ? "large" : ""}`} style={{ background: theme.background }}>
      <span>{initialsFor(profile.name)}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-row">
      <div className="quest-line">
        <span>{capitalize(label)}</span>
        <span>{value}</span>
      </div>
      <div className="progress-bar compact">
        <span style={{ width: `${Math.min(100, value * 8)}%` }} />
      </div>
    </div>
  );
}

function MilestoneCard({ milestone }: { milestone: ProgressMilestone }) {
  return (
    <div className="story-card">
      <div className="quest-line">
        <span className="quest-tag neutral">{milestone.label}</span>
        <span>{milestone.progress}%</span>
      </div>
      <h3>{milestone.title}</h3>
      <p>{milestone.summary}</p>
      <div className="progress-bar compact"><span style={{ width: `${milestone.progress}%` }} /></div>
      <small>{milestone.reward}</small>
    </div>
  );
}

function RewardChip({ label }: { label: string }) {
  return <span className="reward-chip">{label}</span>;
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="feature-card">
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}

function FeaturePill({ text }: { text: string }) {
  return <span className="reward-chip">{text}</span>;
}

function updateProfileDraft(
  setDraft: Dispatch<SetStateAction<StudentProfileDraft>>,
  field: keyof StudentProfileDraft,
  value: string
) {
  setDraft((current) => ({ ...current, [field]: value }));
}

function updateFirebaseConfigDraft(
  setDraft: Dispatch<SetStateAction<FirebaseClientConfig>>,
  field: keyof FirebaseClientConfig,
  value: string
) {
  setDraft((current) => ({ ...current, [field]: value }));
}

function updateClassDraft(
  setDrafts: Dispatch<SetStateAction<ClassDraft[]>>,
  id: string,
  field: keyof ClassDraft,
  value: string
) {
  setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, [field]: value } : draft));
}

function updateAssignmentDraft(
  setDrafts: Dispatch<SetStateAction<AssignmentDraft[]>>,
  id: string,
  field: keyof AssignmentDraft,
  value: string | number
) {
  setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, [field]: value } : draft));
}

function toProfileDraft(profile: StudentProfile): StudentProfileDraft {
  return {
    name: profile.name,
    gradeLevel: profile.gradeLevel,
    goal: profile.goal,
    avatarTheme: profile.avatarTheme
  };
}

function toClassDraft(course: ClassCourse): ClassDraft {
  return { id: course.id, name: course.name, subject: course.subject, teacher: course.teacher, meetingPattern: course.meetingPattern };
}

function toAssignmentDraft(assignment: Assignment): AssignmentDraft {
  return { id: assignment.id, classId: assignment.classId, title: assignment.title, type: assignment.type, dueDate: assignment.dueDate, estimatedMinutes: assignment.estimatedMinutes, status: assignment.status };
}

function getBestNextQuest(quests: GeneratedQuest[], mode: "Chill" | "Competitive" | "Exam Week") {
  const ready = quests.filter((quest) => !quest.completed);
  if (!ready.length) {
    return null;
  }

  return [...ready].sort((left, right) => scoreQuest(right, mode) - scoreQuest(left, mode))[0];
}

function scoreQuest(quest: GeneratedQuest, mode: "Chill" | "Competitive" | "Exam Week") {
  const dueWeight = quest.dueDate <= todayIso() ? 35 : 12;
  const typeWeight = quest.type === "boss" ? 30 : quest.type === "legendary" ? 24 : quest.type === "rescue" ? 28 : 10;
  const modeWeight = mode === "Chill" ? (quest.energy === "low" ? 18 : 4) : mode === "Competitive" ? quest.xpReward / 4 : (quest.type === "boss" || quest.type === "rescue" ? 24 : 8);
  return dueWeight + typeWeight + modeWeight + quest.difficulty * 6;
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function questTypeLabel(type: QuestType) {
  if (type === "boss") {
    return "test prep";
  }

  if (type === "legendary") {
    return "big milestone";
  }

  if (type === "rescue") {
    return "catch-up";
  }

  if (type === "stealth") {
    return "low energy";
  }

  if (type === "routine") {
    return "routine";
  }

  return "daily";
}

function initialsFor(value: string) {
  return value.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "SX";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default App;
