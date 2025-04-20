/**
 * This file contains SQL function definitions as strings that can be executed
 * in Supabase to create database functions and policies.
 */

// Function to allow users to exit a chat room
export const exitChatRoomSQL = `
CREATE OR REPLACE FUNCTION exit_chat_room(chat_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_members UUID[];
  updated_members UUID[];
BEGIN
  -- Get the current members array
  SELECT members INTO current_members
  FROM "Chats"
  WHERE "chatID" = chat_id;
  
  -- Check if the user is in the members array
  IF NOT user_id = ANY(current_members) THEN
    RETURN FALSE;
  END IF;
  
  -- Remove the user from the members array
  SELECT array_remove(current_members, user_id) INTO updated_members;
  
  -- Update the chat room with security definer to bypass RLS
  UPDATE "Chats"
  SET members = updated_members
  WHERE "chatID" = chat_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

// Function to update chat members
export const updateChatMembersSQL = `
CREATE OR REPLACE FUNCTION update_chat_members(chat_id UUID, new_members UUID[])
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE "Chats"
  SET members = new_members
  WHERE "chatID" = chat_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

// Function to increment a user's ban count
export const incrementUserBanCountSQL = `
CREATE OR REPLACE FUNCTION increment_user_ban_count(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE "Users"
  SET bans = COALESCE(bans, 0) + 1
  WHERE id = user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
`

// Chat exit policy
export const chatExitPolicySQL = `
-- Drop the existing policy if it's causing issues
DROP POLICY IF EXISTS "Users can remove themselves from a chat" ON "Chats";

-- Create a new policy that allows users to update chats they're members of
CREATE POLICY "Users can update chats they are members of"
ON "Chats"
FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT jsonb_array_elements_text(members::jsonb)
  )
);
`

// Chats RLS policies
export const chatsRLSPoliciesSQL = `
-- Allow event admin to update chatroom
alter policy "Allow event admin to update chatroom"
on "public"."Chats"
to public
using (
  ((auth.uid())::text = ((members)::jsonb ->> 0))
)
with check (
  true
);

-- Allow members to view their chatrooms
alter policy "Allow members to view their chatrooms"
on "public"."Chats"
to public
using (
  ((members)::jsonb @> to_jsonb((auth.uid())::text))
);

-- Allow users to create chatrooms
alter policy "Allow users to create chatrooms"
on "public"."Chats"
to public
with check (
  (auth.uid() IS NOT NULL)
);

-- Prevent deletion of chatrooms
alter policy "Prevent deletion of chatrooms"
on "public"."Chats"
to public
using (
  false
);

-- Messages Table Policies

-- Allow members to send messages
alter policy "Allow members to send messages"
on "public"."Messages"
to public
with check (
  (EXISTS ( SELECT 1
   FROM "Chats"
  WHERE (("Chats"."chatID" = "Messages"."chatID") AND (EXISTS ( SELECT 1
           FROM json_array_elements_text("Chats".members) member(value)
          WHERE ((member.value)::uuid = auth.uid()))))))
);

-- Allow members to view messages
alter policy "Allow members to view messages"
on "public"."Messages"
to public
using (
  (EXISTS ( SELECT 1
   FROM "Chats"
  WHERE (("Chats"."chatID" = "Messages"."chatID") AND (EXISTS ( SELECT 1
           FROM json_array_elements_text("Chats".members) member(value)
          WHERE ((member.value)::uuid = auth.uid()))))))
);

-- Prevent message deletion
alter policy "Prevent message deletion"
on "public"."Messages"
to public
using (
  false
);
`

// Function to create all database functions
export async function createDatabaseFunctions(supabase) {
  try {
    console.log("Creating exit_chat_room function...")
    await supabase.rpc("exec_sql", { sql: exitChatRoomSQL })

    console.log("Creating update_chat_members function...")
    await supabase.rpc("exec_sql", { sql: updateChatMembersSQL })

    console.log("Creating increment_user_ban_count function...")
    await supabase.rpc("exec_sql", { sql: incrementUserBanCountSQL })

    console.log("Creating chat exit policy...")
    await supabase.rpc("exec_sql", { sql: chatExitPolicySQL })

    console.log("Creating chats RLS policies...")
    await supabase.rpc("exec_sql", { sql: chatsRLSPoliciesSQL })

    console.log("All database functions and policies created successfully")
    return true
  } catch (error) {
    console.error("Error creating database functions:", error)
    return false
  }
}

