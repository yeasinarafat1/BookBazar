import { getAllUsers } from "@/lib/action/admin";
import UsersClient from "./client";
import { mockUsers } from "@/constants";

export default async function UsersPage() {
  const users = await getAllUsers();
  
  return <UsersClient allUsers={users} />;
}