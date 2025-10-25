"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
// import AdminSidebar from "@/components/common/AdminSidebar";

// 🟢 Hàm thay thế useToast
function showMessage(title, description, type = "info") {
  const prefix =
    type === "destructive" ? "❌" : type === "success" ? "✅" : "ℹ️";
  alert(`${prefix} ${title}\n${description}`);
}

export default function QuizManagement() {
  const [quizTypes, setQuizTypes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");

  // --- Quiz Type Form ---
  const [newQuizType, setNewQuizType] = useState({ name: "", description: "" });

  // --- Quiz Form ---
  const [newQuiz, setNewQuiz] = useState({
    quiz_type_id: "",
    skill: "",
    title: "",
    passage: "",
  });

  // --- Question Form ---
  const [newQuestion, setNewQuestion] = useState({
    quiz_id: "",
    content: "",
    question_order: 1,
    options: [
      { content: "", is_correct: false, option_order: 1 },
      { content: "", is_correct: false, option_order: 2 },
      { content: "", is_correct: false, option_order: 3 },
      { content: "", is_correct: false, option_order: 4 },
    ],
  });

  // -----------------------
  // MOCK DATA
  // -----------------------
  useEffect(() => {
    setQuizTypes([
      { id: "1", name: "TOEIC", description: "Bài thi TOEIC" },
      { id: "2", name: "IELTS", description: "Bài thi IELTS" },
    ]);

    setQuizzes([
      { id: "10", quiz_type_id: "1", title: "TOEIC Reading Test 1", skill: "reading" },
      { id: "11", quiz_type_id: "2", title: "IELTS Speaking Practice", skill: "speaking" },
    ]);
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      setQuestions([
        {
          id: "100",
          quiz_id: selectedQuiz,
          content: "What is the main idea of the passage?",
          question_order: 1,
          options: [
            { content: "Option A", is_correct: false },
            { content: "Option B", is_correct: true },
          ],
        },
      ]);
    }
  }, [selectedQuiz]);

  // -----------------------
  // CRUD HANDLERS
  // -----------------------
  const handleAddQuizType = () => {
    if (!newQuizType.name) {
      showMessage("Lỗi", "Tên loại bài thi không được để trống", "destructive");
      return;
    }

    setQuizTypes((prev) => [
      ...prev,
      { id: Date.now().toString(), ...newQuizType },
    ]);

    showMessage("Thành công", "Đã thêm loại bài thi", "success");
    setNewQuizType({ name: "", description: "" });
  };

  const handleAddQuiz = () => {
    if (!newQuiz.title) {
      showMessage("Lỗi", "Cần nhập tiêu đề bài thi", "destructive");
      return;
    }

    setQuizzes((prev) => [
      ...prev,
      { id: Date.now().toString(), ...newQuiz },
    ]);

    showMessage("Thành công", "Đã thêm bài thi", "success");
    setNewQuiz({ quiz_type_id: "", skill: "", title: "", passage: "" });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.content || !newQuestion.quiz_id) {
      showMessage(
        "Lỗi",
        "Cần chọn bài thi và nhập nội dung câu hỏi",
        "destructive"
      );
      return;
    }

    setQuestions((prev) => [
      ...prev,
      { id: Date.now().toString(), ...newQuestion },
    ]);

    showMessage("Thành công", "Đã thêm câu hỏi", "success");
    setNewQuestion({
      quiz_id: "",
      content: "",
      question_order: 1,
      options: [
        { content: "", is_correct: false, option_order: 1 },
        { content: "", is_correct: false, option_order: 2 },
        { content: "", is_correct: false, option_order: 3 },
        { content: "", is_correct: false, option_order: 4 },
      ],
    });
  };

  // -----------------------
  // RENDER UI
  // -----------------------
  return (
    <div className="flex min-h-screen bg-background">
      {/* <AdminSidebar /> */}

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-10 text-center">Quản lý Quiz</h1>

        <Tabs defaultValue="quiz-types">
          {/* Tabs Header */}
          <TabsList className="flex justify-center bg-muted/40 rounded-xl p-1 w-fit mx-auto mb-10">
            <TabsTrigger
              value="quiz-types"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6 py-2 text-sm font-medium transition-all"
            >
              Loại bài thi
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6 py-2 text-sm font-medium transition-all"
            >
              Bài thi
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-6 py-2 text-sm font-medium transition-all"
            >
              Câu hỏi
            </TabsTrigger>
          </TabsList>

          {/* Quiz Types */}
          <TabsContent value="quiz-types">
            <div className="max-w-3xl mx-auto space-y-8">
              <Card className="shadow-sm border border-muted/50">
                <CardHeader>
                  <CardTitle>Thêm loại bài thi mới</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tên loại bài thi</Label>
                    <Input
                      value={newQuizType.name}
                      onChange={(e) =>
                        setNewQuizType({ ...newQuizType, name: e.target.value })
                      }
                      placeholder="VD: TOEIC"
                    />
                  </div>
                  <div>
                    <Label>Mô tả</Label>
                    <Textarea
                      value={newQuizType.description}
                      onChange={(e) =>
                        setNewQuizType({
                          ...newQuizType,
                          description: e.target.value,
                        })
                      }
                      placeholder="Mô tả về loại bài thi"
                    />
                  </div>
                  <Button onClick={handleAddQuizType}>
                    <Plus className="w-4 h-4 mr-2" /> Thêm loại bài thi
                  </Button>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Danh sách loại bài thi</h3>
                    <div className="space-y-2">
                      {quizTypes.map((type) => (
                        <Card key={type.id} className="shadow-sm border border-muted/30">
                          <CardContent className="py-3">
                            <p className="font-semibold">{type.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quizzes */}
          <TabsContent value="quizzes">
            <div className="max-w-3xl mx-auto space-y-8">
              <Card className="shadow-sm border border-muted/50">
                <CardHeader>
                  <CardTitle>Thêm bài thi mới</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Loại bài thi</Label>
                    <Select
                      value={newQuiz.quiz_type_id}
                      onValueChange={(value) =>
                        setNewQuiz({ ...newQuiz, quiz_type_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại bài thi" />
                      </SelectTrigger>
                      <SelectContent>
                        {quizTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Kỹ năng</Label>
                    <Select
                      value={newQuiz.skill}
                      onValueChange={(value) =>
                        setNewQuiz({ ...newQuiz, skill: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kỹ năng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listening">Listening</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="speaking">Speaking</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tiêu đề</Label>
                    <Input
                      value={newQuiz.title}
                      onChange={(e) =>
                        setNewQuiz({ ...newQuiz, title: e.target.value })
                      }
                      placeholder="Tiêu đề bài thi"
                    />
                  </div>

                  <div>
                    <Label>Đoạn văn</Label>
                    <Textarea
                      value={newQuiz.passage}
                      onChange={(e) =>
                        setNewQuiz({ ...newQuiz, passage: e.target.value })
                      }
                      placeholder="Nội dung đoạn văn"
                      rows={6}
                    />
                  </div>

                  <Button onClick={handleAddQuiz}>
                    <Plus className="w-4 h-4 mr-2" /> Thêm bài thi
                  </Button>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Danh sách bài thi</h3>
                    <div className="space-y-2">
                      {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="shadow-sm border border-muted/30">
                          <CardContent className="py-3">
                            <p className="font-semibold">{quiz.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {
                                quizTypes.find((t) => t.id === quiz.quiz_type_id)
                                  ?.name
                              }{" "}
                              - {quiz.skill}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Questions */}
          <TabsContent value="questions">
            <div className="max-w-3xl mx-auto space-y-8">
              <Card className="shadow-sm border border-muted/50">
                <CardHeader>
                  <CardTitle>Thêm câu hỏi mới</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Chọn bài thi</Label>
                    <Select
                      value={newQuestion.quiz_id}
                      onValueChange={(value) => {
                        setNewQuestion({ ...newQuestion, quiz_id: value });
                        setSelectedQuiz(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bài thi" />
                      </SelectTrigger>
                      <SelectContent>
                        {quizzes.map((quiz) => (
                          <SelectItem key={quiz.id} value={quiz.id}>
                            {quiz.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Nội dung câu hỏi</Label>
                    <Textarea
                      value={newQuestion.content}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          content: e.target.value,
                        })
                      }
                      placeholder="Nội dung câu hỏi"
                    />
                  </div>

                  <div>
                    <Label>Thứ tự</Label>
                    <Input
                      type="number"
                      value={newQuestion.question_order}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          question_order: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Các đáp án</Label>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Checkbox
                          checked={option.is_correct}
                          onCheckedChange={(checked) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index].is_correct = checked;
                            setNewQuestion({
                              ...newQuestion,
                              options: newOptions,
                            });
                          }}
                        />
                        <Input
                          value={option.content}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index].content = e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              options: newOptions,
                            });
                          }}
                          placeholder={`Đáp án ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleAddQuestion}>
                    <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi
                  </Button>

                  {selectedQuiz && questions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-4">
                        Danh sách câu hỏi
                      </h3>
                      <div className="space-y-2">
                        {questions.map((q) => (
                          <Card key={q.id} className="shadow-sm border border-muted/30">
                            <CardContent className="py-3">
                              <p className="font-semibold">
                                Câu {q.question_order}: {q.content}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
