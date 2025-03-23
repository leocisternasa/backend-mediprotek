import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../roles/roles.enum';

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty()
  firstName: string;
  @Field()
  @IsNotEmpty()
  lastName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Field({ nullable: true })
  age?: number;

  @Field(() => String, { defaultValue: UserRole.PATIENT })
  @IsEnum(UserRole)
  role: UserRole;
}
