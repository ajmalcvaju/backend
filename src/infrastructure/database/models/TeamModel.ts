import mongoose, { Schema, Document } from 'mongoose';
import { Team } from '../../../domain/entities/Team';

export interface TeamDocuments extends Team, Document {
    createdAt:Date
    updatedAt:Date
}
const generateSecretCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase(); // Generates a random alphanumeric code
};

const teamSchema = new Schema<TeamDocuments>({
  teamName: {
    type: String,
    required: true,
    trim: true,
    unique: true, 
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 2, 
    max: 100,
  },
  privacy: {
    type: String,
    enum: ['public', 'private'], 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
  updatedAt: {
    type: Date,
    default: Date.now, 
  },
  secretCode: {
    type: String
},
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
  ],
  slots: [
    {
      slotId: {
        type: mongoose.Schema.Types.ObjectId,  // Accepts both ObjectId and string
        ref: 'Slot',
        required: true,
      },
      vacancy: {
        type: Number,
        required: true,
        min: 1,
        max: 21,
      },
      members: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          isAdmin: {
            type: Boolean,
            default: false,
          }
        },
      ],      
    },
  ],
});


teamSchema.pre('save', function (next) {
  if (this.privacy === "private" && !this.secretCode) {
    this.secretCode = generateSecretCode();
}
const hasAdmin = this.members.some(member => member.isAdmin);
  if (!hasAdmin && this.members.length > 0) {
    this.members[0].isAdmin = true; 
  }
  this.updatedAt = new Date();
  next();
});
teamSchema.pre('save', function (next) {
  for (const slot of this.slots) {
    if (slot.members.length < slot.vacancy) {
      return next(new Error('The number of members exceeds the vacancy in one of the slots.'));
    }
  }
  next();
});
teamSchema.post('find', async function (docs) {
  for (const team of docs) {
    ensureAdmin(team);
  }
});

teamSchema.post('findOne', async function (team) {
  if (team) {
    ensureAdmin(team);
  }
});

async function ensureAdmin(team:TeamDocuments) {
  const hasAdmin = team.members.some(member => member.isAdmin);
  
  if (!hasAdmin && team.members.length > 0) {
    team.members[0].isAdmin = true; 
    await team.save(); 
  }
}




export const TeamModel = mongoose.model<TeamDocuments>('Team', teamSchema);
