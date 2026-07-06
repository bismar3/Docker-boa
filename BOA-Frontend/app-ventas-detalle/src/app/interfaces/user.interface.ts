import { Rol } from "./rol.interface";

export interface User {
  userId?: number;
  fullname?: string;
  username: string;
  password?: string;
  email?: string;
  estado?: string;
  documento_Identidad?: string;
  telefono?: string;
  fecha_Nacimiento?: string;
  roles?: Rol[];
  token?: string;
}