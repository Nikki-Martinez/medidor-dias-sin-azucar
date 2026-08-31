import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxyqhdlnptpmknpoxzcp.supabase.co";
const SUPABASE_KEY = "sb_publishable_9D5X6RQliFFHlqg-espvyw_ZuMUabqr";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);