import { memo } from "react";
import UserCard from "./user-card";

const UserList = memo(function UserList({ users, onToggle }) {
  if (!users?.length) return null;
  return (
    <div className="space-y-4">
      {users.map((u) => (
        <UserCard key={u.id} user={u} onToggle={onToggle} />
      ))}
    </div>
  );
});

export default UserList;
