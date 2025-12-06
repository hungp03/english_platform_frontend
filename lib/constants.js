export const navItems = [
  { name: "Trang chủ", path: "/" },
  { name: "Luyện tập", path: "/mock-tests" },
  { name: "Diễn đàn", path: "/forum" },
  { name: "Khóa học", path: "/courses" },
  { name: "Blog", path: "/blog" },
];

export const ErrorCode = {
  EXCEPTION: 1,
  BAD_CREDENTIALS: 2,
  RESOURCE_NOT_FOUND: 3,
  UNAUTHORIZED: 4,
  RESOURCE_INVALID: 5,
  RESOURCE_ALREADY_EXISTS: 6,
  METHOD_NOT_VALID: 7,
  CANNOT_DELETE: 8,
  FORBIDDEN: 9,
  OPERATION_NOT_ALLOWED: 10,
  DUPLICATE_KEY: 11,
  RESOURCE_ALREADY_OWNER: 12
};

export const ValidationPattern = {
  EMAIL_PATTERN: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/,
};
