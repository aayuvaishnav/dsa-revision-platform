import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../FireBase/firebase";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "./Navbar";
import { getRevisionDays } from "../utils/settings";
import "./DashboardPage.css";

const predefinedTopics = [
    "Array", "String", "Linked List", "Stack", "Queue", "Tree", "Graph",
    "Dynamic Programming", "Greedy", "Backtracking", "Binary Search",
];

/* ─── Helpers ────────────────────────────────────────────────────── */
const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return "yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const toDateKey = (d) => d.toISOString().slice(0, 10);

/* ─── SVG Donut ──────────────────────────────────────────────────── */
const DonutChart = ({ easy, medium, hard }) => {
    const total = easy + medium + hard;
    if (total === 0) {
        return (
            <div className="donut-container">
                <svg viewBox="0 0 120 120" className="donut-svg">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" strokeWidth="14" />
                    <text x="60" y="56" textAnchor="middle" className="donut-total">0</text>
                    <text x="60" y="72" textAnchor="middle" className="donut-label">problems</text>
                </svg>
            </div>
        );
    }

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const easyLen = (easy / total) * circumference;
    const medLen = (medium / total) * circumference;
    const hardLen = (hard / total) * circumference;

    const easyOffset = 0;
    const medOffset = easyLen;
    const hardOffset = easyLen + medLen;

    return (
        <div className="donut-container">
            <svg viewBox="0 0 120 120" className="donut-svg">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="14" />
                {easy > 0 && (
                    <circle
                        cx="60" cy="60" r={radius} fill="none"
                        stroke="var(--color-easy)" strokeWidth="14"
                        strokeDasharray={`${easyLen} ${circumference - easyLen}`}
                        strokeDashoffset={-easyOffset}
                        className="donut-segment"
                    />
                )}
                {medium > 0 && (
                    <circle
                        cx="60" cy="60" r={radius} fill="none"
                        stroke="var(--color-medium)" strokeWidth="14"
                        strokeDasharray={`${medLen} ${circumference - medLen}`}
                        strokeDashoffset={-medOffset}
                        className="donut-segment"
                    />
                )}
                {hard > 0 && (
                    <circle
                        cx="60" cy="60" r={radius} fill="none"
                        stroke="var(--color-hard)" strokeWidth="14"
                        strokeDasharray={`${hardLen} ${circumference - hardLen}`}
                        strokeDashoffset={-hardOffset}
                        className="donut-segment"
                    />
                )}
                <text x="60" y="56" textAnchor="middle" className="donut-total">{total}</text>
                <text x="60" y="72" textAnchor="middle" className="donut-label">problems</text>
            </svg>
            <div className="donut-legend">
                <span className="legend-item"><span className="legend-dot legend-easy" /> Easy ({easy})</span>
                <span className="legend-item"><span className="legend-dot legend-medium" /> Medium ({medium})</span>
                <span className="legend-item"><span className="legend-dot legend-hard" /> Hard ({hard})</span>
            </div>
        </div>
    );
};

/* ─── Topic Bars ─────────────────────────────────────────────────── */
const TopicBars = ({ questions }) => {
    const counts = useMemo(() => {
        const map = {};
        predefinedTopics.forEach((t) => { map[t] = 0; });
        questions.forEach((q) => {
            if (q.topic && map.hasOwnProperty(q.topic)) map[q.topic]++;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [questions]);

    const max = Math.max(...counts.map(([, c]) => c), 1);

    return (
        <div className="topic-bars">
            {counts.map(([topic, count]) => (
                <div key={topic} className="bar-row">
                    <span className="bar-topic">{topic}</span>
                    <div className="bar-track">
                        <div
                            className="bar-fill"
                            style={{ width: `${(count / max) * 100}%` }}
                        />
                    </div>
                    <span className="bar-count">{count}</span>
                </div>
            ))}
        </div>
    );
};

/* ─── Activity Heatmap ───────────────────────────────────────────── */
const ActivityHeatmap = ({ questions }) => {
    const { cells, maxCount } = useMemo(() => {
        const revMap = {};
        questions.forEach((q) => {
            if (q.lastRevised) {
                const key = toDateKey(new Date(q.lastRevised));
                revMap[key] = (revMap[key] || 0) + 1;
            }
        });

        const today = new Date();
        const cells = [];
        let mc = 0;
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = toDateKey(d);
            const count = revMap[key] || 0;
            if (count > mc) mc = count;
            cells.push({ key, count, day: d.toLocaleDateString("en-US", { weekday: "short" })[0], date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
        }
        return { cells, maxCount: mc };
    }, [questions]);

    const getLevel = (count) => {
        if (count === 0) return 0;
        if (maxCount <= 1) return 4;
        const ratio = count / maxCount;
        if (ratio <= 0.25) return 1;
        if (ratio <= 0.5) return 2;
        if (ratio <= 0.75) return 3;
        return 4;
    };

    return (
        <div className="heatmap-section">
            <div className="heatmap-grid">
                {cells.map((c) => (
                    <div
                        key={c.key}
                        className={`heatmap-cell level-${getLevel(c.count)}`}
                        title={`${c.date}: ${c.count} revision${c.count !== 1 ? "s" : ""}`}
                    />
                ))}
            </div>
            <div className="heatmap-legend">
                <span className="heatmap-legend-label">Less</span>
                <div className="heatmap-cell level-0 mini" />
                <div className="heatmap-cell level-1 mini" />
                <div className="heatmap-cell level-2 mini" />
                <div className="heatmap-cell level-3 mini" />
                <div className="heatmap-cell level-4 mini" />
                <span className="heatmap-legend-label">More</span>
            </div>
        </div>
    );
};

/* ─── Main Dashboard ─────────────────────────────────────────────── */
const DashboardPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => {
            setUser(u);
            if (u) fetchQuestions(u.uid);
            else { setQuestions([]); setLoading(false); }
        });
        return () => unsub();
    }, []);

    const fetchQuestions = async (uid) => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, "users", uid, "questions"));
            setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    /* Stats */
    const stats = useMemo(() => {
        const easy = questions.filter((q) => q.difficulty === "Easy").length;
        const medium = questions.filter((q) => (q.difficulty || "Medium") === "Medium").length;
        const hard = questions.filter((q) => q.difficulty === "Hard").length;

        const revisionDays = getRevisionDays();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - revisionDays);
        const cutoffStr = cutoff.toISOString();
        const due = questions.filter((q) => !q.lastRevised || q.lastRevised < cutoffStr).length;

        const totalRevisions = questions.filter((q) => q.lastRevised).length;

        // Streak: consecutive days ending today with at least one revision
        const revDates = new Set();
        questions.forEach((q) => {
            if (q.lastRevised) revDates.add(toDateKey(new Date(q.lastRevised)));
        });
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            if (revDates.has(toDateKey(d))) streak++;
            else break;
        }

        return { easy, medium, hard, total: questions.length, due, totalRevisions, streak };
    }, [questions]);

    /* Recent activity */
    const recentActivity = useMemo(() => {
        return [...questions]
            .filter((q) => q.lastRevised)
            .sort((a, b) => (b.lastRevised || "").localeCompare(a.lastRevised || ""))
            .slice(0, 5);
    }, [questions]);

    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-container">
                {loading ? (
                    <p className="loading-message">Loading analytics...</p>
                ) : !user ? (
                    <p className="loading-message">Please log in to view analytics.</p>
                ) : (
                    <>
                        <div className="dash-header">
                            <h1 className="dash-title">Analytics Dashboard</h1>
                            <p className="dash-subtitle">Your DSA progress at a glance</p>
                        </div>

                        {/* ─── Hero Stat Cards ─────────────────────── */}
                        <div className="stat-cards">
                            <div className="stat-card card-total">
                                <div className="stat-card-icon">📊</div>
                                <div className="stat-card-body">
                                    <span className="stat-card-value">{stats.total}</span>
                                    <span className="stat-card-label">Total Problems</span>
                                </div>
                            </div>
                            <div className="stat-card card-easy">
                                <div className="stat-card-icon">🟢</div>
                                <div className="stat-card-body">
                                    <span className="stat-card-value">{stats.easy}</span>
                                    <span className="stat-card-label">Easy</span>
                                </div>
                            </div>
                            <div className="stat-card card-medium">
                                <div className="stat-card-icon">🟡</div>
                                <div className="stat-card-body">
                                    <span className="stat-card-value">{stats.medium}</span>
                                    <span className="stat-card-label">Medium</span>
                                </div>
                            </div>
                            <div className="stat-card card-hard">
                                <div className="stat-card-icon">🔴</div>
                                <div className="stat-card-body">
                                    <span className="stat-card-value">{stats.hard}</span>
                                    <span className="stat-card-label">Hard</span>
                                </div>
                            </div>
                        </div>

                        {/* ─── Two-column charts ──────────────────── */}
                        <div className="charts-row">
                            <div className="chart-card">
                                <h2 className="chart-title">Difficulty Breakdown</h2>
                                <DonutChart easy={stats.easy} medium={stats.medium} hard={stats.hard} />
                            </div>
                            <div className="chart-card">
                                <h2 className="chart-title">Revision Streak</h2>
                                <div className="streak-section">
                                    <div className="streak-big">
                                        <span className="streak-number">{stats.streak}</span>
                                        <span className="streak-unit">day{stats.streak !== 1 ? "s" : ""}</span>
                                    </div>
                                    <p className="streak-caption">
                                        {stats.streak > 0
                                            ? "🔥 Keep going! You're on a roll!"
                                            : "Start revising today to build your streak!"}
                                    </p>
                                    <div className="revision-mini-stats">
                                        <div className="mini-stat">
                                            <span className="mini-stat-val">{stats.totalRevisions}</span>
                                            <span className="mini-stat-lbl">Revised</span>
                                        </div>
                                        <div className="mini-stat">
                                            <span className="mini-stat-val">{stats.due}</span>
                                            <span className="mini-stat-lbl">Due</span>
                                        </div>
                                        <div className="mini-stat">
                                            <span className="mini-stat-val">{stats.total - stats.totalRevisions}</span>
                                            <span className="mini-stat-lbl">Never revised</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── Activity Heatmap ───────────────────── */}
                        <div className="chart-card full-width">
                            <h2 className="chart-title">Revision Activity — Last 30 Days</h2>
                            <ActivityHeatmap questions={questions} />
                        </div>

                        {/* ─── Topic Distribution ─────────────────── */}
                        <div className="chart-card full-width">
                            <h2 className="chart-title">Questions by Topic</h2>
                            <TopicBars questions={questions} />
                        </div>

                        {/* ─── Recent Activity ─────────────────────── */}
                        {recentActivity.length > 0 && (
                            <div className="chart-card full-width">
                                <h2 className="chart-title">Recent Activity</h2>
                                <div className="activity-list">
                                    {recentActivity.map((q) => (
                                        <div key={q.id} className="activity-item">
                                            <div className="activity-dot" />
                                            <div className="activity-info">
                                                <span className="activity-name">{q.question}</span>
                                                <span className="activity-meta">
                                                    <span className={`badge badge-${(q.difficulty || "Medium").toLowerCase()}`}>
                                                        {q.difficulty || "Medium"}
                                                    </span>
                                                    <span className="activity-time">{formatDate(q.lastRevised)}</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
