const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const activityRoutes = require('../routes/activityRoutes');
const { errorHandler } = require('../middleware/errorMiddleware');

// Simuler (mock) le middleware d'authentification
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    // Simule un utilisateur authentifié en attachant un ID statique et valide à la requête.
    // On utilise un ID statique pour éviter les problèmes de portée avec jest.mock().
    req.user = { id: '60d5ecb3e4a2a75b24a7d4a1' };
    next();
  },
}));

// Créer une application Express de test
const app = express();
app.use(express.json());
app.use('/api/activities', activityRoutes);
app.use(errorHandler);


describe('Activity Routes - Integration Tests', () => {

  describe('POST /api/activities', () => {

    it('should create a new activity and return 201 when payload is valid', async () => {
      const activityData = {
        title: 'Morning Run',
        type: 'running',
        duration: 30,
        date: new Date().toISOString(),
        distance: 5,
        source: 'manual',
      };

      const response = await request(app)
        .post('/api/activities')
        .send(activityData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(activityData.title);
      expect(response.body.type).toBe('running');
    });

    it('should return 400 validation error if required fields are missing', async () => {
      const activityData = {
        // Le champ 'title' est manquant
        type: 'running',
        duration: 30,
        date: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/activities')
        .send(activityData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation failed. Please check your data.');
      expect(response.body.details).toHaveProperty('title');
    });
  });
});
