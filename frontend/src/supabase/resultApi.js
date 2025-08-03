import { supabase } from "./client";

export async function fetchQuizResults(quizid) {
  const { data, error } = await supabase
    .from("score")
    .select("*")
    .eq('quiz',quizid)
    .order("correct", { ascending: false });
  if (error) throw error;
  return data;
}