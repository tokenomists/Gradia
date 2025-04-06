import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  subjects: [{ 
    type: String 
  }],
  classCode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],
  invitedEmails: [{ 
    type: String 
  }],
  tests: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Test'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  collection: "classes"
});

// Generate a unique class code
ClassSchema.statics.generateClassCode = async function() {
  const prefix = 'GRD-';
  const codeLength = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const generateRandomCode = () => {
    let code = prefix;
    for (let i = 0; i < codeLength; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  let unique = false;
  let newCode;

  while (!unique) {
    newCode = generateRandomCode();
    const existingClass = await this.findOne({ classCode: newCode });
    if (!existingClass) {
      unique = true;
    }
  }

  return newCode;
};


const Class = mongoose.model("Class", ClassSchema);
export default Class;