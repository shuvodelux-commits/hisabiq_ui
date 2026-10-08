import { useState } from "react";
import { Plus, Pencil, Eye, ShieldCheck } from "lucide-react";
import {
  canManage,
  permissions,
  type BusinessEmployee,
  type BusinessRole,
  type TeamSettings as TeamData,
  type TenantSettings,
} from "./model";
import { Button, Input, SettingsDialog, SettingsField } from "./ui";
import { sectionNames } from "./fields";

export function TeamSettings({
  value,
  onChange,
  disabled,
  advanced,
  state,
}: {
  value: TeamData;
  onChange: (v: TeamData) => void;
  disabled: boolean;
  advanced: boolean;
  state: TenantSettings;
}) {
  const [selectedTab, setTab] = useState("employees");
  const tab = advanced ? selectedTab : "employees";
  const [employee, setEmployee] = useState<BusinessEmployee | null>(null);
  const [role, setRole] = useState<BusinessRole | null>(null);
  const [access, setAccess] = useState<BusinessEmployee | null>(null);
  const [initial, setInitial] = useState("");
  const [error, setError] = useState("");
  const openEmployee = (e?: BusinessEmployee) => {
    const next = e
      ? structuredClone(e)
      : {
          id: crypto.randomUUID(),
          name: "",
          email: "",
          roleIds: ["cashier"],
          active: true,
        };
    setInitial(JSON.stringify(next));
    setError("");
    setEmployee(next);
  };
  const openRole = (r?: BusinessRole) => {
    const next = r
      ? structuredClone(r)
      : {
          id: crypto.randomUUID(),
          name: "",
          permissions: ["view"] as BusinessRole["permissions"],
        };
    setInitial(JSON.stringify(next));
    setError("");
    setRole(next);
  };
  const close = () => {
    if (
      (employee || role) &&
      JSON.stringify(employee || role) !== initial &&
      !window.confirm("Discard this unsaved editor?")
    )
      return;
    setEmployee(null);
    setRole(null);
    setError("");
  };
  const preview = { ...state, sections: { ...state.sections, team: value } };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" aria-label="Employee settings views">
          {(advanced ? ["employees", "roles"] : ["employees"]).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "secondary" : "ghost"}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
            >
              {t === "employees" ? "Employees" : "Roles"}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => (tab === "employees" ? openEmployee() : openRole())}
        >
          <Plus className="size-4" />
          {tab === "employees" ? "Add demo employee" : "Create role"}
        </Button>
      </div>
      <p className="text-xs text-ink-500">
        Business employees are separate from SaaS support staff. These roles
        control this settings demonstration; no invitation email is sent.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-ink-50 text-ink-600">
            <tr>
              <th className="px-3 py-2 font-medium">
                {tab === "employees" ? "Employee" : "Role"}
              </th>
              <th className="px-3 py-2 font-medium">
                {tab === "employees" ? "Responsibilities" : "Permissions"}
              </th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tab === "employees"
              ? value.employees.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{e.name}</p>
                      <p className="text-xs text-ink-500">{e.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {e.roleIds.map((id) => (
                          <span
                            key={id}
                            className="rounded bg-ink-100 px-2 py-1 text-xs text-ink-600"
                          >
                            {value.roles.find((r) => r.id === id)?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={e.active ? "text-success" : "text-ink-500"}
                      >
                        {e.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAccess(e)}
                          aria-label={`View access for ${e.name}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={disabled}
                          onClick={() => openEmployee(e)}
                          aria-label={`Edit employee ${e.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              : value.roles.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-3 font-medium text-ink">{r.name}</td>
                    <td className="px-3 py-3 text-ink-600">
                      {r.permissions.length} permissions ·{" "}
                      {
                        value.employees.filter((e) => e.roleIds.includes(r.id))
                          .length
                      }{" "}
                      employees
                    </td>
                    <td className="px-3 py-3 text-xs text-ink-500">
                      {r.id === "owner" ? "Protected" : "Configurable"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={disabled || r.id === "owner"}
                        onClick={() => openRole(r)}
                      >
                        Edit role
                      </Button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <SettingsDialog
        title={
          employee && value.employees.some((e) => e.id === employee.id)
            ? "Edit employee"
            : "Add demo employee"
        }
        description="Assign multiple responsibilities. Save the section to apply this draft."
        open={!!employee}
        onClose={close}
      >
        {employee && (
          <div className="space-y-4">
            <SettingsField label="Employee name" bn="কর্মীর নাম">
              {(id) => (
                <Input
                  id={id}
                  value={employee.name}
                  onChange={(e) =>
                    setEmployee({ ...employee, name: e.target.value })
                  }
                />
              )}
            </SettingsField>
            <SettingsField label="Employee email" bn="কর্মীর ইমেইল">
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  value={employee.email}
                  onChange={(e) =>
                    setEmployee({ ...employee, email: e.target.value })
                  }
                />
              )}
            </SettingsField>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">
                Assigned roles
              </legend>
              {value.roles.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-2 rounded border border-border p-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={employee.roleIds.includes(r.id)}
                    onChange={(e) =>
                      setEmployee({
                        ...employee,
                        roleIds: e.target.checked
                          ? [...employee.roleIds, r.id]
                          : employee.roleIds.filter((id) => id !== r.id),
                      })
                    }
                  />
                  {r.name}
                </label>
              ))}
            </fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={employee.active}
                onChange={(e) =>
                  setEmployee({ ...employee, active: e.target.checked })
                }
              />
              Active employee
            </label>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (
                    !employee.name.trim() ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email) ||
                    !employee.roleIds.length
                  )
                    return setError(
                      "Enter a name, a valid email and at least one role.",
                    );
                  onChange({
                    ...value,
                    employees: [
                      ...value.employees.filter((e) => e.id !== employee.id),
                      employee,
                    ],
                  });
                  setEmployee(null);
                }}
              >
                Keep employee draft
              </Button>
            </div>
          </div>
        )}
      </SettingsDialog>
      <SettingsDialog
        title="Configure role"
        description="One employee can combine this role with other roles. Owner authority is protected."
        open={!!role}
        onClose={close}
      >
        {role && (
          <div className="space-y-4">
            <SettingsField label="Role name" bn="দায়িত্বের নাম">
              {(id) => (
                <Input
                  id={id}
                  value={role.name}
                  onChange={(e) => setRole({ ...role, name: e.target.value })}
                />
              )}
            </SettingsField>
            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="mb-2 text-sm font-medium">
                Settings permissions
              </legend>
              {permissions.map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-2 rounded border border-border p-2 text-xs"
                >
                  <input
                    type="checkbox"
                    disabled={p === "view" || p === "import"}
                    checked={role.permissions.includes(p)}
                    onChange={(e) =>
                      setRole({
                        ...role,
                        permissions: e.target.checked
                          ? [...role.permissions, p]
                          : role.permissions.filter((id) => id !== p),
                      })
                    }
                  />
                  {p === "view"
                    ? "View settings"
                    : p === "export"
                      ? "Download backups"
                      : p === "import"
                        ? "Restore backups (owner only)"
                        : `Manage ${sectionNames[p].label}`}
                </label>
              ))}
            </fieldset>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <div className="flex flex-wrap justify-between gap-2">
              <Button
                variant="outline"
                disabled={
                  !value.roles.some((r) => r.id === role.id) ||
                  value.employees.some((e) => e.roleIds.includes(role.id))
                }
                onClick={() => {
                  onChange({
                    ...value,
                    roles: value.roles.filter((r) => r.id !== role.id),
                  });
                  setRole(null);
                }}
              >
                Delete unused role
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (
                      !role.name.trim() ||
                      value.roles.some(
                        (r) =>
                          r.id !== role.id &&
                          r.name.trim().toLowerCase() ===
                            role.name.trim().toLowerCase(),
                      )
                    )
                      return setError("Use a unique role name.");
                    onChange({
                      ...value,
                      roles: [
                        ...value.roles.filter((r) => r.id !== role.id),
                        role,
                      ],
                    });
                    setRole(null);
                  }}
                >
                  Keep role draft
                </Button>
              </div>
            </div>
            <p className="text-xs text-ink-500">
              Reassign employees before deleting a used role.
            </p>
          </div>
        )}
      </SettingsDialog>
      <SettingsDialog
        title={`Effective access: ${access?.name || ""}`}
        description="Combined permissions from every assigned role in this business."
        open={!!access}
        onClose={() => setAccess(null)}
      >
        {access && (
          <div className="space-y-2">
            {permissions.map((p) => (
              <div
                key={p}
                className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2 text-sm"
              >
                <span>
                  {p === "view"
                    ? "View settings"
                    : p === "export"
                      ? "Download backups"
                      : p === "import"
                        ? "Restore backups (owner only)"
                        : sectionNames[p].label}
                </span>
                <span
                  className={
                    canManage(preview, access.id, p)
                      ? "text-success"
                      : "text-ink-500"
                  }
                >
                  {canManage(preview, access.id, p) ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-4" />
                      Allowed
                    </span>
                  ) : (
                    "Read only"
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </SettingsDialog>
    </div>
  );
}
