import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../services/password.service";
import prisma from "../models/user";
import { generateToken } from "../services/auth.service";

export const register = async (req: Request,res: Response): Promise<void> => {
    const { email , password} = req.body;

    try {
        // valida si existe el email o la contraseña del body de la URL
        if(!email){
            res.status(400).json({message: 'el email es obligatorio'});
            return
        }
        if(!password){
            res.status(400).json({message: 'el password es obligatorio'});
            return
        }

        // hashea la password
        const hashedPassword = await hashPassword(password);
        console.log(hashedPassword);

        // crea el usuario en la base de datos
        const user = await prisma.create({
            data : {
                email,
                password: hashedPassword
            }
        })
        // genera un token
        const token = generateToken(user);

        res.status(201).json({ token });


    } catch (error:any) {
        // valida si el mail es repetido, osea si el mail a registrar ya existe en la base de datos
        if(error?.code === 'P2002' && error?.meta?.target?.includes('email')){
            res.status(400).json({message: 'el mail ingresado ya existe'});
        }
        console.log(error);
        res.status(500).json({message: 'huno un error en el registro'});
    }

}

export const login = async (req:Request,res:Response):Promise<any> => {
    const {email,password} = req.body;

    try {
        if(!email){
            res.status(400).json({message: 'el email es obligatorio'});
            return
        }
        if(!password){
            res.status(400).json({message: 'el password es obligatorio'});
            return
        }
        // trae de la base de datos el usuario que se quiere logear
        const user = await prisma.findUnique({ where : { email } });
        // valida si el email existe en la base de datos
        if(!user){
            res.status(404).json({message: 'Usuario no encontrado'});
            return
        }
        // compara las 2 contraseñas hasheadas
        const passwordMatch = await comparePassword(password, user.password);

        if(!passwordMatch){
            res.status(401).json({message: 'Usuario y contraseña no coinciden'});
        }

        const token = generateToken(user);
        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({message: error});
        console.log(error);
    }
}