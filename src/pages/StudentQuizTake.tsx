import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Trophy } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function StudentQuizTake() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [started, timeLeft]);

  const loadQuiz = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select(`
        *,
        institution_profiles (
          institution_name,
          profile_photo_url
        )
      `)
      .eq("id", quizId)
      .single();

    if (data) {
      setQuiz(data);
      if (data.time_limit) {
        setTimeLeft(data.time_limit * 60);
      }
    }
  };

  const startQuiz = () => {
    setStarted(true);
  };

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    let correctCount = 0;
    questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correct_answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("quiz_attempts").insert({
        student_id: user.id,
        quiz_id: quizId,
        score: correctCount,
        total_questions: questions.length,
        time_taken: quiz.time_limit ? (quiz.time_limit * 60 - timeLeft) : 0,
        answers,
      });
    }
  };

  if (!quiz) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">This quiz has no questions yet</p>
            <Button onClick={() => navigate("/student/quizzes")} className="mt-4">
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: quiz.background_image ? `url(${quiz.background_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: quiz.background_image ? undefined : '#6366f1'
        }}
      >
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6">
              {quiz.institution_profiles?.profile_photo_url ? (
                <img src={quiz.institution_profiles.profile_photo_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <Trophy className="h-10 w-10 text-white" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground mb-8">{quiz.institution_profiles?.institution_name}</p>

            {quiz.description && (
              <p className="text-sm text-muted-foreground mb-6">{quiz.description}</p>
            )}

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-2xl font-bold text-primary">{questions.length}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
              {quiz.time_limit && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">{quiz.time_limit}</p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
              )}
              {quiz.difficulty && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-sm font-bold text-primary">{quiz.difficulty}</p>
                  <p className="text-xs text-muted-foreground">Difficulty</p>
                </div>
              )}
            </div>

            <Button onClick={startQuiz} size="lg" className="w-full max-w-xs">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">Quiz Complete!</h1>
            
            <div className="text-6xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-muted-foreground mb-8">
              You answered {score} out of {questions.length} questions correctly
            </p>

            <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
              {questions.map((q: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {answers[index] === q.correct_answer ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Question {index + 1}</p>
                    {answers[index] !== q.correct_answer && (
                      <p className="text-xs text-muted-foreground">
                        Correct: {q.correct_answer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate("/student/quizzes")}>
                Back to Quizzes
              </Button>
              <Button onClick={() => {
                setStarted(false);
                setCurrentQuestion(0);
                setAnswers({});
                setShowResults(false);
                setScore(0);
                if (quiz.time_limit) setTimeLeft(quiz.time_limit * 60);
              }}>
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz question screen
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <Progress value={progress} className="w-32 h-2" />
          </div>
          
          {quiz.time_limit && (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono font-medium">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Question Card */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {question.question}
            </h2>

            <RadioGroup 
              value={answers[currentQuestion] || ""} 
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {question.options?.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    answers[currentQuestion] === option
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleAnswer(option)}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-medium">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button onClick={nextQuestion}>
              Next
            </Button>
          ) : (
            <Button onClick={submitQuiz}>
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}