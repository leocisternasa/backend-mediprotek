import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole } from './roles/roles.enum';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';
import { RemoveUserResponse } from './entities/remove-user.response';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    // Verificar si el email ya está en uso
    const existingUser = await this.userModel
      .findOne({ email: createUserInput.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const { password, ...rest } = createUserInput;
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = new this.userModel({
      ...rest,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async register(createUserInput: CreateUserInput): Promise<User> {
    // Usar el rol proporcionado o PATIENT por defecto
    const userInput = {
      ...createUserInput,
      role: createUserInput.role || UserRole.PATIENT,
    };
    return this.create(userInput);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    currentUser: User,
  ): Promise<User> {
    // Verificar si el usuario actual tiene permisos para realizar la actualización
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este usuario',
      );
    }

    const { password, ...restUpdateData } = updateUserInput;
    const updateData: any = { ...restUpdateData };

    // Si se proporciona contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return updatedUser;
  }

  async remove(id: string, currentUser: User): Promise<RemoveUserResponse> {
    // Verificar si el usuario actual tiene permisos para realizar la eliminación
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este usuario',
      );
    }

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return {
      success: true,
      user: deletedUser,
    };
  }
}
