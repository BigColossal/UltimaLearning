import User from '../models/User.js';

// Get or create user (for demo purposes, we'll use a default user)
export const getOrCreateUser = async (req, res) => {
  try {
    let user = await User.findOne({ username: 'default' });
    
    if (!user) {
      user = await User.create({
        username: 'default',
        email: 'user@ultimalearning.com',
      });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
