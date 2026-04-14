#!/usr/bin/env python3
"""Patch renderAbsencesTable in script.js with enhanced version."""

import re

file = r"c:\Users\Manav Darji\Desktop\Project\Website\static\script.js"

with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# Find the exact block by index
start_marker = "const renderAbsencesTable = (absences) => {"
end_marker = "        };\n"

idx = content.find(start_marker)
if idx == -1:
    print("ERROR: start marker not found")
    exit(1)

# Find the closing }; of the function
end_idx = content.find(end_marker, idx)
if end_idx == -1:
    end_marker = "        };\r\n"
    end_idx = content.find(end_marker, idx)
if end_idx == -1:
    print("ERROR: end marker not found")
    exit(1)

end_idx += len(end_marker)
print(f"Found block: chars {idx}–{end_idx}")

new_block = r"""const renderAbsencesTable = (absences) => {
            if (!absenceTbody) return;
            absenceTbody.innerHTML = '';
            if (absences.length === 0) {
                absenceTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--dark-gray);padding:2rem;">No absences recorded. Click <strong>Record Absence</strong> to add one.</td></tr>';
                return;
            }

            const today = new Date().toISOString().split('T')[0];

            absences.forEach(absence => {
                const row = document.createElement('tr');

                // Duration in days
                const startD = new Date(absence.start_date);
                const endD   = new Date(absence.end_date);
                const durationDays = Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
                const durationLabel = durationDays === 1 ? '1 day' : `${durationDays} days`;

                // Date range string
                const dateRange = absence.start_date === absence.end_date
                    ? absence.start_date
                    : `${absence.start_date} \u2192 ${absence.end_date}`;

                // Is the teacher currently absent right now?
                const isNow = absence.status === 'pending'
                    && today >= absence.start_date
                    && today <= absence.end_date;

                // Build status badge
                const statusBadge = isNow
                    ? `<span class="status-badge status-pending" style="display:inline-flex;align-items:center;gap:5px;">
                           <span style="width:7px;height:7px;border-radius:50%;background:currentColor;display:inline-block;"></span>
                           Absent Now
                       </span>`
                    : `<span class="status-badge status-${absence.status}">${absence.status}</span>`;

                // Teacher cell — highlighted when currently absent
                const teacherCell = isNow
                    ? `<strong style="color:var(--danger-color,#e74c3c);">${absence.teacher_name || 'Unknown'}</strong>
                       <span style="font-size:0.7rem;color:var(--danger-color,#e74c3c);display:block;margin-top:2px;font-weight:600;">\u25cf Currently Absent</span>`
                    : `<strong>${absence.teacher_name || 'Unknown'}</strong>`;

                // Reason — truncated with tooltip for long values
                const reason = absence.reason || '\u2014';
                const reasonDisplay = reason.length > 70
                    ? `<span title="${reason.replace(/"/g, '&quot;')}" style="cursor:help;">${reason.substring(0, 67)}\u2026</span>`
                    : reason;

                // Action buttons — no Resolve for already resolved rows
                const actionBtns = absence.status === 'resolved'
                    ? `<button class="btn btn-secondary btn-sm" onclick="deleteAbsence(${absence.absence_id})">Delete</button>`
                    : `<button class="btn btn-primary btn-sm" onclick="resolveAbsence(${absence.absence_id})" title="AI suggest / manual assign / reschedule">Resolve</button>
                       <button class="btn btn-secondary btn-sm" onclick="deleteAbsence(${absence.absence_id})">Delete</button>`;

                // Visually highlight active absences
                if (isNow) {
                    row.style.background  = 'rgba(231,76,60,0.04)';
                    row.style.borderLeft  = '3px solid var(--danger-color,#e74c3c)';
                }

                row.innerHTML = `
                    <td style="min-width:130px;">${teacherCell}</td>
                    <td style="white-space:nowrap;">
                        ${dateRange}
                        <span style="font-size:0.75rem;color:var(--dark-gray);display:block;">${durationLabel}</span>
                    </td>
                    <td style="max-width:220px;word-break:break-word;">${reasonDisplay}</td>
                    <td style="white-space:nowrap;">${durationLabel}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="teacher-actions" style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                            ${actionBtns}
                        </div>
                    </td>`;
                absenceTbody.appendChild(row);
            });
        };
"""

# Normalize line endings to match the file
if "\r\n" in content:
    new_block = new_block.replace("\n", "\r\n")

content = content[:idx] + new_block + content[end_idx:]

with open(file, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: renderAbsencesTable upgraded")
