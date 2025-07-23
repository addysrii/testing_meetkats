// webappy/frontend/src/supabase/quizApi.js
import { supabase } from "./client";

export async function saveQuizResult({ name, email, score }) {
  const { data, error } = await supabase
    .from("meetkats_quiz")
    .insert([{ name, email, score }]);
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
