import express, { NextFunction, Request, Response } from 'express';
import jwt from "jsonwebtoken";
import {getAllUsers, createUser, getUserById, updateUser, deleteUser} from '../controllers/userController';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'

// middleware de JWT para ver si estamos autenticados con el token
const authenticateToken = (req:Request, res:Response, next:NextFunction) => {
    // obtiene el encabezado de autorización de la solicitud HTTP, donde esta el token
    const authHeader = req.headers['authorization'];
    // divide el encabezado de autorización en dos partes, la 2da, donde esta el token en si, se almacena
    const token = authHeader && authHeader.split(' ')[1];
    //  verifica si no se proporcionó ningún token en el encabezado de autorización de la solicitud HTTP
    if(!token){
        return res.status(401).json({ error: 'No autorizado'});
    }
    // verifica la autenticidad del token
    jwt.verify(token, JWT_SECRET, (err,decoded) => {
        // verifica si hay un error durante la verificación del token (el token es inválido o ha expirado)
        if(err){
            console.log('error en la autenticazion', err);
            return res.status(403).json({ error: 'No tienes acceso a este recurso'});

        }
        // Si la verificación del token es exitosa y no hay errores, la solicitud continua su procesamiento.
        next();
    })
};

// las rutas del user
router.get('/', authenticateToken, getAllUsers);
router.post('/', authenticateToken, createUser) ;
router.get('/:id', authenticateToken, getUserById);
router.delete('/:id', authenticateToken, deleteUser);
router.put('/:id', authenticateToken, updateUser);


export default router;
