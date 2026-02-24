import { useState } from 'react';
import '../styles/ProjectXPForm.css';

const ProjectXPForm = ({ onAddXP, currentXP }) => {
  const [xpAmount, setXpAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const handleQuickAdd = (amount) => {
    onAddXP(amount);
    setXpAmount('');
    setCustomAmount('');
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      onAddXP(amount);
      setCustomAmount('');
    }
  };

  return (
    <div className="xp-form">
      <h3 className="xp-form-title">Add Experience Points</h3>
      
      <div className="xp-quick-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => handleQuickAdd(10)}
        >
          +10 XP
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => handleQuickAdd(25)}
        >
          +25 XP
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => handleQuickAdd(50)}
        >
          +50 XP
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => handleQuickAdd(100)}
        >
          +100 XP
        </button>
      </div>
      
      <div className="xp-custom-input">
        <input
          type="number"
          className="form-input"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          min="1"
        />
        <button 
          className="btn btn-secondary"
          onClick={handleCustomAdd}
          disabled={!customAmount || parseInt(customAmount) <= 0}
        >
          Add Custom XP
        </button>
      </div>
      
      <div className="xp-current">
        Current Total: <strong>{currentXP} XP</strong>
      </div>
    </div>
  );
};

export default ProjectXPForm;
