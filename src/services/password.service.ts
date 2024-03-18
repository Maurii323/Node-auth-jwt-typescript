import bcrypt from 'bcrypt';

// son los saltos que realiza el hasheo
const SALT_ROUNDS: number = 10;

// metodo para hashear una password
export const hashPassword = async (password:string):Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// leer y comparar con el hash de la base de datos
export const comparePassword = async (password:string, hash:string): Promise<boolean> => {
     // password es la contraseña que pone el usuario en el login, 
     // hash es la contraseña hasheada de la base de datos
    return await bcrypt.compare(password,hash);
}
