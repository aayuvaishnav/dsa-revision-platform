import React, { useState, useEffect } from "react";
import { db, auth } from "../FireBase/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import "./HomePage.css";
import Popup from "./PopUp";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./Toast";
import { getRevisionDays } from "../utils/settings";

const predefinedTopics = [
  "Array", "String", "Linked List", "Stack", "Queue", "Tree", "Graph",
  "Dynamic Programming", "Greedy", "Backtracking", "Binary Search",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const SOURCES = ["", "LeetCode", "Codeforces", "GeeksForGeeks", "HackerRank", "Other"];

const HomePage = () => {
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("");
  const [newSource, setNewSource] = useState("");
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [user, setUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isRandomPopupOpen, setIsRandomPopupOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [openTopics, setOpenTopics] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [addQuestionLoading, setAddQuestionLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editQuestionLoading, setEditQuestionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("topic"); // topic | date | difficulty
  const [revisingId, setRevisingId] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importInputRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchQuestions(currentUser.uid);
      } else {
        setQuestions([]);
        setOpenTopics({});
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName);
      if (e.key === "/" && !inInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.key === "r" || e.key === "R") && !inInput && questions.length > 0) {
        getRandomQuestion(false);
      }
      if (e.key === "Escape") {
        setIsPopupOpen(false);
        closeEditPopup();
        closeDeleteConfirm();
        setIsRandomPopupOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [questions.length]);

  const fetchQuestions = async (userId) => {
    if (!userId) return;

    setQuestionsLoading(true);
    try {
      const userQuestionsRef = collection(db, "users", userId, "questions");
      const querySnapshot = await getDocs(userQuestionsRef);

      const fetchedQuestions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions: ", error);
      toast.error("Failed to fetch questions. Please try again.");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error("Please enter the question description.");
      return;
    }
    if (!newLink.trim()) {
      toast.error("Please enter the problem link.");
      return;
    }
    try {
      new URL(newLink); // Basic URL validation
    } catch (_) {
      toast.error("Please enter a valid URL for the problem link (e.g., https://...).");
      return;
    }
    if (!selectedTopic) {
      toast.error("Please select a topic.");
      return;
    }
    if (!newDifficulty) {
      toast.error("Please select difficulty.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to add questions.");
      return;
    }

    const userQuestionsRef = collection(db, "users", user.uid, "questions");
    const now = new Date().toISOString();
    const newProblem = {
      question: newQuestion.trim(),
      link: newLink.trim(),
      topic: selectedTopic,
      difficulty: newDifficulty,
      source: newSource.trim() || null,
      createdAt: now,
      lastRevised: null,
    };

    setAddQuestionLoading(true);
    try {
      const docRef = await addDoc(userQuestionsRef, newProblem);

      const questionToAddLocally = { ...newProblem, id: docRef.id };
      setQuestions((prevQuestions) => [...prevQuestions, questionToAddLocally]);

      // Reset form and close popup
      setNewQuestion("");
      setNewLink("");
      setSelectedTopic("");
      setNewDifficulty("");
      setNewSource("");
      setIsPopupOpen(false);

      // Open the topic to show newly added question
      setOpenTopics(prev => ({ ...prev, [selectedTopic]: true }));
    } catch (error) {
      console.error("Firestore Error while adding question:", error);
      toast.error("Failed to add question. Check console for details.");
    } finally {
      setAddQuestionLoading(false);
    }
  };

  const openEditPopup = (q) => {
    setEditingQuestion({
      id: q.id,
      question: q.question,
      link: q.link,
      topic: q.topic,
      difficulty: q.difficulty || "Medium",
      source: q.source || "",
    });
  };

  const closeEditPopup = () => {
    setEditingQuestion(null);
  };

  const updateQuestion = async () => {
    if (!editingQuestion || !user) return;
    if (!editingQuestion.question?.trim()) {
      toast.error("Please enter the question description.");
      return;
    }
    if (!editingQuestion.link?.trim()) {
      toast.error("Please enter the problem link.");
      return;
    }
    try {
      new URL(editingQuestion.link);
    } catch (_) {
      toast.error("Please enter a valid URL for the problem link.");
      return;
    }
    if (!editingQuestion.topic) {
      toast.error("Please select a topic.");
      return;
    }

    const docRef = doc(db, "users", user.uid, "questions", editingQuestion.id);
    const payload = {
      question: editingQuestion.question.trim(),
      link: editingQuestion.link.trim(),
      topic: editingQuestion.topic,
      difficulty: editingQuestion.difficulty || "Medium",
      source: editingQuestion.source?.trim() || null,
    };

    setEditQuestionLoading(true);
    try {
      await updateDoc(docRef, payload);
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? { ...q, ...payload } : q))
      );
      closeEditPopup();
    } catch (error) {
      console.error("Firestore Error while updating question:", error);
      toast.error("Failed to update question. Try again.");
    } finally {
      setEditQuestionLoading(false);
    }
  };

  const openDeleteConfirm = (q) => setQuestionToDelete(q);
  const closeDeleteConfirm = () => setQuestionToDelete(null);

  const deleteQuestion = async (q) => {
    if (!user || !q) return;

    setDeletingId(q.id);
    setQuestionToDelete(null);
    try {
      const docRef = doc(db, "users", user.uid, "questions", q.id);
      await deleteDoc(docRef);
      setQuestions((prev) => prev.filter((item) => item.id !== q.id));
      toast.success("Question deleted.");
    } catch (error) {
      console.error("Firestore Error while deleting question:", error);
      toast.error("Failed to delete question. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const markRevised = async (q) => {
    if (!user) return;
    const now = new Date().toISOString();
    setRevisingId(q.id);
    try {
      const docRef = doc(db, "users", user.uid, "questions", q.id);
      await updateDoc(docRef, { lastRevised: now });
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, lastRevised: now } : item))
      );
      toast.success("Marked as revised!");
    } catch (error) {
      toast.error("Failed to update.");
    } finally {
      setRevisingId(null);
    }
  };

  const getDueForRevision = () => {
    const revisionDays = getRevisionDays();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - revisionDays);
    const cutoffStr = cutoff.toISOString();
    return questions.filter(
      (q) => !q.lastRevised || q.lastRevised < cutoffStr
    );
  };

  const groupByTopic = (questionsList) => {
    const grouped = predefinedTopics.reduce((acc, topic) => {
      acc[topic] = [];
      return acc;
    }, {});

    questionsList.forEach((q) => {
      const topic = q.topic;
      if (topic && grouped.hasOwnProperty(topic)) {
        grouped[topic].push(q);
      } else if (topic) {
        if (!grouped["Others"]) grouped["Others"] = [];
        grouped["Others"].push(q);
      }
    });

    return grouped;
  };

  const toggleTopic = (topic) => {
    setOpenTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };

  const getRandomQuestion = (fromDueOnly = false) => {
    const pool = fromDueOnly ? getDueForRevision() : questions;
    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      setRandomQuestion(pool[randomIndex]);
      setIsRandomPopupOpen(true);
    } else {
      toast.info(fromDueOnly ? "No questions due for revision!" : "No questions available. Add some first!");
    }
  };

  // Filter and sort
  const filteredQuestions = questions
    .filter((q) => {
      const matchSearch =
        !searchQuery.trim() ||
        q.question?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiff =
        !filterDifficulty || (q.difficulty || "Medium") === filterDifficulty;
      return matchSearch && matchDiff;
    })
    .sort((a, b) => {
      if (sortBy === "topic") return (a.topic || "").localeCompare(b.topic || "");
      if (sortBy === "date")
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      if (sortBy === "difficulty") {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1);
      }
      return 0;
    });

  const groupedQuestions = groupByTopic(filteredQuestions);
  const dueForRevision = getDueForRevision();

  // Stats
  const stats = {
    total: questions.length,
    easy: questions.filter((q) => (q.difficulty || "Medium") === "Easy").length,
    medium: questions.filter((q) => (q.difficulty || "Medium") === "Medium").length,
    hard: questions.filter((q) => (q.difficulty || "Medium") === "Hard").length,
  };
  const topicCounts = predefinedTopics.reduce((acc, t) => {
    acc[t] = questions.filter((q) => q.topic === t).length;
    return acc;
  }, {});

  const exportQuestions = () => {
    const data = questions.map((q) => ({
      question: q.question,
      link: q.link,
      topic: q.topic,
      difficulty: q.difficulty || "Medium",
      source: q.source || null,
      createdAt: q.createdAt || null,
      lastRevised: q.lastRevised || null,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa-questions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded.");
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = "";
    setImportLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const list = Array.isArray(data) ? data : [data];
      const existingLinks = new Set(questions.map((q) => q.link));
      const userQuestionsRef = collection(db, "users", user.uid, "questions");
      let added = 0;
      const now = new Date().toISOString();
      for (const item of list) {
        if (!item.question || !item.link || !item.topic) continue;
        if (existingLinks.has(item.link)) continue;
        try {
          new URL(item.link);
        } catch (_) {
          continue;
        }
        await addDoc(userQuestionsRef, {
          question: String(item.question).trim(),
          link: String(item.link).trim(),
          topic: String(item.topic).trim(),
          difficulty: item.difficulty && DIFFICULTIES.includes(item.difficulty) ? item.difficulty : "Medium",
          source: item.source && String(item.source).trim() ? String(item.source).trim() : null,
          createdAt: item.createdAt || now,
          lastRevised: item.lastRevised || null,
        });
        existingLinks.add(item.link);
        added++;
      }
      if (added > 0) {
        await fetchQuestions(user.uid);
        toast.success(`Imported ${added} question(s).`);
      } else {
        toast.info("No new questions to import (duplicates skipped or invalid rows).");
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Invalid file or import failed. Use JSON from Export.");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="home-container">
        {user ? (
          <>
            {questionsLoading ? (
              <p className="loading-message">Loading your questions...</p>
            ) : (
              <>
                <div className="home-header">
                  <h1 className="heading-main">Your DSA Question Bank</h1>
                  <div className="add-problem-btn">
                    <button className="btn-primary" onClick={() => setIsPopupOpen(true)}>
                      + Add Question
                    </button>
                    <button
                      className="get-button"
                      onClick={() => getRandomQuestion(false)}
                      disabled={questions.length === 0}
                    >
                      Random
                    </button>
                    {dueForRevision.length > 0 && (
                      <button
                        className="btn-due"
                        onClick={() => getRandomQuestion(true)}
                        title="Pick random from due for revision"
                      >
                        Random (Due)
                      </button>
                    )}
                    <button type="button" className="btn-export" onClick={exportQuestions} disabled={questions.length === 0}>
                      Export
                    </button>
                    <button
                      type="button"
                      className="btn-export"
                      onClick={() => importInputRef.current?.click()}
                      disabled={importLoading}
                    >
                      {importLoading ? "Importing..." : "Import"}
                    </button>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportFile}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                <div className="stats-bar">
                  <span className="stat"><strong>{stats.total}</strong> total</span>
                  <span className="stat stat-easy"><strong>{stats.easy}</strong> Easy</span>
                  <span className="stat stat-medium"><strong>{stats.medium}</strong> Medium</span>
                  <span className="stat stat-hard"><strong>{stats.hard}</strong> Hard</span>
                  {dueForRevision.length > 0 && (
                    <span className="stat stat-due"><strong>{dueForRevision.length}</strong> due for revision</span>
                  )}
                </div>

                <div className="toolbar">
                  <div className="search-wrapper">
                    <span className="search-icon material-symbols-rounded">search</span>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="search-input"
                      placeholder="Search questions... (/)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="filter-select"
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                  >
                    <option value="">All difficulties</option>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="topic">Sort: Topic</option>
                    <option value="date">Sort: Newest</option>
                    <option value="difficulty">Sort: Difficulty</option>
                  </select>
                </div>

                {dueForRevision.length > 0 && (
                  <div className="due-section">
                    <div className="due-header-row">
                      <span className="due-icon material-symbols-rounded">schedule</span>
                      <h3 className="due-title">Due for revision ({getRevisionDays()}+ days ago)</h3>
                    </div>
                    <p className="due-subtitle">Practice these to keep them fresh.</p>
                    <div className="due-list">
                      {dueForRevision.slice(0, 8).map((q) => (
                        <div key={q.id} className="due-item">
                          <span className="due-item-text">{q.question}</span>
                          <div className="due-item-actions">
                            <a href={q.link} target="_blank" rel="noopener noreferrer" className="solve-link">Solve</a>
                            <button
                              type="button"
                              className="revised-btn"
                              onClick={() => markRevised(q)}
                              disabled={revisingId === q.id}
                            >
                              {revisingId === q.id ? "..." : "Mark revised"}
                            </button>
                          </div>
                        </div>
                      ))}
                      {dueForRevision.length > 8 && (
                        <p className="due-more">+{dueForRevision.length - 8} more</p>
                      )}
                    </div>
                  </div>
                )}

                <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                  <div className="popup-content">
                    <h3>Add Question</h3>
                    <div className="popup-inputs">
                      <input
                        type="text"
                        placeholder="Question description"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        required
                      />
                      <input
                        type="url"
                        placeholder="Problem link (LeetCode, etc.)"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        required
                      />
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="popup-select"
                        required
                      >
                        <option value="" disabled>Topic</option>
                        {predefinedTopics.map((topic) => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                      <select
                        value={newDifficulty}
                        onChange={(e) => setNewDifficulty(e.target.value)}
                        className="popup-select"
                        required
                      >
                        <option value="" disabled>Difficulty</option>
                        {DIFFICULTIES.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <select
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        className="popup-select"
                      >
                        <option value="">Source (optional)</option>
                        {SOURCES.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="popup-add-btn" onClick={addQuestion} disabled={addQuestionLoading}>
                        {addQuestionLoading ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>
                </Popup>

                <Popup isOpen={editingQuestion !== null} onClose={closeEditPopup}>
                  <div className="popup-content">
                    <h3>Edit Question</h3>
                    <div className="popup-inputs">
                      <input
                        type="text"
                        placeholder="Question description"
                        value={editingQuestion?.question ?? ""}
                        onChange={(e) => setEditingQuestion((prev) => ({ ...prev, question: e.target.value }))}
                        required
                      />
                      <input
                        type="url"
                        placeholder="Problem link"
                        value={editingQuestion?.link ?? ""}
                        onChange={(e) => setEditingQuestion((prev) => ({ ...prev, link: e.target.value }))}
                        required
                      />
                      <select
                        value={editingQuestion?.topic ?? ""}
                        onChange={(e) => setEditingQuestion((prev) => ({ ...prev, topic: e.target.value }))}
                        className="popup-select"
                        required
                      >
                        <option value="" disabled>Topic</option>
                        {predefinedTopics.map((topic) => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                      <select
                        value={editingQuestion?.difficulty ?? "Medium"}
                        onChange={(e) => setEditingQuestion((prev) => ({ ...prev, difficulty: e.target.value }))}
                        className="popup-select"
                      >
                        {DIFFICULTIES.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <select
                        value={editingQuestion?.source ?? ""}
                        onChange={(e) => setEditingQuestion((prev) => ({ ...prev, source: e.target.value }))}
                        className="popup-select"
                      >
                        <option value="">Source (optional)</option>
                        {SOURCES.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="popup-add-btn" onClick={updateQuestion} disabled={editQuestionLoading}>
                        {editQuestionLoading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </Popup>

                <ConfirmDialog
                  isOpen={questionToDelete !== null}
                  onClose={closeDeleteConfirm}
                  onConfirm={() => questionToDelete && deleteQuestion(questionToDelete)}
                  title="Delete question?"
                  message={questionToDelete ? `"${questionToDelete.question}" will be permanently deleted.` : ""}
                  confirmLabel="Delete"
                  cancelLabel="Cancel"
                  danger
                />

                <Popup isOpen={isRandomPopupOpen} onClose={() => setIsRandomPopupOpen(false)}>
                  <div className="popup-content">
                    <h3 className="popup-random-title">Random Problem</h3>
                    {randomQuestion ? (
                      <div className="random-question-wrapper">
                        <p className="random-question-text">{randomQuestion.question}</p>
                        <a href={randomQuestion.link} target="_blank" rel="noopener noreferrer">
                          <button className="popup-solve-btn">Solve</button>
                        </a>
                      </div>
                    ) : (
                      <p>No random question could be selected.</p>
                    )}
                  </div>
                </Popup>

                <div className="topic-table-section">
                  {Object.entries(groupedQuestions).map(
                    ([topic, topicQuestions]) => (
                      <div key={topic} className="topic-group">
                        <div className="topic-header" onClick={() => toggleTopic(topic)}>
                          <div className="topic-header-left">
                            <span className="topic-dot"></span>
                            <span className="topic-label">{topic}</span>
                            <span className="topic-count-badge">{topicCounts[topic] ?? 0}</span>
                          </div>
                          <div className="topic-header-right">
                            <span className={`dropdown-arrow material-symbols-rounded${openTopics[topic] ? ' open' : ''}`}>
                              expand_more
                            </span>
                          </div>
                        </div>

                        {openTopics[topic] && topicQuestions.length > 0 && (
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Question</th>
                                <th className="th-difficulty">Difficulty</th>
                                <th className="th-source">Source</th>
                                <th className="action-header">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topicQuestions.map((q) => (
                                <tr key={q.id}>
                                  <td className="td-question">{q.question}</td>
                                  <td className="td-difficulty">
                                    <span className={`badge badge-${(q.difficulty || "Medium").toLowerCase()}`}>
                                      {q.difficulty || "Medium"}
                                    </span>
                                  </td>
                                  <td className="td-source">{q.source || "—"}</td>
                                  <td className="action-cell">
                                    <a href={q.link} target="_blank" rel="noopener noreferrer">
                                      <button className="solve-btn">Solve</button>
                                    </a>
                                    <button
                                      type="button"
                                      className="revised-btn small"
                                      onClick={() => markRevised(q)}
                                      disabled={revisingId === q.id}
                                      title="Mark as revised today"
                                    >
                                      {revisingId === q.id ? "..." : "Revised"}
                                    </button>
                                    <button
                                      type="button"
                                      className="edit-btn"
                                      onClick={() => openEditPopup(q)}
                                      title="Edit"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="delete-btn"
                                      onClick={() => openDeleteConfirm(q)}
                                      disabled={deletingId === q.id}
                                      title="Delete"
                                    >
                                      {deletingId === q.id ? "..." : "Delete"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {openTopics[topic] && topicQuestions.length === 0 && (
                          <div className="no-questions-message">
                            No questions added for this topic yet.
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <p className="login-prompt">Please log in to add and view your questions.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
