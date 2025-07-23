// webappy/frontend/src/supabase/quizApi.js
import { supabase } from "./client";

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