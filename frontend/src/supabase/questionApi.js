import { supabase } from "./client";

//Function to Get Quiz Questions
export async function getQuizQuestions(quizid) {
    const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq('quiz', quizid)
    if (error) throw error;
    return data;
}

//Function to Add New Questions
export async function AddNewQuestion(ques, opt, correct, quizid) {
    const { data, error } = await supabase
        .from("questions")
        .insert([{ question: ques, correct: correct, options: opt, quiz: quizid }])
        .select()
    if (error) throw error;
    return data;
}

//Function to Update Existing Questions
export async function UpdateQuestion(quesid, field, val) {
    const { data, error } = await supabase
        .from("questions")
        .update({ [field]: val })
        .eq('id', quesid)
        .select()
    if (error) throw error;
    return data;
}
//Function to Delete Existing Questions
export async function DeleteQuestion(quesid) {
    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', quesid)
    if (error) throw error;
}
