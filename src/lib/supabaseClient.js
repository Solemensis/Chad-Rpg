import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
	'https://wjfywtvnvjbposklgxzj.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZnl3dHZudmpicG9za2xneHpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzMyOTQzOTQsImV4cCI6MTk4ODg3MDM5NH0.aEF55Z4Wje7SAtPg_TiNOD7iIqsOZ4DBL1EP5juhR7g'
)
