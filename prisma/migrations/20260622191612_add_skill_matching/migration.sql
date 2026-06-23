-- CreateEnum
CREATE TYPE "SkillKind" AS ENUM ('OFFER', 'SEEK');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "kind" "SkillKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "seekerId" UUID NOT NULL,
    "offererId" UUID NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "UserSkill_skillId_kind_idx" ON "UserSkill"("skillId", "kind");

-- CreateIndex
CREATE INDEX "UserSkill_userId_kind_idx" ON "UserSkill"("userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skillId_kind_key" ON "UserSkill"("userId", "skillId", "kind");

-- CreateIndex
CREATE INDEX "Match_offererId_idx" ON "Match"("offererId");

-- CreateIndex
CREATE INDEX "Match_seekerId_idx" ON "Match"("seekerId");

-- CreateIndex
CREATE INDEX "Match_skillId_status_idx" ON "Match"("skillId", "status");

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_offererId_fkey" FOREIGN KEY ("offererId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- enforce: a seeker can have only ONE active match per skill
CREATE UNIQUE INDEX "one_active_match_per_seek"
  ON "Match" ("seekerId", "skillId")
  WHERE "status" = 'ACTIVE';
