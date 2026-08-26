-- CreateEnum
CREATE TYPE "NavItemType" AS ENUM ('link', 'dropdown', 'button', 'group', 'divider');

-- AlterTable
ALTER TABLE "nav_items" ADD COLUMN     "badge" VARCHAR(50),
ADD COLUMN     "config" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "description" VARCHAR(300),
ADD COLUMN     "icon" VARCHAR(50),
ADD COLUMN     "item_type" "NavItemType" NOT NULL DEFAULT 'link',
ALTER COLUMN "url" SET DEFAULT '';
