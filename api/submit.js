// Vercel serverless function: receives the landing-page form and saves it to Supabase.
// Needs two environment variables in Vercel (Settings > Environment Variables):
//   SUPABASE_URL  e.g. https://abcdefgh.supabase.co
//   SUPABASE_KEY  your Supabase publishable (or legacy anon) key

const ALLOWED = ["team-momentum", "event-shape", "docs-processes"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Missing Supabase environment variables" });
  }

  
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { blockers, contact, website } = body;

    // Hidden honeypot field: real visitors never fill it, so quietly accept and drop bot submissions
    if (website) return res.status(200).json({ ok: true });

    const cleanBlockers = Array.isArray(blockers)
      ? [...new Set(blockers)].filter((b) => ALLOWED.includes(b))
      : [];
    if (cleanBlockers.length === 0) {
      return res.status(400).json({ error: "Pick at least one option" });
    }

    let cleanContact = null;
    if (contact != null) {
      if (typeof contact !== "string") return res.status(400).json({ error: "Invalid contact" });
      cleanContact = contact.trim().slice(0, 200) || null;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/form_responses`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ blockers: cleanBlockers, contact: cleanContact }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase error", response.status, errorText);
      return res.status(502).json({ error: "Could not save the response" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
