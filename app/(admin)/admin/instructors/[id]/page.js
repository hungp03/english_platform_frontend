"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getAdminInstructorRequestDetails,
  reviewInstructorRequest
} from "@/lib/api/instructor";
import { LoadingState } from "@/components/admin/instructor-management/loading-state";
import { NotFoundState } from "@/components/admin/instructor-management/not-found-state";
import { InstructorDetailHeader } from "@/components/admin/instructor-management/instructor-detail-header";
import { InstructorInfoCard } from "@/components/admin/instructor-management/instructor-info-card";
import { CertificateListCard } from "@/components/admin/instructor-management/certificate-list-card";
import { ProcessingInfoCard } from "@/components/admin/instructor-management/processing-info-card";
import { ActionDialog } from "@/components/admin/instructor-management/action-dialog";

const REJECTION_REASON_TEXT = {
  QUALIFICATION_INSUFFICIENT: "Bằng cấp không đủ yêu cầu",
  EXPERIENCE_INSUFFICIENT: "Kinh nghiệm không đủ yêu cầu",
  DOCUMENTATION_INCOMPLETE: "Thiếu tài liệu",
  DUPLICATE_REQUEST: "Yêu cầu trùng lặp",
  OTHER: ""
};

const InstructorDetailsPage = ({ params }) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("QUALIFICATION_INSUFFICIENT");

  useEffect(() => {
    fetchRequestDetails();
  }, [resolvedParams.id]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const { success, data } = await getAdminInstructorRequestDetails(resolvedParams.id);
      if (success) {
        setRequest(data);
      } else {
        toast.error("Lấy chi tiết yêu cầu thất bại");
        router.push("/admin/instructors");
      }
    } catch (error) {
      console.error("[ERROR] Fetching request details:", error);
      toast.error("Lấy chi tiết yêu cầu thất bại");
      router.push("/admin/instructors");
    } finally {
      setLoading(false);
    }
  };



  const handleApprove = () => {
    setActionType("approve");
    setReviewNotes("");
    setActionDialog(true);
  };

  const handleReject = () => {
    setActionType("reject");
    setReviewNotes("");
    setRejectionReason("QUALIFICATION_INSUFFICIENT");
    setActionDialog(true);
  };

  const handleRejectionReasonChange = (reason) => {
    setRejectionReason(reason);
    if (reason !== "OTHER") {
      setReviewNotes("");
    }
  };

  const handleConfirmAction = async () => {
    if (!request) return;

    try {
      let result;
      let adminNotes = "";
      
      if (actionType === "approve") {
        adminNotes = reviewNotes;
        result = await reviewInstructorRequest(request.id, "APPROVE", adminNotes);
        if (result.success) {
          toast.success("Phê duyệt yêu cầu thành công");
        } else {
          toast.error(result.error || "Phê duyệt yêu cầu thất bại");
        }
      } else if (actionType === "reject") {
        if (rejectionReason === "OTHER") {
          adminNotes = reviewNotes;
        } else {
          adminNotes = REJECTION_REASON_TEXT[rejectionReason];
        }
        
        result = await reviewInstructorRequest(request.id, "REJECT", adminNotes);
        if (result.success) {
          toast.success("Từ chối yêu cầu thành công");
        } else {
          toast.error(result.error || "Từ chối yêu cầu thất bại");
        }
      }

      if (result.success) {
        await fetchRequestDetails();
      }
    } catch (error) {
      console.error("[ERROR] Processing request:", error);
      toast.error(`${actionType === "approve" ? "Phê duyệt" : "Từ chối"} yêu cầu thất bại`);
    } finally {
      setActionDialog(false);
      setActionType(null);
      setReviewNotes("");
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!request) {
    return <NotFoundState onBackClick={() => router.push("/admin/instructors")} />;
  }

  return (
    <div className="w-full">
      <InstructorDetailHeader
        onBack={() => router.push("/admin/instructors")}
        onApprove={handleApprove}
        onReject={handleReject}
        status={request.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InstructorInfoCard request={request} />
          <CertificateListCard certificates={request.certificateProofs} />
        </div>

        <div className="space-y-6">
          <ProcessingInfoCard request={request} />
        </div>
      </div>

      <ActionDialog
        open={actionDialog}
        onOpenChange={setActionDialog}
        actionType={actionType}
        fullName={request.fullName}
        reviewNotes={reviewNotes}
        onReviewNotesChange={setReviewNotes}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={handleRejectionReasonChange}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default InstructorDetailsPage;