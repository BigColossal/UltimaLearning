import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSkillById, updateSkill, deleteSkill, createDomain } from '../api/api';
import DomainAccordion from '../components/DomainAccordion';
import '../styles/SkillPage.css';

const SkillPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [domainFormData, setDomainFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadSkill();
  }, [id]);

  const loadSkill = async () => {
    try {
      setLoading(true);
      const response = await getSkillById(id);
      setSkill(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Error loading skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    try {
      const response = await updateSkill(id, formData);
      setSkill(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating skill:', error);
      alert('Failed to update skill. Please try again.');
    }
  };

  const handleDeleteSkill = async () => {
    if (window.confirm('Are you sure you want to delete this skill? This will delete all domains and subskills.')) {
      try {
        await deleteSkill(id);
        navigate('/hub');
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill. Please try again.');
      }
    }
  };

  const handleCreateDomain = async (e) => {
    e.preventDefault();
    try {
      await createDomain(id, domainFormData);
      setDomainFormData({ name: '', description: '' });
      setShowDomainForm(false);
      await loadSkill();
    } catch (error) {
      console.error('Error creating domain:', error);
      alert('Failed to create domain. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading skill...</div>;
  }

  if (!skill) {
    return <div className="error">Skill not found</div>;
  }

  return (
    <div className="skill-page">
      <div className="skill-page-header">
        {editing ? (
          <form onSubmit={handleUpdateSkill} className="skill-edit-form">
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <textarea
              className="form-input form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <h1>{skill.name}</h1>
              <p className="skill-description">{skill.description || 'No description'}</p>
            </div>
            <div className="skill-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteSkill}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <div className="domains-section">
        <div className="domains-header">
          <h2>Domains ({skill.domains?.length || 0})</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowDomainForm(!showDomainForm)}
          >
            {showDomainForm ? 'Cancel' : '+ Add Domain'}
          </button>
        </div>

        {showDomainForm && (
          <div className="create-domain-form card">
            <h3>Create New Domain</h3>
            <form onSubmit={handleCreateDomain}>
              <div className="form-group">
                <label className="form-label">Domain Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={domainFormData.name}
                  onChange={(e) => setDomainFormData({ ...domainFormData, name: e.target.value })}
                  required
                  placeholder="e.g., Frontend Development"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={domainFormData.description}
                  onChange={(e) => setDomainFormData({ ...domainFormData, description: e.target.value })}
                  placeholder="Describe this domain..."
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Domain
              </button>
            </form>
          </div>
        )}

        {skill.domains && skill.domains.length > 0 ? (
          <div className="domains-list">
            {skill.domains.map((domain) => (
              <DomainAccordion 
                key={domain._id} 
                domain={domain} 
                subskills={domain.subskills || []}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No domains yet. Create your first domain to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillPage;
