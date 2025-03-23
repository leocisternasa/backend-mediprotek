import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserInput } from './dto/login-user.input';
import { RegisterInput } from './dto/register.input';
import { Auth } from './entities/auth.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/roles/roles.enum';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => Auth)
  async login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.authService.login(loginUserInput);
  }

  @Mutation(() => Auth)
  async register(@Args('registerInput') registerInput: RegisterInput) {
    // Usar el rol proporcionado o PATIENT por defecto
    const user = await this.usersService.register({
      ...registerInput,
      role: registerInput.role || UserRole.PATIENT,
    });

    // Autenticar al usuario recién registrado
    return this.authService.login({
      email: registerInput.email,
      password: registerInput.password,
    });
  }
}
