import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from './roles/roles.enum';
import { ForbiddenException } from '@nestjs/common';
import { RemoveUserResponse } from './entities/remove-user.response';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() currentUser: any,
  ) {
    // Solo los administradores pueden crear usuarios con roles específicos
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'No tienes permiso para crear usuarios como administrador',
      );
    }
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => User, { name: 'register' })
  register(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.register(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  async findAll(@CurrentUser() user: any) {
    // Solo los administradores pueden ver todos los usuarios
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'No tienes permiso para ver todos los usuarios',
      );
    }
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(GqlAuthGuard)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: any,
  ) {
    // Los administradores pueden ver cualquier usuario
    // Los pacientes solo pueden verse a sí mismos
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.update(
      updateUserInput.id,
      updateUserInput,
      currentUser,
    );
  }

  @Mutation(() => RemoveUserResponse)
  @UseGuards(GqlAuthGuard)
  removeUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.remove(id, currentUser);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() currentUser: any) {
    return this.usersService.findOne(currentUser.id);
  }
}
