import { useState, useEffect } from "react";
import { generateTest, submitTest } from "../../api/api";
import "../../styles/learning-hub/TestingInterface.css";

const TestingInterface = ({ nodeIds, onComplete, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTest();
  }, [nodeIds]);

  useEffect(() => {
    if (!submitted && test) {
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [test, submitted]);

  const loadTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await generateTest(nodeIds);
      setTest(response.data.test);
      setAnswers(new Array(response.data.test.questions.length).fill(null));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) {
      setError("Please answer all questions before submitting");
      return;
    }

    try {
      setLoading(true);
      const response = await submitTest(
        nodeIds,
        answers,
        test.difficulty,
        timeSpent,
      );
      setResult(response.data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit test");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !test) {
    return (
      <div className="test-loading">
        <div className="spinner">Generating test...</div>
      </div>
    );
  }

  if (error && !submitted) {
    return (
      <div className="test-error">
        <p className="error-message">{error}</p>
        <div className="button-group">
          <button onClick={loadTest} className="btn-retry">
            Retry
          </button>
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="test-result">
        <div className="result-header">
          <h2>Test Complete! 🎉</h2>
          <p className="result-subtitle">Review your performance</p>
        </div>

        <div className="result-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{result.score}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Correct Answers</span>
            <span className="stat-value">
              {result.correctCount}/{result.totalQuestions}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">XP Earned</span>
            <span className="stat-value xp-earned">+{result.xpEarned}</span>
          </div>
        </div>

        {result.score < 50 && (
          <div className="feedback-message">
            <p>
              Keep practicing! Try reviewing the concepts and taking another
              test.
            </p>
          </div>
        )}

        {result.score >= 50 && result.score < 80 && (
          <div className="feedback-message success">
            <p>Good work! You're making progress. Review your weak areas.</p>
          </div>
        )}

        {result.score >= 80 && (
          <div className="feedback-message excellent">
            <p>Excellent! You've mastered this material! 🏆</p>
          </div>
        )}

        <div className="result-questions">
          <h3>Review Answers</h3>
          {result.questions.map((q, i) => (
            <div key={i} className="question-review">
              <div className="question-number">Q{i + 1}</div>
              <p className="question-text">{q.question}</p>
              <div className="answer-status">
                <span className={q.score === 100 ? "correct" : "incorrect"}>
                  {q.score === 100 ? "✓ Correct" : "✗ Incorrect"}
                </span>
              </div>
              {q.score !== 100 && (
                <p className="correct-answer">
                  Correct answer: Option {q.correctAnswer + 1}
                </p>
              )}
              <p className="explanation">{q.explanation}</p>
            </div>
          ))}
        </div>

        <div className="button-group">
          <button onClick={onClose} className="btn-done">
            Done
          </button>
        </div>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestionIndex] !== null;

  return (
    <div className="test-interface">
      <div className="test-header">
        <h2>
          Test Question {currentQuestionIndex + 1} / {test.questions.length}
        </h2>
        <div className="test-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / test.questions.length) * 100
                }%`,
              }}
            />
          </div>
          <p className="progress-text">
            {currentQuestionIndex + 1} of {test.questions.length}
          </p>
        </div>
      </div>

      <div className="question-container">
        <h3 className="question-text">{currentQuestion.question}</h3>

        <div className="options-container">
          {currentQuestion.options.map((option, idx) => (
            <label
              key={idx}
              className={`option ${
                answers[currentQuestionIndex] === idx ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={idx}
                checked={answers[currentQuestionIndex] === idx}
                onChange={() => handleAnswerSelect(idx)}
              />
              <span className="option-letter">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="test-footer">
        <div className="navigation-buttons">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn-nav"
          >
            ← Previous
          </button>

          {currentQuestionIndex < test.questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="btn-nav"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || answers.some((a) => a === null)}
              className="btn-submit"
            >
              {loading ? "Submitting..." : "Submit Test"}
            </button>
          )}
        </div>

        <div className="question-indicators">
          {test.questions.map((_, idx) => (
            <div
              key={idx}
              className={`indicator ${
                answers[idx] !== null ? "answered" : ""
              } ${idx === currentQuestionIndex ? "current" : ""}`}
              onClick={() => {
                if (answers[idx] !== null || idx <= currentQuestionIndex) {
                  setCurrentQuestionIndex(idx);
                }
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestingInterface;
