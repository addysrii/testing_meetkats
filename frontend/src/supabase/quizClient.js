import { supabase } from "./client";
export async function fetchQuizData(quizid){
  try {
    // 1. Fetch the quiz by id
    const { data: quizzes, error: quizError } = await supabase
      .from('quizes')
      .select('*')
      .eq('id', quizid)
      .eq('Active', true)
      .limit(1);

    if (quizError) throw quizError;
    if (!quizzes || quizzes.length === 0) return null;

    const quiz = quizzes[0];

    // 2. Fetch questions for the quiz using the foreign key
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz', quiz.id);

    if (questionsError) throw questionsError;
    //Check if quiz is ended or not
    function hasTimePassed(timestamp) {
  // Get the current timestamp in milliseconds
  const currentTime = Date.now();
  // Compare the given timestamp with the current time
  return Date.parse(timestamp) < currentTime;
}

    // 3. Format into desired object
    const formattedQuiz = {
      title: quiz.Name,
      timer: parseInt(quiz.Duration.split(" minutes")[0])*60, // assuming duration is in seconds
      questions: questions.map((q) => ({
        text: q.question,
        options: q.options,
        correct: q.options.findIndex(opt => opt === q.correct),
      })),
      ended:hasTimePassed(quiz.End_time),
    };

    return formattedQuiz;
  } catch (error) {
    console.error('Error fetching quiz:', error.message);
    return null;
  }
};

export async function fetchQuizResultByEmail(email,quizid) {
  const { data, error } = await supabase
    .from("score")
    .select("*")
    .eq("quiz",quizid)
    .eq("email", email)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error; // PGRST116: No rows found
  return data;
}

//Save Each user's Attempt
export async function saveQuizResult({ name, email, correct,incorrect,time,quizid }) {
  const { data, error } = await supabase
    .from("score")
    .insert([{ name, email, correct:correct,incorrect:incorrect,submitted_at:time,quiz:quizid}]);
  if (error) throw error;
  return data;
}