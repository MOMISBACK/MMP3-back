const mongoose = require('mongoose');

// Sous-schéma pour les exercices de musculation
const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sets: {
    type: Number,
    min: 0,
  },
  reps: {
    type: Number,
    min: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
});

const activitySchema = new mongoose.Schema({
  // --- Champs communs ---
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    enum: ['cycling', 'running', 'walking', 'swimming', 'workout'],
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // en minutes
    required: true,
    min: 0,
  },
  date: {
    type: Date, // pour les requêtes de classement
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: ['manual', 'tracked'],
  },

  // --- Champs spécifiques ---
  // Pour cycling, running, walking
  distance: {
    type: Number,
    min: 0,
  },
  elevationGain: { // D+ en mètres
    type: Number,
    min: 0,
  },
  avgSpeed: { // en km/h
    type: Number,
    min: 0,
  },

  // Pour swimming (en plus de distance)
  poolLength: { // en mètres
    type: Number,
    min: 0,
  },
  laps: {
    type: Number,
    min: 0,
  },

  // Pour workout
  exercises: [exerciseSchema],
}, {
  timestamps: true,
});

// Middleware de validation avant la sauvegarde
activitySchema.pre('save', function (next) {
  const allowedFieldsMap = {
    running: ['distance', 'elevationGain', 'avgSpeed'],
    cycling: ['distance', 'elevationGain', 'avgSpeed'],
    walking: ['distance', 'elevationGain', 'avgSpeed'],
    swimming: ['distance', 'poolLength', 'laps'],
    workout: ['exercises'],
  };

  const specificFields = [
    'distance', 'elevationGain', 'avgSpeed',
    'poolLength', 'laps',
    'exercises'
  ];

  const allowedFields = allowedFieldsMap[this.type];

  if (!allowedFields) {
    return next();
  }

  let error = null;

  specificFields.forEach(field => {
    if ((this[field] !== undefined && this[field] !== null && (!Array.isArray(this[field]) || this[field].length > 0)) && !allowedFields.includes(field)) {
      error = new Error(`Le champ '${field}' n'est pas applicable pour le type '${this.type}'.`);
    }
  });

  if (error) {
    return next(error);
  }

  next();
});

module.exports = mongoose.model('Activity', activitySchema);
