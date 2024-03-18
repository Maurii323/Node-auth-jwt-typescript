import { Request, Response } from "express";
import prisma from "../models/user";
import { hashPassword } from "../services/password.service";
import user from "../models/user";

export const createUser = async(req: Request, res: Response):Promise<any> => {
    const { email , password} = req.body;

    try {
        if(!email){
            res.status(400).json({message: 'el email es obligatorio'});
            return
        }
        if(!password){
            res.status(400).json({message: 'el password es obligatorio'});
            return
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.create({
            data : {
                email,
                password: hashedPassword
            }
        })

        res.status(201).json({ user });

    } catch (error:any) {
        // valida si el mail es repetido, osea si el mail a registrar ya existe en la base de datos
        if(error?.code === 'P2002' && error?.meta?.target?.includes('email')){
            res.status(400).json({message: 'el mail ingresado ya existe'});
        }
        console.log(error);
        res.status(500).json({message: 'hubo un error, pruebe mas tarde'});
    }
}

export const getAllUsers = async(req: Request, res: Response):Promise<any> => {
    try {
        // trae todos los recursos del user
        const users = await prisma.findMany();
        res.status(200).json(users);

    } catch (error:any) {
        console.log(error);
        res.status(500).json({message: 'hubo un error, pruebe mas tarde'});
    }
}

export const getUserById = async(req: Request, res: Response):Promise<any> => {
    // extrae el id de los parametros de la URL 
    const userId = parseInt(req.params.id);
    try {
        // encuentra en la base de datos el recurso que tenga el id que habia en la URL
        const user = await prisma.findUnique({ 
            where: {
                id: userId
            } 
        })
        // valida si el usuario no fue encontrado porque no existe el id
        if(!user){
            res.status(404).json({error: 'El usuario no fue encontrado'});
            return
        }

        res.status(200).json(user);

    } catch (error:any) {
        console.log(error);
        res.status(500).json({message: 'hubo un error, pruebe mas tarde'});
    }
}

export const updateUser = async(req: Request, res: Response):Promise<any> => {
    const userId = parseInt(req.params.id);
    const {email, password} = req.body;

    try {
        // trae todo lo que tiene el body de la request y lo guarda
        let dataToUpdate: any = {...req.body};
        // si existe email significa que paso un email nuevo para actualizar
        if(email){
            dataToUpdate.email = email;
        }

        if(password){
            const passwordHashed = await hashPassword(password);
            dataToUpdate.password = passwordHashed;
        }
        // actualiza los datos del user que encuentre por ese id, con el dataToUpdate
        const user = await prisma.update({ 
            where: {
                id: userId
            },
            data: dataToUpdate
        })

        res.status(200).json(user);

    } catch (error:any) {
        
        if(error?.code === 'P2002' && error?.meta?.target?.includes('email')){
            res.status(400).json({message: 'el mail ingresado ya existe'});
        }else if(error?.code === 'P2025'){
            res.status(400).json({message: 'usuario no encontrado'});
        }else {
            console.log(error);
            res.status(500).json({message: 'hubo un error, pruebe mas tarde'});
        }

    }
}

export const deleteUser = async(req: Request, res: Response):Promise<any> => {
    const userId = parseInt(req.params.id);

    try {
        // elimina el user que encuentre por ese id
        await prisma.delete({ 
            where: {
                id: userId
            }
        })
        
        res.status(200).json({
            message: `el usuario con el id ${userId} ha sido eliminado`
        }).end();                                                       //.end() es para los delete

    } catch (error:any) {
        
        if(error?.code === 'P2025'){
            res.status(400).json({message: 'usuario no encontrado'});
        }else {
            console.log(error);
            res.status(500).json({message: 'hubo un error, pruebe mas tarde'});
        }

    }
} 