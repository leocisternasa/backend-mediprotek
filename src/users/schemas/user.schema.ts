import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../roles/roles.enum';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
})
export class User {
  // Esta propiedad no se almacena en MongoDB, es solo para TypeScript
  // Se genera automáticamente a partir de _id
  id: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  age?: number;

  @Prop({ enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;
}

// Definición completa del documento con tipos
export interface UserDocument extends User, Document {
  _id: Types.ObjectId;
  id: string; // El id virtual que se genera a partir de _id
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Configurar el campo virtual 'id'
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
