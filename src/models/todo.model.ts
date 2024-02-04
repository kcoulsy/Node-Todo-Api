import mongoose from '../db/mongoose';

const schema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Number,
    default: null,
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
});

export const Todo = mongoose.model('Todo', schema);
