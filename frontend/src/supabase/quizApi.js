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
    .select()
    .single()
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
  const {  error2 } = await supabase
    .from("questions")
    .delete()
    .eq('quiz', id)
  if (error2) throw error2;
  const {  error3 } = await supabase
    .from("score")
    .delete()
    .eq('quiz', id)
  if (error3) throw error3;
  const { error1 } = await supabase
    .from("quizes")
    .delete()
    .eq('id', id)
  if (error1) throw error1;
}
