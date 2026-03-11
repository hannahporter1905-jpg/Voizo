import { supabase } from "./supabase";

export type ContactStatus =
  | "Unreached"
  | "Interested"
  | "Sent SMS"
  | "Declined Offer"
  | "Not interested"
  | "Do not call"
  | "Pending Retry";

export interface Contact {
  id: number;
  campaignId: number;
  name: string;
  phone: string;
  attempts: number;
  lastAttempt: string;
  callDuration: string;
  status: ContactStatus;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToContact(row: any): Contact {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    name: row.name,
    phone: row.phone,
    attempts: row.attempts,
    lastAttempt: row.last_attempt,
    callDuration: row.call_duration,
    status: row.status,
  };
}

export async function fetchContactsByCampaignId(campaignId: number): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToContact);
}

export async function insertContact(c: Omit<Contact, "id">): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      campaign_id: c.campaignId,
      name: c.name,
      phone: c.phone,
      attempts: c.attempts,
      last_attempt: c.lastAttempt,
      call_duration: c.callDuration,
      status: c.status,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToContact(data);
}

export async function deleteContact(id: number): Promise<void> {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAllContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToContact);
}

// Kept for legacy sync usage — returns empty
export function getContactsByCampaignId(_id: number): Contact[] {
  return [];
}
