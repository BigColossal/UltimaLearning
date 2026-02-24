import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Skill from './models/Skill.js';
import Domain from './models/Domain.js';
import Subskill from './models/Subskill.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ultimalearning');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Domain.deleteMany({});
    await Subskill.deleteMany({});

    // Create default user
    const user = await User.create({
      username: 'default',
      email: 'user@ultimalearning.com',
    });

    // Create example skill: Web Development
    const webDevSkill = await Skill.create({
      name: 'Web Development',
      description: 'Master the art of building modern web applications',
      userId: user._id,
    });

    // Frontend Domain
    const frontendDomain = await Domain.create({
      name: 'Frontend Development',
      description: 'Client-side technologies and frameworks',
      skillId: webDevSkill._id,
    });

    const frontendSubskills = await Subskill.insertMany([
      { name: 'HTML5', description: 'Semantic markup and structure', domainId: frontendDomain._id, xp: 250 },
      { name: 'CSS3', description: 'Styling and layout techniques', domainId: frontendDomain._id, xp: 300 },
      { name: 'JavaScript', description: 'Core programming language', domainId: frontendDomain._id, xp: 500 },
      { name: 'React', description: 'Component-based UI library', domainId: frontendDomain._id, xp: 400 },
      { name: 'TypeScript', description: 'Typed JavaScript superset', domainId: frontendDomain._id, xp: 200 },
    ]);

    // Backend Domain
    const backendDomain = await Domain.create({
      name: 'Backend Development',
      description: 'Server-side technologies and APIs',
      skillId: webDevSkill._id,
    });

    const backendSubskills = await Subskill.insertMany([
      { name: 'Node.js', description: 'JavaScript runtime environment', domainId: backendDomain._id, xp: 350 },
      { name: 'Express.js', description: 'Web application framework', domainId: backendDomain._id, xp: 300 },
      { name: 'MongoDB', description: 'NoSQL database', domainId: backendDomain._id, xp: 400 },
      { name: 'RESTful APIs', description: 'API design principles', domainId: backendDomain._id, xp: 250 },
    ]);

    // Create another example skill: Data Science
    const dataScienceSkill = await Skill.create({
      name: 'Data Science',
      description: 'Extract insights from data using statistical methods',
      userId: user._id,
    });

    const mlDomain = await Domain.create({
      name: 'Machine Learning',
      description: 'Algorithms and models for pattern recognition',
      skillId: dataScienceSkill._id,
    });

    await Subskill.insertMany([
      { name: 'Python', description: 'Primary programming language', domainId: mlDomain._id, xp: 600 },
      { name: 'NumPy', description: 'Numerical computing library', domainId: mlDomain._id, xp: 300 },
      { name: 'Pandas', description: 'Data manipulation library', domainId: mlDomain._id, xp: 350 },
      { name: 'Scikit-learn', description: 'Machine learning library', domainId: mlDomain._id, xp: 200 },
    ]);

    console.log('Seed data created successfully!');
    console.log(`Created ${await Skill.countDocuments()} skills`);
    console.log(`Created ${await Domain.countDocuments()} domains`);
    console.log(`Created ${await Subskill.countDocuments()} subskills`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
