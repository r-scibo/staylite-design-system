import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const guestData = [
      { email: 'marco.rossi@test.com', name: 'Marco Rossi' },
      { email: 'sofia.bianchi@test.com', name: 'Sofia Bianchi' },
      { email: 'luca.ferrari@test.com', name: 'Luca Ferrari' },
      { email: 'giulia.romano@test.com', name: 'Giulia Romano' },
      { email: 'alessandro.ricci@test.com', name: 'Alessandro Ricci' },
      { email: 'francesca.costa@test.com', name: 'Francesca Costa' },
      { email: 'matteo.gallo@test.com', name: 'Matteo Gallo' },
      { email: 'chiara.conti@test.com', name: 'Chiara Conti' },
      { email: 'lorenzo.greco@test.com', name: 'Lorenzo Greco' },
    ]

    const results = []
    
    for (const guest of guestData) {
      const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email: guest.email,
        password: 'TestGuest123!',
        email_confirm: true,
        user_metadata: {
          name: guest.name
        }
      })

      if (error) {
        console.error(`Error creating ${guest.email}:`, error)
        results.push({ email: guest.email, success: false, error: error.message })
      } else {
        results.push({ email: guest.email, success: true, userId: user.user.id })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Guest creation complete',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})