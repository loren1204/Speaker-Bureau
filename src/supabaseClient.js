import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://cromeirhxraoyeonvabp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb21laXJoeHJhb3llb252YWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODY2NzYsImV4cCI6MjA5Njc2MjY3Nn0.KO5f5527gNj1LfI-KMhbUecEnJdxTmvCJ8_Xw3WENRc"

export const supabase = createClient(supabaseUrl, supabaseKey)