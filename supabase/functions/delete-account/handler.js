const noStore = { "Cache-Control": "no-store" };

/**
 * Called only through withSupabase({ auth: "user" }). The request body is
 * deliberately ignored: a caller may delete only their own Auth account.
 */
export async function handleDeleteAccount(request, context) {
  if (request.method !== "POST") {
    return Response.json(
      { error: "method_not_allowed" },
      { status: 405, headers: { ...noStore, Allow: "POST" } },
    );
  }

  const callerId = context.userClaims?.id;
  if (!callerId) {
    return Response.json({ error: "unauthorized" }, { status: 401, headers: noStore });
  }

  try {
    // Auth must still know this user. A deleted account's JWT may remain
    // cryptographically valid until expiry, but must not pass this check.
    const { data, error: authError } = await context.supabase.auth.getUser();
    const user = data?.user;
    if (authError || !user || user.id !== callerId) {
      return Response.json({ error: "unauthorized" }, { status: 401, headers: noStore });
    }

    // Hard-delete Auth user. The four user-owned public tables in schema.sql
    // have ON DELETE CASCADE foreign keys to auth.users.
    const { error: deleteError } = await context.supabaseAdmin.auth.admin.deleteUser(callerId, false);
    if (deleteError) {
      console.error("delete-account failed", deleteError.code ?? "unknown");
      return Response.json({ error: "deletion_failed" }, { status: 500, headers: noStore });
    }

    return Response.json({ deleted: true }, { headers: noStore });
  } catch {
    return Response.json({ error: "deletion_failed" }, { status: 500, headers: noStore });
  }
}
