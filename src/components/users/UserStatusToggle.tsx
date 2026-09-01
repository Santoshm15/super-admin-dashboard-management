import type { UserStatus } from "../../types/user.types";

interface UserStatusToggleProps {
  status: UserStatus;
  onChange: (status: UserStatus) => void;
  disabled?: boolean;
}

const statuses: UserStatus[] = ["Active", "Inactive", "Suspended"];

function UserStatusToggle({
  status,
  onChange,
  disabled = false,
}: UserStatusToggleProps) {
  return (
    <div className="user-status-toggle">
      {statuses.map((item) => (
        <button
          key={item}
          type="button"
          disabled={disabled}
          className={
            item === status ? "user-status-option active" : "user-status-option"
          }
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default UserStatusToggle;
