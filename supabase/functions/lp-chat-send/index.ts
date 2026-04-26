// LP Chat — send proxy. No JWT required (--no-verify-jwt).
// Receives { phone, message, token, sessionId } from the widget,
// prepends [LP #sessionId] tag, and forwards to Roketchat API server-side.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ok = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: { phone?: string; message?: string; token?: string; sessionId?: string };
  try { body = await req.json(); } catch { return ok({ ok: false, error: "Invalid JSON" }); }

  const { phone, message, token, sessionId } = body ?? {};
  if (!phone || !message || !token) return ok({ ok: false, error: "phone, message & token required" });

  let normPhone = String(phone).replace(/\D/g, "");
  if (normPhone.startsWith("62")) normPhone = normPhone.slice(2);
  if (normPhone.startsWith("0")) normPhone = normPhone.slice(1);
  normPhone = "62" + normPhone;

  const body_text = sessionId ? `[LP #${sessionId}] ${message}` : message;

  try {
    const r = await fetch("https://roketchat.com/api/v1/messages/text", {
      method: "POST",
      headers: { "token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normPhone, body: body_text }),
    });
    const text = await r.text();
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
    return ok({ ok: r.ok, status: r.status, response: parsed });
  } catch (e) {
    return ok({ ok: false, error: (e as Error).message });
  }
});
