import { Expense } from "../models/expense.model.js";

export const addExpense = async (req, res) => {
    try {
        const {description, amount, category, date, notes } = req.body;
        const userId = req.id; // current loggedin user id
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            })
        };

        const expense = await Expense.create({
            description,
            amount,
            category,
            date,
            notes: notes || '',
            userId
        });
        return res.status(201).json({
            message: "Expense added successfully.",
            expense,
            success: true
        })
    } 
    catch (error) {
        console.log(error);
    }
}

export const getAllExpense = async (req, res) => {
    try {
        const userId = req.id; // loggedin user id
        let category = req.query.category || "";
        const done = req.query.done;
        const query = {
            userId // filter by userId
        }
        if(category.toLowerCase() !== "all" && category !== ""){
            query.category = { $regex: category, $options: 'i' };
        }
        // done can be undefined, true, false, or ""
        if (done === "true" || done === true) {
            query.done = true;
        } else if (done === "false" || done === false) {
            query.done = false;
        }

        const expense = await Expense.find(query);

        if(!expense || expense.length===0){
            return res.status(404).json({
                message: "NO expense found",
                success:false
            })
        };
        return res.status(200).json({
            message: "Expense found",
            expense,
            success: true
        })
    }   
    catch (error) {
        console.log(error);
    }
}

export const markAsDone = async (req, res)=>{
    try{
        const expenseId = req.params.id;
        const done = req.body; // loggedin user id
        const expense = await Expense.findByIdAndUpdate(expenseId, done, {new:true});

        if(!expense){
            return res.status(404).json({
                message: "Expense not found",
                success:false
            })
        };
        return res.status(200).json({
            message: `Expense marked as ${expense.done ? 'done' : 'undone'}`,
            success: true
        })
    }
    catch(error){
        console.log(error);
    }
}

export const removeExpense = async (req, res)=>{
    try{
        const expenseId = req.params.id;
        await Expense.findByIdAndDelete(expenseId);
        return res.status(200).json({
            message: "Expense deleted",
            success: true
        })
    }
    catch(error){
        console.log(error);
    }
}

export const updateExpense = async(req, res)=>{
    try{
        const {description, amount, category, date, notes} = req.body;

        const expenseId = req.params.id;
        const updateData = {description, amount, category, date, notes};

        const expense = await Expense.findByIdAndUpdate(expenseId, updateData, {new:true});
        return res.status(200).json({
            message: "Expense updated",
            success: true
        })
    }
    catch(error){
        console.log(error);
    }
}
