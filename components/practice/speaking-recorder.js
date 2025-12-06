import { useState, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Upload } from "lucide-react";

const SpeakingRecorder = memo(function SpeakingRecorder({ questionId, onAnswer, onAudioReady }) {
  const [micPermission, setMicPermission] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [warning, setWarning] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
      return true;
    } catch (err) {
      setWarning("Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.");
      return false;
    }
  };

  const startRecording = async () => {
    if (!micPermission) {
      const granted = await requestMicPermission();
      if (!granted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setUploadedFileName("");
        onAnswer(questionId, blob);
        if (onAudioReady) {
          onAudioReady(questionId, blob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setWarning("Không thể bắt đầu ghi âm. Vui lòng thử lại.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => setPlaying(false);
      
      audio.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setWarning("Vui lòng chọn file audio hợp lệ");
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);
    setUploadedFileName(file.name);
    setWarning("");
    onAnswer(questionId, file);
    if (onAudioReady) {
      onAudioReady(questionId, file);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border-2 border-blue-200 dark:border-blue-800">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          Ghi âm hoặc tải lên file audio
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {!recording && !audioBlob && "Nhấn nút bên dưới để bắt đầu ghi âm hoặc tải file lên"}
          {recording && "Đang ghi âm... Hãy nói câu trả lời của bạn"}
          {!recording && audioBlob && (uploadedFileName ? `File: ${uploadedFileName}` : "Ghi âm hoàn tất! Bạn có thể nghe lại hoặc ghi lại")}
        </p>
        {warning && <p className="text-sm text-red-600">{warning}</p>}
      </div>

      <div className="flex flex-col items-center gap-4">
        {recording && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 dark:text-red-400 font-medium">Đang ghi âm</span>
            </div>
            <div className="text-3xl font-mono font-bold text-blue-900 dark:text-blue-100">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {!recording ? (
            <>
              <Button
                onClick={startRecording}
                variant="default"
                size="lg"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                <Mic className="h-5 w-5" />
                {audioBlob ? "Ghi lại" : "Bắt đầu ghi âm"}
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="lg"
                className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Upload className="h-5 w-5" />
                Tải file lên
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {audioBlob && (
                <>
                  {!playing ? (
                    <Button
                      onClick={playAudio}
                      variant="outline"
                      size="lg"
                      className="gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      <Play className="h-5 w-5" />
                      Nghe lại
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseAudio}
                      variant="outline"
                      size="lg"
                      className="gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      <Pause className="h-5 w-5" />
                      Tạm dừng
                    </Button>
                  )}
                </>
              )}
            </>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="gap-2 px-8"
            >
              <Square className="h-5 w-5" />
              Dừng ghi âm
            </Button>
          )}
        </div>

        {audioBlob && !recording && (
          <>
            <audio
              controls
              preload="metadata"
              className="w-full max-w-md"
              src={audioUrl}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Đã ghi âm thành công</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default SpeakingRecorder;
