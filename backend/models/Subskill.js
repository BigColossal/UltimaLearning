import mongoose from 'mongoose';

const subskillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  domainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate level from XP (100 XP = 1 level, max level 100)
subskillSchema.methods.updateLevel = function () {
  const calculatedLevel = Math.floor(this.xp / 100);
  this.level = Math.min(calculatedLevel, 100);
};

subskillSchema.pre('save', function (next) {
  this.updateLevel();
  this.updatedAt = Date.now();
  next();
});

const Subskill = mongoose.model('Subskill', subskillSchema);

export default Subskill;
