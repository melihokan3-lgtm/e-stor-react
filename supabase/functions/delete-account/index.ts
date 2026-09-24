import { withSupabase } from "npm:@supabase/server@1.8.0";
import { handleDeleteAccount } from "./handler.js";

export default {
  fetch: withSupabase({ auth: "user" }, handleDeleteAccount),
};
