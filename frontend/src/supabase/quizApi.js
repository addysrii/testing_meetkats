// webappy/frontend/src/supabase/quizApi.js
import { supabase } from "./client";

//Function to Get Quiz Details
export async function getQuizDetails(){
  const { data, error } = await supabase
    .from("quizes")
    .select("*")
  if (error) throw error;
  return data;
}

//Function to Add Quizes and Details
export async function CreateNewQuiz(title,active,starttime,endtime,duration){
  const { data, error } = await supabase
    .from("quizes")
    .insert([{Name:title,Active:active,Start_time:starttime,End_time:endtime,Duration:duration}])
  if (error) throw error;
  return data;
}

//Function to Toggle Quiz Status - (Active/Inactive)
export async function ToggleActive(id,status) {
const { data, error } = await supabase
  .from('quizes')
  .update({ Active: status })
  .eq('id', id)
  .select()
  if (error) throw error;
  return data;  
}

//Function to Delete Quizes
export async function DeleteQuiz(id){
  const { data2, error } = await supabase
    .from("questions")
    .delete()
    .eq('quiz', id)
  if (error) throw error;
  const { data3, error } = await supabase
    .from("questions")
    .delete()
    .eq('quiz', id)
  if (error) throw error;
  const { data1, error } = await supabase
    .from("quizes")
    .delete()
    .eq('id', id)
  if (error) throw error;
  return data3;
}

//Save Each user's Attempt
export async function saveQuizResult({ name, email, score,time }) {
  const { data, error } = await supabase
    .from("meetkats_quiz")
    .insert([{ name, email, score ,time}]);
  if (error) throw error;
  return data;
}


export async function fetchQuizResults() {
  const { data, error } = await supabase
    .from("meetkats_quiz")
    .select("*")
    .order("score", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchQuizResultByEmail(email) {
  const { data, error } = await supabase
    .from("meetkats_quiz")
    .select("*")
    .eq("email", email)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116: No rows found
  return data;
}