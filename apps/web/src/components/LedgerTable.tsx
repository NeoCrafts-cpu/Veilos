import type { ReactNode } from "react";

export function LedgerTable({
  columns,
  empty,
  children,
}: {
  columns: string[];
  empty?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="ledger-wrap">
      <table className="ledger-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children ? (
            children
          ) : (
            <tr className="ledger-empty">
              <td colSpan={columns.length}>{empty ?? "Nothing public yet."}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
