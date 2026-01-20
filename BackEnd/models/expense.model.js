import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        required: false,
        default: ''
    },
    done: {
        type: Boolean,
        default: false
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true});
export const Expense = mongoose.model("Expense", expenseSchema);
