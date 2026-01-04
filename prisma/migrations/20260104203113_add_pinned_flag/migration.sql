-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "dueAt" DATETIME NOT NULL,
    "remindBeforeValue" INTEGER NOT NULL DEFAULT 0,
    "remindBeforeUnit" TEXT NOT NULL DEFAULT 'days',
    "status" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "linkedLogId" TEXT,
    "recurrenceRuleId" TEXT
);
INSERT INTO "new_Reminder" ("category", "createdAt", "dueAt", "id", "linkedLogId", "recurrenceRuleId", "remindBeforeUnit", "remindBeforeValue", "status", "title", "updatedAt") SELECT "category", "createdAt", "dueAt", "id", "linkedLogId", "recurrenceRuleId", "remindBeforeUnit", "remindBeforeValue", "status", "title", "updatedAt" FROM "Reminder";
DROP TABLE "Reminder";
ALTER TABLE "new_Reminder" RENAME TO "Reminder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
