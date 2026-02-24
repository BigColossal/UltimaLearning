import Subskill from '../models/Subskill.js';

export const getSubskills = async (req, res) => {
  try {
    const subskills = await Subskill.find({ domainId: req.params.domainId }).sort({ createdAt: 1 });
    res.json(subskills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubskillById = async (req, res) => {
  try {
    const subskill = await Subskill.findById(req.params.id);
    if (!subskill) {
      return res.status(404).json({ error: 'Subskill not found' });
    }
    res.json(subskill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createSubskill = async (req, res) => {
  try {
    const subskill = await Subskill.create({
      name: req.body.name,
      description: req.body.description || '',
      domainId: req.params.domainId,
      xp: req.body.xp || 0,
    });
    
    res.status(201).json(subskill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubskill = async (req, res) => {
  try {
    const subskill = await Subskill.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
      },
      { new: true, runValidators: true }
    );
    
    if (!subskill) {
      return res.status(404).json({ error: 'Subskill not found' });
    }
    
    res.json(subskill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addXP = async (req, res) => {
  try {
    const { amount } = req.body;
    const subskill = await Subskill.findById(req.params.id);
    
    if (!subskill) {
      return res.status(404).json({ error: 'Subskill not found' });
    }
    
    subskill.xp += amount || 0;
    subskill.updateLevel();
    await subskill.save();
    
    res.json(subskill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubskill = async (req, res) => {
  try {
    const subskill = await Subskill.findByIdAndDelete(req.params.id);
    if (!subskill) {
      return res.status(404).json({ error: 'Subskill not found' });
    }
    
    res.json({ message: 'Subskill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
