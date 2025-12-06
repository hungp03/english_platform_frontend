"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Editor from "@/components/common/editor"

export default function ContentSection({ introText, setIntroText, onContentChange, initialContent = "", errors }) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="intro" className="text-sm font-medium">
                    Giới thiệu <span className="text-muted-foreground text-xs">(tùy chọn)</span>
                </Label>
                <Input
                    id="intro"
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value)}
                    placeholder="VD: Chào mừng bạn đến với bài học phát âm đầu tiên!"
                    className="transition-all focus-visible:ring-2"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                    Nội dung <span className="text-destructive">*</span>
                </Label>
                <div className="min-h-[400px]">
                    <Editor
                        key={initialContent ? 'editor-with-content' : 'editor-empty'}
                        initialContent={initialContent}
                        onContentChange={onContentChange}
                    />
                </div>
                {errors?.content?.body && (
                    <p className="text-destructive text-sm mt-1">{errors.content.body.message}</p>
                )}
            </div>
        </div>
    )
}
