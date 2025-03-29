import React, { useState, useEffect } from "react";
import { db, auth } from "../FireBase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Navbar from "./Navbar";
import "./HomePage.css";
import Popup from "./PopUp";

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newLink, setNewLink] = useState("");
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [user, setUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isRandomPopupOpen, setIsRandomPopupOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchQuestions(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchQuestions = async (userId) => {
    if (!userId) return;

    const userQuestionsRef = collection(db, "users", userId, "questions");
    const querySnapshot = await getDocs(userQuestionsRef);

    const fetchedQuestions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setQuestions(fetchedQuestions);
  };

  const addQuestion = async () => {
    if (newQuestion.trim() !== "" && newLink.trim() !== "" && user) {
      const userQuestionsRef = collection(db, "users", user.uid, "questions");

      const newProblem = {
        question: newQuestion,
        link: newLink,
      };
      await addDoc(userQuestionsRef, newProblem);
      setQuestions([...questions, newProblem]);
      setNewQuestion("");
      setNewLink("");
      setIsPopupOpen(false);
    }
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
  return (
    <div>
      <Navbar />
      <div className="home-container">
        <h2 className="heading">Add Questions</h2>

        {user ? (
          <>
            <div className="add-problem-btn">
              <button onClick={() => setIsPopupOpen(true)}>Add Questions</button>
              <button className="get-button" onClick={getRandomQuestion}>
                Get Random Problem
              </button>
            </div>
            <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
              <input
                type="text"
                placeholder="Enter Question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <input
                type="text"
                placeholder="Problem Link"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
              <button className="popup-add-btn" onClick={addQuestion}>Add</button>
            </Popup>
            <Popup isOpen={isRandomPopupOpen} onClose={() => setIsRandomPopupOpen(false)}>
              {randomQuestion ? (
                <>
                  <p>{randomQuestion.question}</p>
                  <a href={randomQuestion.link} target="_blank" rel="noopener noreferrer">
                    <button className="popup-solve-btn">Solve</button>
                  </a>
                </>
              ) : (
                <p>No random question available.</p>
              )}
            </Popup>

            <div className="table-container">
              <div className="table-header">
                <div className="table-cell">Problem</div>
                <div className="table-cellaction">Action</div>
              </div>
              {questions.map((q) => (
                <div key={q.id} className="table-row">
                  <div className="table-cell">{q.question}</div>
                  <div className="table-cell">
                    <a href={q.link} target="_blank" rel="noopener noreferrer">
                      <button className="solve-btn">Solve</button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Please log in to see your questions.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
