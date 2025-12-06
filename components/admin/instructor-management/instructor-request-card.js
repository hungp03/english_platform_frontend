"use client";

import React from "react";
import Link from "next/link";
import { Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const InstructorRequestCard = ({ request }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</Badge>;
      case "APPROVED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.user?.avatarUrl} alt={request.user?.fullName} />
            <AvatarFallback>
              {request.user?.fullName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{request.user?.fullName}</h3>
              {getStatusBadge(request.status)}
            </div>

            <p className="text-sm text-muted-foreground mb-2">{request.user?.email}</p>

            <div className="text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Ngày đăng ký:</span>{" "}
                {new Date(request.requestedAt).toLocaleDateString("vi-VN")}
              </div>
              {request.reviewedAt && (
                <div>
                  <span className="font-medium">Ngày xét duyệt:</span>{" "}
                  {new Date(request.reviewedAt).toLocaleDateString("vi-VN")}
                  {request.reviewedByName && ` bởi ${request.reviewedByName}`}
                </div>
              )}
            </div>

            {request.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {request.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <Link href={`/admin/instructors/${request.id}`}>
            <Button
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              Chi tiết
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstructorRequestCard;