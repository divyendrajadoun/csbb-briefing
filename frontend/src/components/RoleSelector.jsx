const ROLES = [
  { id: "cs", label: "Chief Secretary" },
  { id: "ps", label: "Principal Secretary" },
  { id: "support_cell", label: "Support Cell" },
];

export default function RoleSelector({ currentRole, onRoleChange, disabled }) {
  return (
    <div className="role-selector">
      <label>Role:</label>
      <select
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value)}
        disabled={disabled}
      >
        {ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
