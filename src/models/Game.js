import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  players: [{ type: String, required: true }], // Clerk user IDs
  scores: { type: Map, of: Number, default: {} }, // e.g., { userId1: 0, userId2: 0 }
  winner: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Game', gameSchema);