// Calculate level from XP (100 XP = 1 level, max level 100)
export const calculateLevel = (xp) => {
  return Math.min(Math.floor(xp / 100), 100);
};

// Calculate XP progress within current level (0-100)
export const getXPProgress = (xp) => {
  const level = calculateLevel(xp);
  const xpInCurrentLevel = xp % 100;
  return xpInCurrentLevel;
};

// Get tier name based on level (every 10 levels)
export const getTier = (level) => {
  const tierNumber = Math.floor(level / 10);
  const tiers = [
    "Dormant",
    "Smoldering",
    "Volatile",
    "Seismic",
    "Infernal",
    "Meteoric",
    "Disasterous",
    "Supervolcanic",
    "Apocalyptic",
    "primordial",
  ];
  return tiers[Math.min(tierNumber, tiers.length - 1)];
};

// Get tier class name for styling
export const getTierClass = (level) => {
  const tier = getTier(level);
  return `tier-${tier.toLowerCase()}`;
};

// Get next level XP requirement
export const getNextLevelXP = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= 100) return null;
  return (currentLevel + 1) * 100;
};
