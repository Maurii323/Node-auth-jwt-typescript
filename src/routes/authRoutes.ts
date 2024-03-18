import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();
// las rutas de la auth
router.post('/register', register); // en la url /auth/register llama al controlador register de authController
router.post('/login', login);

export default router;