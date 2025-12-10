"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, Pencil, X, Mail, Calendar } from "lucide-react";
import { getPublicInstructorOverview, updateInstructorProfile } from "@/lib/api/instructor";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { updateInstructorProfileSchema } from "@/schema/instructor";
import Editor from "@/components/common/editor";

export default function ProfileContent() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [mounted, setMounted] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(updateInstructorProfileSchema),
    defaultValues: { bio: "", expertise: "", experienceYears: 0, qualification: "" }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.id && mounted) fetchProfile();
  }, [user?.id, mounted]);

  const fetchProfile = async () => {
    setLoading(true);
    const result = await getPublicInstructorOverview(user.id);
    if (result.success) {
      const p = result.data.profile;
      setProfile(p);
      reset({
        bio: p.bio || "",
        expertise: p.expertise || "",
        experienceYears: p.experienceYears || 0,
        qualification: p.qualification || ""
      });
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const result = await updateInstructorProfile(data);
    if (result.success) {
      setProfile({ ...profile, ...data });
      setEditing(false);
      toast.success("Cập nhật hồ sơ thành công");
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    reset({
      bio: profile?.bio || "",
      expertise: profile?.expertise || "",
      experienceYears: profile?.experienceYears || 0,
      qualification: profile?.qualification || ""
    });
    setEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6" suppressHydrationWarning>
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Hồ sơ giảng viên</h2>
          <p className="text-muted-foreground mt-1">Thông tin hồ sơ của bạn</p>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.fullName} />
              <AvatarFallback className="text-2xl">{profile?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">{profile?.fullName}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Tham gia từ {formatDate(profile?.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chuyên môn</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Giới thiệu bản thân</Label>
                <Editor
                  initialContent={watch("bio")}
                  onContentChange={(val) => setValue("bio", val)}
                />
                {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Chuyên môn</Label>
                <Input id="expertise" {...register("expertise")} placeholder="VD: IELTS, TOEIC..." />
                {errors.expertise && <p className="text-sm text-red-500">{errors.expertise.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Số năm kinh nghiệm</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    {...register("experienceYears", { valueAsNumber: true })}
                  />
                  {errors.experienceYears && <p className="text-sm text-red-500">{errors.experienceYears.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Bằng cấp / Chứng chỉ</Label>
                  <Input id="qualification" {...register("qualification")} placeholder="VD: TESOL, CELTA..." />
                  {errors.qualification && <p className="text-sm text-red-500">{errors.qualification.message}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Lưu thay đổi
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" /> Hủy
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Giới thiệu bản thân</Label>
                <div
                  className="mt-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: profile?.bio || "<p>Chưa có thông tin</p>" }}
                />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-muted-foreground">Chuyên môn</Label>
                  <p className="mt-1 font-medium">{profile?.expertise || "Chưa có thông tin"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số năm kinh nghiệm</Label>
                  <p className="mt-1 font-medium">{profile?.experienceYears || 0} năm</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bằng cấp / Chứng chỉ</Label>
                  <p className="mt-1 font-medium">{profile?.qualification || "Chưa có thông tin"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

