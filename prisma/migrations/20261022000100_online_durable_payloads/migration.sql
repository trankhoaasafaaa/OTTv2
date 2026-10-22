CREATE TABLE "SubmissionSource" (
  "submissionId" TEXT PRIMARY KEY REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "content" TEXT NOT NULL,
  "byteLength" INTEGER NOT NULL,
  CONSTRAINT "source_size" CHECK ("byteLength" BETWEEN 1 AND 500000 AND octet_length("content") = "byteLength")
);
CREATE TABLE "MatchReplay" (
  "matchId" TEXT PRIMARY KEY REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "payload" JSONB NOT NULL,
  "sha256" TEXT NOT NULL,
  "byteLength" INTEGER NOT NULL CHECK ("byteLength" BETWEEN 1 AND 8388608)
);
CREATE TABLE "WorkerLease" (
  "matchId" TEXT PRIMARY KEY REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "deadlineAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "resultDigest" TEXT
);
CREATE UNIQUE INDEX "WorkerLease_tokenHash_key" ON "WorkerLease"("tokenHash");
CREATE INDEX "WorkerLease_completedAt_expiresAt_idx" ON "WorkerLease"("completedAt", "expiresAt");
CREATE TABLE "JsonImportReceipt" (
  "key" TEXT PRIMARY KEY,
  "digest" TEXT NOT NULL,
  "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
