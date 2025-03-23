import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserInput } from './dto/login-user.input';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';
import { CreateUserInput } from '../users/dto/create-user.input';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    return user;
  }

  async login(loginUserInput: LoginUserInput): Promise<Auth> {
    const { email, password } = loginUserInput;
    const user = await this.validateUser(email, password);
    
    const payload = { 
      email: user.email,
      sub: user.id,
      role: user.role 
    };
    
    // Asegurarse de que el objeto user tenga todos los campos necesarios
    const userForGraphQL = this.transformUserForGraphQL(user);
    
    return {
      token: this.jwtService.sign(payload),
      user: userForGraphQL,
    };
  }

  async register(createUserInput: CreateUserInput): Promise<Auth> {
    // Crear el usuario
    const user = await this.usersService.register(createUserInput);
    
    // Generar token
    const payload = { 
      email: user.email,
      sub: user.id,
      role: user.role 
    };
    
    // Asegurarse de que el objeto user tenga todos los campos necesarios
    const userForGraphQL = this.transformUserForGraphQL(user);
    
    return {
      token: this.jwtService.sign(payload),
      user: userForGraphQL,
    };
  }
  
  // Método auxiliar para transformar el objeto User de MongoDB al formato esperado por GraphQL
  private transformUserForGraphQL(user: any): any {
    // Asegurarse de que createdAt y updatedAt existan
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      age: user.age,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
  }
}
