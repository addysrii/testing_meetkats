import React, { useState,useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import {useParams,useNavigate} from 'react-router-dom';
import { getQuizQuestions } from '../../supabase/questionApi';
const CreateQuizes = () => {
    const [questions, setQuestions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const {quizid} = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        // Fetch existing questions if quizid is provided
        if (quizid) {
            const fetchQuestions = async () => {
                try {
                    const response = await getQuizQuestions(quizid);
                    setQuestions(response);
                } catch (error) {
                    console.error("Error fetching questions:", error);
                    navigate('/quiz-platform');
                }
            };
            fetchQuestions();
        }else{
            navigate('/quiz-platform');
        }
    },[]);

    const createNewQuestion = () => ({
        question: '',
        options: ['', '', '', ''],
        correct: '',
        quiz: quizid || null,
    });

    const addQuestion = () => {
        const newQuestion = createNewQuestion();
        setQuestions([...questions, newQuestion]);
        setEditingId(newQuestion.id);
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
        if (editingId === id) setEditingId(null);
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const updateOption = (questionId, optionIndex, value) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
                : q
        ));
    };

    const addOption = (questionId) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, options: [...q.options, ''] }
                : q
        ));
    };

    const removeOption = (questionId, optionIndex) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
                : q
        ));
    };

    const startEditing = (id) => {
        setEditingId(id);
    };

    const stopEditing = () => {
        setEditingId(null);
    };

    const isQuestionValid = (question) => {
        return question.question.trim() &&
            question.options.some(opt => opt.trim()) &&
            question.correct.trim() &&
            question.options.includes(question.correct);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-green-800 mb-2">Quiz Builder</h1>
                    <p className="text-green-600">Create and manage your quiz questions</p>
                </div>
                {/* Questions List */}
                <div className="space-y-6">
                    {questions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
                                <div className="text-green-300 mb-4">
                                    <Plus size={48} className="mx-auto" />
                                </div>
                                <h3 className="text-xl font-semibold text-green-700 mb-2">No questions yet</h3>
                                <p className="text-green-600">Click "Add New Question" to get started</p>
                            </div>
                        </div>
                    ) : (
                        questions.map((question, questionIndex) => (
                            <div key={question.id} className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden transition-all duration-200 hover:shadow-xl">
                                {/* Question Header */}
                                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 border-b border-green-150">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                                                {questionIndex + 1}
                                            </div>
                                            <span className="font-medium text-green-800">Question {questionIndex + 1}</span>
                                            {isQuestionValid(question) && (
                                                <div className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                    Complete
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {editingId === question.id ? (
                                                <button
                                                    onClick={stopEditing}
                                                    className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(question.id)}
                                                    className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => removeQuestion(question.id)}
                                                className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Question Text */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-green-700 mb-2">
                                            Question Text
                                        </label>
                                        {editingId === question.id ? (
                                            <textarea
                                                value={question.question}
                                                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                                placeholder="Enter your question here..."
                                                className="w-full p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                                rows={3}
                                            />
                                        ) : (
                                            <div className="p-3 bg-green-50 rounded-xl border border-green-100 min-h-[80px] flex items-center">
                                                {question.question || <span className="text-green-400 italic">No question text</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Options */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-sm font-medium text-green-700">
                                                Answer Options
                                            </label>
                                            {editingId === question.id && (
                                                <button
                                                    onClick={() => addOption(question.id)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                                >
                                                    <Plus size={16} />
                                                    Add Option
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                                                        {String.fromCharCode(65 + optionIndex)}
                                                    </div>
                                                    {editingId === question.id ? (
                                                        <div className="flex-1 flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                                                className="flex-1 p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                            />
                                                            {question.options.length > 2 && (
                                                                <button
                                                                    onClick={() => removeOption(question.id, optionIndex)}
                                                                    className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1 p-2 bg-green-50 rounded-lg border border-green-100">
                                                            {option || <span className="text-green-400 italic">Empty option</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Correct Answer */}
                                    <div>
                                        <label className="block text-sm font-medium text-green-700 mb-2">
                                            Correct Answer
                                        </label>
                                        {editingId === question.id ? (
                                            <select
                                                value={question.correct}
                                                onChange={(e) => updateQuestion(question.id, 'correct', e.target.value)}
                                                className="w-full p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            >
                                                <option value="">Select the correct answer...</option>
                                                {question.options.map((option, index) => (
                                                    option.trim() && (
                                                        <option key={index} value={option}>
                                                            {String.fromCharCode(65 + index)}: {option}
                                                        </option>
                                                    )
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                                {question.correct ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                                                            {question.options.indexOf(question.correct) !== -1
                                                                ? String.fromCharCode(65 + question.options.indexOf(question.correct))
                                                                : '?'}
                                                        </div>
                                                        {question.correct}
                                                    </div>
                                                ) : (
                                                    <span className="text-green-400 italic">No correct answer selected</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Question Button */}
                <div className="mb-6 flex justify-center">
                    <button
                        onClick={addQuestion}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Add New Question
                    </button>
                </div>
                {/* Summary */}
                {questions.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                        <h3 className="text-lg font-semibold text-green-800 mb-3">Quiz Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-green-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-green-600">{questions.length}</div>
                                <div className="text-sm text-green-700">Total Questions</div>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {questions.filter(isQuestionValid).length}
                                </div>
                                <div className="text-sm text-emerald-700">Complete Questions</div>
                            </div>
                            <div className="bg-teal-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-teal-600">
                                    {questions.reduce((total, q) => total + q.options.filter(opt => opt.trim()).length, 0)}
                                </div>
                                <div className="text-sm text-teal-700">Total Options</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateQuizes;