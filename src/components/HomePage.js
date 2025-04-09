import React, { useState, useEffect } from "react";
import { db, auth } from "../FireBase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Navbar from "./Navbar";
import "./HomePage.css";
import Popup from "./PopUp";

const predefinedTopics = [
  "Array", "String", "Linked List", "Stack", "Queue", "Tree", "Graph",
  "Dynamic Programming", "Greedy", "Backtracking", "Binary Search",
];

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newLink, setNewLink] = useState("");
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [user, setUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isRandomPopupOpen, setIsRandomPopupOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [openTopics, setOpenTopics] = useState({});

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

  const fetchQuestions = async (userId) => {
    if (!userId) return;

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
      alert("Failed to fetch questions. Please try again.");
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.trim()) {
      alert("Please enter the question description.");
      return;
    }
    if (!newLink.trim()) {
      alert("Please enter the problem link.");
      return;
    }
    try {
      new URL(newLink); // Basic URL validation
    } catch (_) {
      alert("Please enter a valid URL for the problem link (e.g., https://...).");
      return;
    }
    if (!selectedTopic) {
      alert("Please select a topic.");
      return;
    }
    if (!user) {
      alert("You must be logged in to add questions.");
      return;
    }

    const userQuestionsRef = collection(db, "users", user.uid, "questions");

    const newProblem = {
      question: newQuestion.trim(),
      link: newLink.trim(),
      topic: selectedTopic,
    };

    try {
      const docRef = await addDoc(userQuestionsRef, newProblem);

      const questionToAddLocally = { ...newProblem, id: docRef.id };
      setQuestions((prevQuestions) => [...prevQuestions, questionToAddLocally]);

      // Reset form and close popup
      setNewQuestion("");
      setNewLink("");
      setSelectedTopic("");
      setIsPopupOpen(false);

      // Open the topic to show newly added question
      setOpenTopics(prev => ({ ...prev, [selectedTopic]: true }));
    } catch (error) {
      console.error("Firestore Error while adding question:", error);
      alert("Failed to add question. Check console for details.");
    }
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

  const getRandomQuestion = () => {
    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      setRandomQuestion(questions[randomIndex]);
      setIsRandomPopupOpen(true);
    } else {
      alert("No questions available. Add some first!");
    }
  };

  const groupedQuestions = groupByTopic(questions);

  return (
    <div>
      <Navbar />
      <div className="home-container">
        {user ? (
          <>
            <div className="add-problem-btn">
              <h2 className="heading">Your Questions</h2>
              <button onClick={() => setIsPopupOpen(true)}>Add Question</button>
              <button
                className="get-button"
                onClick={getRandomQuestion}
                disabled={questions.length === 0}
              >
                Get Random Problem
              </button>
            </div>

            <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
              <div className="popup-content">
                <h3>Add Question</h3>
                <div className="popup-inputs">
                  <input
                    type="text"
                    placeholder="Enter Question Description"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                  />
                  <input
                    type="url"
                    placeholder="Problem Link (e.g., https://...)"
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
                    <option value="" disabled>-- Select Topic --</option>
                    {predefinedTopics.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                  <button className="popup-add-btn" onClick={addQuestion}>Add</button>
                </div>
              </div>
            </Popup>

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
                        <span>{topic}</span>
                      </div>
                      <div className="topic-header-right">
                        <span className="dropdown-arrow">
                          {openTopics[topic] ? "▼" : "▶"}
                        </span>
                      </div>
                    </div>

                    {openTopics[topic] && topicQuestions.length > 0 && (
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Questions</th>
                            <th className="action-header">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topicQuestions.map((q) => (
                            <tr key={q.id}>
                              <td>{q.question}</td>
                              <td className="action-cell">
                                <a
                                  href={q.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <button className="solve-btn">Solve</button>
                                </a>
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
        ) : (
          <p className="login-prompt">Please log in to add and view your questions.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
