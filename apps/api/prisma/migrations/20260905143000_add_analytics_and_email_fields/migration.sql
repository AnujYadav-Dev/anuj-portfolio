-- AlterEnum
ALTER TYPE "ClickTargetType" ADD VALUE 'code_copy';
ALTER TYPE "ClickTargetType" ADD VALUE 'cta_button';

-- AlterTable
ALTER TABLE "visitors" ADD COLUMN "utm_term" VARCHAR(200),
ADD COLUMN "utm_content" VARCHAR(200),
ADD COLUMN "intent_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "intent_category" VARCHAR(50);

-- CreateIndex
CREATE INDEX "idx_visitors_last_visited" ON "visitors"("last_visited_at" DESC);
CREATE INDEX "idx_visitors_intent_category" ON "visitors"("intent_category");

-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN "purpose" VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN "description" VARCHAR(500),
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "template_key" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "idx_email_templates_purpose_active" ON "email_templates"("purpose", "is_active");

-- AlterTable
ALTER TABLE "page_views" ADD COLUMN "scroll_depth" SMALLINT,
ADD COLUMN "load_time_ms" INTEGER;

-- DropIndex
DROP INDEX IF EXISTS "idx_page_views_visitor_id";
DROP INDEX IF EXISTS "idx_page_views_path";

-- CreateIndex
CREATE INDEX "idx_page_views_visitor_viewed" ON "page_views"("visitor_id", "viewed_at" DESC);
CREATE INDEX "idx_page_views_path_viewed" ON "page_views"("path", "viewed_at" DESC);
CREATE INDEX "idx_page_views_viewed_at" ON "page_views"("viewed_at" DESC);

-- AlterTable
ALTER TABLE "link_clicks" ADD COLUMN "label" VARCHAR(200);

-- DropIndex
DROP INDEX IF EXISTS "idx_link_clicks_visitor_id";
DROP INDEX IF EXISTS "idx_link_clicks_target_type";

-- CreateIndex
CREATE INDEX "idx_link_clicks_visitor_clicked" ON "link_clicks"("visitor_id", "clicked_at" DESC);
CREATE INDEX "idx_link_clicks_target_type" ON "link_clicks"("target_type", "clicked_at" DESC);
CREATE INDEX "idx_link_clicks_clicked_at" ON "link_clicks"("clicked_at" DESC);
