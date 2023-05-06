-- CreateEnum
CREATE TYPE "RequestState" AS ENUM ('SENT', 'CANCELLED', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('FRIEND_REQUEST');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('FRIEND_DELETED', 'CHAT_ACCESS_REVOKED', 'CHAT_ACCESS_GRANTED', 'CHAT_ROLE_CHANGED', 'CHAT_DELETED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BASIC', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('DIRECT_MESSAGE', 'GROUP');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MESSAGE', 'CHAT_UPDATE');

-- CreateEnum
CREATE TYPE "ChatUpdateType" AS ENUM ('MEMBERS_ADDED', 'MEMBERS_REMOVED', 'ROLE_CHANGED', 'NAME_CHANGED', 'DESCRIPTION_CHANGED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "type" "RequestType" NOT NULL,
    "state" "RequestState" NOT NULL DEFAULT 'SENT',
    "recipientId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "type" "AlertType" NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" INTEGER,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BASIC',
    "addedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "removedById" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "type" "ChatType" NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "createdById" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "type" "EventType" NOT NULL,
    "chatId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "eventId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "ChatUpdate" (
    "type" "ChatUpdateType" NOT NULL,
    "eventId" INTEGER NOT NULL,
    "nameBefore" TEXT,
    "nameAfter" TEXT,
    "descriptionBefore" TEXT,
    "descriptionAfter" TEXT,
    "newRole" "Role",

    CONSTRAINT "ChatUpdate_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "_Friends" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AlertsReceived" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MessageLikedBy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ChatUpdateToMember" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Request_createdAt_key" ON "Request"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Request_recipientId_createdById_type_key" ON "Request"("recipientId", "createdById", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_createdAt_key" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_createdById_idx" ON "Alert"("createdById");

-- CreateIndex
CREATE INDEX "Alert_chatId_idx" ON "Alert"("chatId");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Member_userId_chatId_idx" ON "Member"("userId", "chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_chatId_key" ON "Member"("userId", "chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_eventId_key" ON "Message"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatUpdate_eventId_key" ON "ChatUpdate"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "_Friends_AB_unique" ON "_Friends"("A", "B");

-- CreateIndex
CREATE INDEX "_Friends_B_index" ON "_Friends"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlertsReceived_AB_unique" ON "_AlertsReceived"("A", "B");

-- CreateIndex
CREATE INDEX "_AlertsReceived_B_index" ON "_AlertsReceived"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageLikedBy_AB_unique" ON "_MessageLikedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageLikedBy_B_index" ON "_MessageLikedBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatUpdateToMember_AB_unique" ON "_ChatUpdateToMember"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatUpdateToMember_B_index" ON "_ChatUpdateToMember"("B");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_removedById_fkey" FOREIGN KEY ("removedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUpdate" ADD CONSTRAINT "ChatUpdate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertsReceived" ADD CONSTRAINT "_AlertsReceived_A_fkey" FOREIGN KEY ("A") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertsReceived" ADD CONSTRAINT "_AlertsReceived_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageLikedBy" ADD CONSTRAINT "_MessageLikedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageLikedBy" ADD CONSTRAINT "_MessageLikedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatUpdateToMember" ADD CONSTRAINT "_ChatUpdateToMember_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatUpdate"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatUpdateToMember" ADD CONSTRAINT "_ChatUpdateToMember_B_fkey" FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
