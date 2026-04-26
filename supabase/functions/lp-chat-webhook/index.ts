// LP Chat — incoming webhook from Roketchat.
// Roketchat calls this URL when admin receives a reply on WhatsApp.
// Admin must prefix reply with "#xxxx " to route to the correct widget session.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const TENANT_ID = "0bc660d9-4b31-4450-9281-c158499323c6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizePhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("62")) p = p.slice(2);
  if (p.startsWith("0")) p = p.slice(1);
  return "62" + p;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let payload: any;
  try { payload = await req.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { headers: corsHeaders });
  }

  const rawFrom: string = payload?.from ?? payload?.chat_id ?? "";
  const phone = normalizePhone(rawFrom.replace(/@s\.whatsapp\.net$/, ""));
  const rawMessage: string = payload?.body ?? "";

  if (!phone || !rawMessage) {
    return new Response(JSON.stringify({ ok: true, skipped: "no phone or message" }), { headers: corsHeaders });
  }

  // Only process admin replies prefixed with "#xxxx "
  const sessionMatch = rawMessage.match(/^#([A-Za-z0-9]{4,8})\s+([\s\S]+)$/);
  if (!sessionMatch) {
    return new Response(JSON.stringify({ ok: true, skipped: "no session prefix" }), { headers: corsHeaders });
  }

  const sessionId = sessionMatch[1];
  const cleanMessage = sessionMatch[2].trim();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("lp_chat_incoming").insert({
    tenant_id: TENANT_ID,
    phone,
    message: cleanMessage,
    session_id: sessionId,
  });

  if (error) {
    console.error("Insert error:", error.message);
    return new Response(JSON.stringify({ ok: false, error: error.message }), { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
});
