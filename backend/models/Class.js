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
ClassSchema.statics.generateClassCode = function() {
  const prefix = 'GRD-';
  const codeLength = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  
  for (let i = 0; i < codeLength; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
};

const Class = mongoose.model("Class", ClassSchema);
export default Class;