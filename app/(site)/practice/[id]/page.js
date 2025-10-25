// // // "use client";

// // // import { useEffect, useMemo, useState } from "react";
// // // import { useParams, useRouter } from "next/navigation";
// // // import Link from "next/link";
// // // import { getQuiz } from "@/lib/api/quiz";
// // // import { listQuestionsByQuiz } from "@/lib/api/question";
// import { sanitizeHtml } from "@/lib/sanitize";

// // // export default function PracticePage() {
// // //   const params = useParams();
// // //   const router = useRouter();
// // //   const id = params?.id;

// // //   const [quiz, setQuiz] = useState(null);
// // //   const [questions, setQuestions] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState("");

// // //   const [answers, setAnswers] = useState({});
// // //   const [index, setIndex] = useState(0);
// // //   const [submitted, setSubmitted] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       try {
// // //         const q = await getQuiz(id);
// // //         setQuiz(q?.data || q);
// // //         const r = await listQuestionsByQuiz(id, { page: 1, pageSize: 1000 });
// // //         const items = r?.result || r?.data?.result || [];
// // //         setQuestions(items);
// // //       } catch (e) {
// // //         console.error(e);
// // //         setError("Không tải được đề thi hoặc câu hỏi.");
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     })();
// // //   }, [id]);

// // //   const current = questions[index] || null;
// // //   const total = questions.length;

// // //   const onChoose = (qid, oid) => setAnswers(prev => ({ ...prev, [qid]: oid }));
// // //   const next = () => setIndex(i => Math.min(i + 1, total - 1));
// // //   const prev = () => setIndex(i => Math.max(i - 1, 0));
// // //   const onSubmit = () => {
// // //     if (Object.keys(answers).length < total) {
// // //       if (!confirm("Bạn chưa chọn hết các câu. Vẫn nộp bài?")) return;
// // //     }
// // //     setSubmitted(true);
// // //     window.scrollTo(0, 0);
// // //   };

// // //   const result = useMemo(() => {
// // //     if (!submitted) return null;
// // //     let correct = 0;
// // //     const details = questions.map(q => {
// // //       const chosen = answers[q.id];
// // //       const correctOption = (q.options || []).find(o => o.correct);
// // //       const isOk = !!correctOption && chosen === correctOption.id;
// // //       if (isOk) correct += 1;
// // //       return { id: q.id, content: q.content, chosen, correctId: correctOption?.id, isOk, options: q.options || [] };
// // //     });
// // //     return { correct, total: questions.length, details };
// // //   }, [submitted, answers, questions]);

// // //   if (loading) return <div className="container mx-auto p-6">Đang tải đề thi...</div>;
// // //   if (error) return <div className="container mx-auto p-6 text-red-600">{error}</div>;
// // //   if (!quiz) return <div className="container mx-auto p-6 text-red-600">Không tìm thấy đề thi.</div>;

// // //   return (
// // //     <div className="container mx-auto p-6 space-y-6">
// // //       <div className="flex items-center justify-between">
// // //         <div>
// // //           <h1 className="text-2xl font-semibold">{quiz.title}</h1>
// // //           <p className="text-sm text-muted-foreground">{quiz.description}</p>
// // //           <div className="text-xs mt-2 inline-flex gap-2">
// // //             <span className="px-2 py-1 border rounded">{quiz.quizTypeName}</span>
// // //             <span className="px-2 py-1 border rounded">{quiz.skill}</span>
// // //           </div>
// // //         </div>
// // //         <Link href={`/quiz/types/${quiz.quizTypeId}`} className="text-blue-600 underline">← Quay lại</Link>
// // //       </div>

// // //       {!submitted ? (
// // //         <>
// // //           {current ? (
// // //             <div className="space-y-4 border rounded p-4">
// // //               <div className="text-sm text-muted-foreground">Câu {index + 1}/{total}</div>
// // //               <div className="text-lg font-medium">{current.content}</div>

// // //               <div className="space-y-2">
// // //                 {(current.options || []).map(op => {
// // //                   const checked = answers[current.id] === op.id;
// // //                   return (
// // //                     <label key={op.id} className={`flex items-center gap-3 border rounded p-3 cursor-pointer ${checked ? "border-blue-500 bg-blue-50" : ""}`}>
// // //                       <input type="radio" name={`q-${current.id}`} checked={checked} onChange={() => onChoose(current.id, op.id)} />
// // //                       <span>{op.content}</span>
// // //                     </label>
// // //                   );
// // //                 })}
// // //               </div>

// // //               <div className="flex items-center justify-between pt-2">
// // //                 <div className="flex gap-2">
// // //                   <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={prev} disabled={index === 0}>← Trước</button>
// // //                   <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={next} disabled={index === total - 1}>Tiếp theo →</button>
// // //                 </div>
// // //                 <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onSubmit}>Nộp bài</button>
// // //               </div>
// // //             </div>
// // //           ) : (
// // //             <div className="text-muted-foreground">Đề thi chưa có câu hỏi.</div>
// // //           )}
// // //         </>
// // //       ) : (
// // //         <div className="space-y-4">
// // //           <div className="text-xl font-semibold">Kết quả</div>
// // //           <div className="text-sm">Điểm: <span className="font-medium">{result.correct}/{result.total}</span></div>

// // //           <div className="space-y-3">
// // //             {result.details.map((d, i) => (
// // //               <div key={d.id} className="border rounded p-3">
// // //                 <div className="font-medium">Câu {i + 1}. {d.content}</div>
// // //                 <div className="mt-2 space-y-1">
// // //                   {d.options.map(op => (
// // //                     <div key={op.id} className={`text-sm ${op.id === d.correctId ? "text-green-700" : op.id === d.chosen ? "text-red-700" : "text-muted-foreground"}`}>
// // //                       {op.id === d.correctId ? "✔ " : op.id === d.chosen ? "✖ " : "• "}{op.content}
// // //                     </div>
// // //                   ))}
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>

// // //           <div className="flex gap-2">
// // //             <button className="px-3 py-2 border rounded" onClick={()=>{ setSubmitted(false); setIndex(0); window.scrollTo(0,0); }}>Làm lại</button>
// // //             <Link href={`/quiz/types/${quiz.quizTypeId}`} className="px-3 py-2 border rounded inline-block">← Về danh sách</Link>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }
// // "use client";

// // import { useEffect, useMemo, useState } from "react";
// // import { useParams } from "next/navigation";
// // import Link from "next/link";
// // import { getQuizPublic } from "@/lib/api/quiz";
// // import { listQuestionsByQuiz } from "@/lib/api/question";
// import { sanitizeHtml } from "@/lib/sanitize";

// // export default function PracticePage() {
// //   const params = useParams();
// //   const id = params?.id;

// //   const [quiz, setQuiz] = useState(null);
// //   const [questions, setQuestions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");

// //   const [answers, setAnswers] = useState({});
// //   const [index, setIndex] = useState(0);
// //   const [submitted, setSubmitted] = useState(false);
// //   const [writingAnswer, setWritingAnswer] = useState("");

// //   useEffect(() => {
// //     (async () => {
// //       try {
// //         const q = await getQuizPublic(id);               // <-- dùng public API
// //         setQuiz(q?.data || q);
// //         const r = await listQuestionsByQuiz(id, { page: 1, pageSize: 1000 });
// //         const items = r?.result || r?.data?.result || [];
// //         setQuestions(items);
// //       } catch (e) {
// //         console.error(e);
// //         setError("Không tải được đề thi hoặc câu hỏi.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     })();
// //   }, [id]);

// //   const current = questions[index] || null;
// //   const total = questions.length;

// //   const onChoose = (qid, oid) => setAnswers(prev => ({ ...prev, [qid]: oid }));
// //   const next = () => setIndex(i => Math.min(i + 1, total - 1));
// //   const prev = () => setIndex(i => Math.max(i - 1, 0));

// //   const isProdSkill = (s) => s === "SPEAKING" || s === "WRITING";

// //   const onSubmit = () => {
// //     if (!isProdSkill(quiz?.skill)) {
// //       if (Object.keys(answers).length < total) {
// //         if (!confirm("Bạn chưa chọn hết các câu. Vẫn nộp bài?")) return;
// //       }
// //     }
// //     setSubmitted(true);
// //     window.scrollTo(0, 0);
// //   };

// //   const result = useMemo(() => {
// //     if (!submitted || isProdSkill(quiz?.skill)) return null;
// //     let correct = 0;
// //     const details = questions.map(q => {
// //       const chosen = answers[q.id];
// //       const correctOption = (q.options || []).find(o => o.correct);
// //       const isOk = !!correctOption && chosen === correctOption.id;
// //       if (isOk) correct += 1;
// //       return { id: q.id, content: q.content, chosen, correctId: correctOption?.id, isOk, options: q.options || [] };
// //     });
// //     return { correct, total: questions.length, details };
// //   }, [submitted, answers, questions, quiz]);

// //   if (loading) return <div className="container mx-auto p-6">Đang tải đề thi...</div>;
// //   if (error) return <div className="container mx-auto p-6 text-red-600">{error}</div>;
// //   if (!quiz) return <div className="container mx-auto p-6 text-red-600">Không tìm thấy đề thi.</div>;

// //   return (
// //     <div className="container mx-auto p-6 space-y-6">
// //       <div className="flex items-start justify-between">
// //         <div>
// //           <h1 className="text-2xl font-semibold">{quiz.title}</h1>
// //           <p className="text-sm text-muted-foreground">{quiz.description}</p>
// //           <div className="text-xs mt-2 inline-flex gap-2">
// //             <span className="px-2 py-1 border rounded">{quiz.quizTypeName}</span>
// //             <span className="px-2 py-1 border rounded">{quiz.skill}</span>
// //           </div>
// //         </div>
// //         <Link href={`/quiz/types/${quiz.quizTypeId}`} className="text-blue-600 underline">← Quay lại</Link>
// //       </div>

// //       {/* Đoạn văn chung hiển thị xuyên suốt */}
// //       {quiz.contextText && (
// //         <div className="border rounded p-4 bg-gray-50 whitespace-pre-wrap leading-relaxed">
// //           {quiz.contextText}
// //         </div>
// //       )}

// //       {/* SPEAKING/WRITING: hiển thị questionText + ô nhập (writing) */}
// //       {isProdSkill(quiz.skill) ? (
// //         !submitted ? (
// //           <div className="space-y-4 border rounded p-4">
// //             {quiz.questionText && (
// //               <div className="text-lg font-medium whitespace-pre-wrap">{quiz.questionText}</div>
// //             )}
// //             {quiz.skill === "WRITING" ? (
// //               <textarea
// //                 className="w-full min-h-[200px] border rounded px-3 py-2"
// //                 placeholder="Nhập câu trả lời của bạn…"
// //                 value={writingAnswer}
// //                 onChange={(e)=>setWritingAnswer(e.target.value)}
// //               />
// //             ) : (
// //               <div className="text-sm text-muted-foreground">
// //                 Bài nói: hãy nói theo yêu cầu bên trên. (Phần ghi âm/đánh giá tự động có thể bổ sung sau.)
// //               </div>
// //             )}
// //             <div className="flex justify-end">
// //               <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onSubmit}>Nộp bài</button>
// //             </div>
// //           </div>
// //         ) : (
// //           <div className="space-y-4">
// //             <div className="text-xl font-semibold">Đã nộp bài</div>
// //             {quiz.skill === "WRITING" && (
// //               <div className="border rounded p-3">
// //                 <div className="text-sm font-medium mb-1">Bài làm của bạn:</div>
// //                 <div className="whitespace-pre-wrap">{writingAnswer || "(trống)"}</div>
// //               </div>
// //             )}
// //             {quiz.explanation && (
// //               <div className="border rounded p-4 bg-green-50 whitespace-pre-wrap">
// //                 <div className="font-medium mb-1">Giải thích</div>
// //                 {quiz.explanation}
// //               </div>
// //             )}
// //             <Link href={`/quiz/types/${quiz.quizTypeId}`} className="px-3 py-2 border rounded inline-block">← Về danh sách</Link>
// //           </div>
// //         )
// //       ) : (
// //         // LISTENING/READING: trắc nghiệm như cũ
// //         <>
// //           {!submitted ? (
// //             <div className="space-y-4 border rounded p-4">
// //               <div className="text-sm text-muted-foreground">Câu {index + 1}/{total}</div>
// //               <article className="prose max-w-none ql-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(current?.content || "") }} />
// //               <div className="space-y-2">
// //                 {(current?.options || []).map(op => {
// //                   const checked = answers[current.id] === op.id;
// //                   return (
// //                     <label key={op.id} className={`flex items-center gap-3 border rounded p-3 cursor-pointer ${checked ? "border-blue-500 bg-blue-50" : ""}`}>
// //                       <input type="radio" name={`q-${current.id}`} checked={checked} onChange={() => onChoose(current.id, op.id)} />
// //                       <span>{op.content}</span>
// //                     </label>
// //                   );
// //                 })}
// //               </div>
// //               <div className="flex items-center justify-between pt-2">
// //                 <div className="flex gap-2">
// //                   <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => setIndex(i => Math.max(i - 1, 0))} disabled={index===0}>← Trước</button>
// //                   <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => setIndex(i => Math.min(i + 1, total - 1))} disabled={index===total-1}>Tiếp theo →</button>
// //                 </div>
// //                 <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onSubmit}>Nộp bài</button>
// //               </div>
// //             </div>
// //           ) : (
// //             <div className="space-y-4">
// //               <div className="text-xl font-semibold">Kết quả</div>

// //               {quiz.explanation && (
// //                 <div className="border rounded p-4 bg-green-50 whitespace-pre-wrap">
// //                   <div className="font-medium mb-1">Giải thích</div>
// //                   {quiz.explanation}
// //                 </div>
// //               )}

// //               {(() => {
// //                 let correct = 0;
// //                 const details = questions.map(q => {
// //                   const chosen = answers[q.id];
// //                   const correctOption = (q.options || []).find(o => o.correct);
// //                   const isOk = !!correctOption && chosen === correctOption.id;
// //                   if (isOk) correct += 1;
// //                   return { q, chosen, correctId: correctOption?.id, isOk };
// //                 });
// //                 return (
// //                   <div className="space-y-3">
// //                     <div className="text-sm">Điểm: <span className="font-medium">{correct}/{questions.length}</span></div>
// //                     {details.map((d, i) => (
// //                       <div key={d.q.id} className="border rounded p-3">
// //                         <div className="font-medium">Câu {i + 1}."</div>\n                        <article className=\"prose max-w-none ql-content mt-2\"" +
                        // " dangerouslySetInnerHTML={{ __html: sanitizeHtml(d.q.content || \"\") }} />\n                        <div className=\"font-medium\">"</div>
// //                         <div className="mt-2 space-y-1">
// //                           {(d.q.options || []).map(op => (
// //                             <div key={op.id} className={`text-sm ${op.id === d.correctId ? "text-green-700" : op.id === d.chosen ? "text-red-700" : "text-muted-foreground"}`}>
// //                               {op.id === d.correctId ? "✔ " : op.id === d.chosen ? "✖ " : "• "}{op.content}
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 );
// //               })()}
// //               <div className="flex gap-2">
// //                 <button className="px-3 py-2 border rounded" onClick={()=>{ setSubmitted(false); setIndex(0); setAnswers({}); window.scrollTo(0,0); }}>Làm lại</button>
// //                 <Link href={`/quiz/types/${quiz.quizTypeId}`} className="px-3 py-2 border rounded inline-block">← Về danh sách</Link>
// //               </div>
// //             </div>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // }
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// // import { getQuizPublic } from "@/lib/api/quiz";
// import { getQuiz } from "@/lib/api/quiz";
// import { listQuestionsByQuiz } from "@/lib/api/question";
// import { sanitizeHtml } from "@/lib/sanitize";

// export default function PracticePage() {
//   const params = useParams();
//   const id = params?.id;

//   const [quiz, setQuiz] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [answers, setAnswers] = useState({});
//   const [index, setIndex] = useState(0);
//   const [submitted, setSubmitted] = useState(false);
//   const [writingAnswer, setWritingAnswer] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         const q = await getQuiz(id);               // <-- dùng public API
//         setQuiz(q?.data || q);
//         const r = await listQuestionsByQuiz(id, { page: 1, pageSize: 1000 });
//         const items = r?.result || r?.data?.result || [];
//         setQuestions(items);
//       } catch (e) {
//         console.error(e);
//         setError("Không tải được đề thi hoặc câu hỏi.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [id]);

//   const current = questions[index] || null;
//   const total = questions.length;

//   const onChoose = (qid, oid) => setAnswers(prev => ({ ...prev, [qid]: oid }));
//   const next = () => setIndex(i => Math.min(i + 1, total - 1));
//   const prev = () => setIndex(i => Math.max(i - 1, 0));

//   const isProdSkill = (s) => s === "SPEAKING" || s === "WRITING";

//   const onSubmit = () => {
//     if (!isProdSkill(quiz?.skill)) {
//       if (Object.keys(answers).length < total) {
//         if (!confirm("Bạn chưa chọn hết các câu. Vẫn nộp bài?")) return;
//       }
//     }
//     setSubmitted(true);
//     window.scrollTo(0, 0);
//   };

//   const result = useMemo(() => {
//     if (!submitted || isProdSkill(quiz?.skill)) return null;
//     let correct = 0;
//     const details = questions.map(q => {
//       const chosen = answers[q.id];
//       const correctOption = (q.options || []).find(o => o.correct);
//       const isOk = !!correctOption && chosen === correctOption.id;
//       if (isOk) correct += 1;
//       return { id: q.id, content: q.content, chosen, correctId: correctOption?.id, isOk, options: q.options || [] };
//     });
//     return { correct, total: questions.length, details };
//   }, [submitted, answers, questions, quiz]);

//   if (loading) return <div className="container mx-auto p-6">Đang tải đề thi...</div>;
//   if (error) return <div className="container mx-auto p-6 text-red-600">{error}</div>;
//   if (!quiz) return <div className="container mx-auto p-6 text-red-600">Không tìm thấy đề thi.</div>;

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">{quiz.title}</h1>
//           <p className="text-sm text-muted-foreground">{quiz.description}</p>
//           <div className="text-xs mt-2 inline-flex gap-2">
//             <span className="px-2 py-1 border rounded">{quiz.quizTypeName}</span>
//             <span className="px-2 py-1 border rounded">{quiz.skill}</span>
//           </div>
//         </div>
//         <Link href={`/quiz/types/${quiz.quizTypeId}`} className="text-blue-600 underline">← Quay lại</Link>
//       </div>

//       {/* Đoạn văn chung hiển thị xuyên suốt */}
//       {quiz.contextText && (
//         <div className="border rounded p-4 bg-gray-50 whitespace-pre-wrap leading-relaxed">
//           {quiz.contextText}
//         </div>
//       )}

//       {/* SPEAKING/WRITING: hiển thị questionText + ô nhập (writing) */}
//       {isProdSkill(quiz.skill) ? (
//         !submitted ? (
//           <div className="space-y-4 border rounded p-4">
//             {quiz.questionText && (
//               <div className="text-lg font-medium whitespace-pre-wrap">{quiz.questionText}</div>
//             )}
//             {quiz.skill === "WRITING" ? (
//               <textarea
//                 className="w-full min-h-[200px] border rounded px-3 py-2"
//                 placeholder="Nhập câu trả lời của bạn…"
//                 value={writingAnswer}
//                 onChange={(e)=>setWritingAnswer(e.target.value)}
//               />
//             ) : (
//               <div className="text-sm text-muted-foreground">
//                 Bài nói: hãy nói theo yêu cầu bên trên. (Phần ghi âm/đánh giá tự động có thể bổ sung sau.)
//               </div>
//             )}
//             <div className="flex justify-end">
//               <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onSubmit}>Nộp bài</button>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="text-xl font-semibold">Đã nộp bài</div>
//             {quiz.skill === "WRITING" && (
//               <div className="border rounded p-3">
//                 <div className="text-sm font-medium mb-1">Bài làm của bạn:</div>
//                 <div className="whitespace-pre-wrap">{writingAnswer || "(trống)"}</div>
//               </div>
//             )}
//             {quiz.explanation && (
//               <div className="border rounded p-4 bg-green-50 whitespace-pre-wrap">
//                 <div className="font-medium mb-1">Giải thích</div>
//                 {quiz.explanation}
//               </div>
//             )}
//             <Link href={`/quiz/types/${quiz.quizTypeId}`} className="px-3 py-2 border rounded inline-block">← Về danh sách</Link>
//           </div>
//         )
//       ) : (
//         // LISTENING/READING: trắc nghiệm như cũ
//         <>
//           {!submitted ? (
//             <div className="space-y-4 border rounded p-4">
//               <div className="text-sm text-muted-foreground">Câu {index + 1}/{total}</div>
//               <article className="prose max-w-none ql-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(current?.content || "") }} />
//               <div className="space-y-2">
//                 {(current?.options || []).map(op => {
//                   const checked = answers[current.id] === op.id;
//                   return (
//                     <label key={op.id} className={`flex items-center gap-3 border rounded p-3 cursor-pointer ${checked ? "border-blue-500 bg-blue-50" : ""}`}>
//                       <input type="radio" name={`q-${current.id}`} checked={checked} onChange={() => onChoose(current.id, op.id)} />
//                       <span>{op.content}</span>
//                     </label>
//                   );
//                 })}
//               </div>
//               <div className="flex items-center justify-between pt-2">
//                 <div className="flex gap-2">
//                   <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => setIndex(i => Math.max(i - 1, 0))} disabled={index===0}>← Trước</button>
//                   <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => setIndex(i => Math.min(i + 1, total - 1))} disabled={index===total-1}>Tiếp theo →</button>
//                 </div>
//                 <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onSubmit}>Nộp bài</button>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div className="text-xl font-semibold">Kết quả</div>

//               {quiz.explanation && (
//                 <div className="border rounded p-4 bg-green-50 whitespace-pre-wrap">
//                   <div className="font-medium mb-1">Giải thích</div>
//                   {quiz.explanation}
//                 </div>
//               )}

//               {(() => {
//                 let correct = 0;
//                 const details = questions.map(q => {
//                   const chosen = answers[q.id];
//                   const correctOption = (q.options || []).find(o => o.correct);
//                   const isOk = !!correctOption && chosen === correctOption.id;
//                   if (isOk) correct += 1;
//                   return { q, chosen, correctId: correctOption?.id, isOk };
//                 });
//                 return (
//                   <div className="space-y-3">
//                     <div className="text-sm">Điểm: <span className="font-medium">{correct}/{questions.length}</span></div>
//                     {details.map((d, i) => (
//                       <div key={d.q.id} className="border rounded p-3">
//                         <div className="font-medium">Câu {i + 1}."</div>\n                        <article className=\"prose max-w-none ql-content mt-2\"" +
                        // " dangerouslySetInnerHTML={{ __html: sanitizeHtml(d.q.content || \"\") }} />\n                        <div className=\"font-medium\">"</div>
//                         <div className="mt-2 space-y-1">
//                           {(d.q.options || []).map(op => (
//                             <div key={op.id} className={`text-sm ${op.id === d.correctId ? "text-green-700" : op.id === d.chosen ? "text-red-700" : "text-muted-foreground"}`}>
//                               {op.id === d.correctId ? "✔ " : op.id === d.chosen ? "✖ " : "• "}{op.content}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 );
//               })()}
//               <div className="flex gap-2">
//                 <button className="px-3 py-2 border rounded" onClick={()=>{ setSubmitted(false); setIndex(0); setAnswers({}); window.scrollTo(0,0); }}>Làm lại</button>
//                 <Link href={`/quiz/types/${quiz.quizTypeId}`} className="px-3 py-2 border rounded inline-block">← Về danh sách</Link>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
// import { getQuizPublic } from "@/lib/api/quiz";
import { getQuiz } from "@/lib/api/quiz/quiz";
import { listQuestionsByQuiz } from "@/lib/api/quiz/question";
import { sanitizeHtml } from "@/lib/sanitize";

export default function PracticePage() {
  const params = useParams();
  const id = params?.id;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [writingAnswer, setWritingAnswer] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const q = await getQuiz(id);
        setQuiz(q?.data || q);

        const r = await listQuestionsByQuiz(id, { page: 1, pageSize: 1000 });
        const items = r?.result || r?.data?.result || [];
        setQuestions(items);
      } catch (e) {
        console.error(e);
        setError("Không tải được đề thi hoặc câu hỏi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const current = questions[index] || null;
  const total = questions.length;

  const onChoose = (qid, oid) => setAnswers((prev) => ({ ...prev, [qid]: oid }));
  const isProdSkill = (s) => s === "SPEAKING" || s === "WRITING";

  const onSubmit = () => {
    if (!isProdSkill(quiz?.skill)) {
      if (Object.keys(answers).length < total) {
        if (!confirm("Bạn chưa chọn hết các câu. Vẫn nộp bài?")) return;
      }
    }
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (loading)
    return <div className="container mx-auto p-6">Đang tải đề thi...</div>;
  if (error)
    return <div className="container mx-auto p-6 text-red-600">{error}</div>;
  if (!quiz)
    return (
      <div className="container mx-auto p-6 text-red-600">
        Không tìm thấy đề thi.
      </div>
    );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">{quiz.description}</p>
          <div className="text-xs mt-2 inline-flex gap-2">
            <span className="px-2 py-1 border rounded">{quiz.quizTypeName}</span>
            <span className="px-2 py-1 border rounded">{quiz.skill}</span>
          </div>
        </div>
        <Link
          href={`/quiz/types/${quiz.quizTypeId}`}
          className="text-blue-600 underline"
        >
          ← Quay lại
        </Link>
      </div>

      {/* Đoạn văn ngữ cảnh */}
      {quiz.contextText && (
        <article
          className="prose max-w-none ql-content border rounded p-4 bg-gray-50"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(quiz.contextText),
          }}
        />
      )}

      {/* Nếu là WRITING/SPEAKING */}
      {isProdSkill(quiz.skill) ? (
        !submitted ? (
          <div className="space-y-4 border rounded p-4">
            {quiz.questionText && (
              <div className="text-lg font-medium whitespace-pre-wrap">
                {quiz.questionText}
              </div>
            )}

            {quiz.skill === "WRITING" ? (
              <textarea
                className="w-full min-h-[200px] border rounded px-3 py-2"
                placeholder="Nhập câu trả lời của bạn…"
                value={writingAnswer}
                onChange={(e) => setWritingAnswer(e.target.value)}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                Bài nói: hãy nói theo yêu cầu bên trên.
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={onSubmit}
              >
                Nộp bài
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xl font-semibold">Đã nộp bài</div>
            {quiz.skill === "WRITING" && (
              <div className="border rounded p-3">
                <div className="text-sm font-medium mb-1">Bài làm của bạn:</div>
                <div className="whitespace-pre-wrap">
                  {writingAnswer || "(trống)"}
                </div>
              </div>
            )}
            {quiz.explanation && (
              <div className="border rounded p-4 bg-green-50 whitespace-pre-wrap">
                <div className="font-medium mb-1">Giải thích</div>
                {quiz.explanation}
              </div>
            )}
            <Link
              href={`/quiz/types/${quiz.quizTypeId}`}
              className="px-3 py-2 border rounded inline-block"
            >
              ← Về danh sách
            </Link>
          </div>
        )
      ) : (
        // Nếu là MCQ (Reading/Listening)
        <>
          {!submitted ? (
            <div className="space-y-4 border rounded p-4">
              <div className="text-sm text-muted-foreground">
                Câu {index + 1}/{total}
              </div>

              <article
                className="prose max-w-none ql-content"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(current?.content || ""),
                }}
              />

              <div className="space-y-2">
                {(current?.options || []).map((op) => {
                  const checked = answers[current.id] === op.id;
                  return (
                    <label
                      key={op.id}
                      className={`flex items-center gap-3 border rounded p-3 cursor-pointer ${
                        checked ? "border-blue-500 bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${current.id}`}
                        checked={checked}
                        onChange={() => onChoose(current.id, op.id)}
                      />
                      <span>{op.content}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                    disabled={index === 0}
                  >
                    ← Trước
                  </button>
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
                    disabled={index === total - 1}
                  >
                    Tiếp theo →
                  </button>
                </div>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  onClick={onSubmit}
                >
                  Nộp bài
                </button>
              </div>
            </div>
          ) : (
            // Kết quả MCQ
            <div className="space-y-4">
              <div className="text-xl font-semibold">Kết quả</div>

              {quiz.explanation && (
                <div className="border rounded p-4 bg-green-50 whitespace-pre-wrap">
                  <div className="font-medium mb-1">Giải thích</div>
                  {quiz.explanation}
                </div>
              )}

              <div className="space-y-3">
                {questions.map((q, i) => {
                  const chosen = answers[q.id];
                  const correctOption = (q.options || []).find((o) => o.correct);
                  const isOk = !!correctOption && chosen === correctOption.id;

                  return (
                    <div key={q.id} className="border rounded p-3">
                      <div className="font-medium">Câu {i + 1}</div>
                      <article
                        className="prose max-w-none ql-content mt-2"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(q.content || ""),
                        }}
                      />

                      <div className="mt-2 space-y-2">
                        {(q.options || []).map((op) => {
                          const isCorrect = op.id === correctOption?.id;
                          const isChosen = op.id === chosen;
                          const color = isCorrect
                            ? "text-green-700"
                            : isChosen
                            ? "text-red-700"
                            : "text-muted-foreground";
                          const prefix = isCorrect
                            ? "✔ "
                            : isChosen
                            ? "✖ "
                            : "• ";

                          return (
                            <div key={op.id} className="text-sm">
                              <div className={color}>
                                {prefix}
                                {op.content}
                              </div>
                              {(op.explanation &&
                                (isCorrect || isChosen)) && (
                                <div className="text-xs italic mt-1 pl-6 opacity-80">
                                  {op.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  className="px-3 py-2 border rounded"
                  onClick={() => {
                    setSubmitted(false);
                    setIndex(0);
                    setAnswers({});
                    window.scrollTo(0, 0);
                  }}
                >
                  Làm lại
                </button>
                <Link
                  href={`/quiz/types/${quiz.quizTypeId}`}
                  className="px-3 py-2 border rounded inline-block"
                >
                  ← Về danh sách
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
