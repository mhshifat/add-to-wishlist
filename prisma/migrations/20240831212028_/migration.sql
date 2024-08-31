/*
  Warnings:

  - The primary key for the `Customization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Customization` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customization" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "atwBtnStyles" TEXT NOT NULL
);
INSERT INTO "new_Customization" ("atwBtnStyles", "id", "shop") SELECT "atwBtnStyles", "id", "shop" FROM "Customization";
DROP TABLE "Customization";
ALTER TABLE "new_Customization" RENAME TO "Customization";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
