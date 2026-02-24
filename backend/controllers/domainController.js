import Domain from '../models/Domain.js';
import Subskill from '../models/Subskill.js';

export const getDomains = async (req, res) => {
  try {
    const domains = await Domain.find({ skillId: req.params.skillId }).sort({ createdAt: 1 });
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDomainById = async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id);
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    const subskills = await Subskill.find({ domainId: domain._id }).sort({ createdAt: 1 });
    res.json({ ...domain.toObject(), subskills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDomain = async (req, res) => {
  try {
    const domain = await Domain.create({
      name: req.body.name,
      description: req.body.description || '',
      skillId: req.params.skillId,
    });
    
    res.status(201).json(domain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDomain = async (req, res) => {
  try {
    const domain = await Domain.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
      },
      { new: true, runValidators: true }
    );
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    res.json(domain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDomain = async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id);
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Delete all subskills
    await Subskill.deleteMany({ domainId: domain._id });
    await Domain.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
