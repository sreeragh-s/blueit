
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { secretName } = await req.json()

    // Validate the request
    if (!secretName) {
      throw new Error('secretName is required')
    }

    // Get the secret from Deno environment
    const secretValue = Deno.env.get(secretName)

    if (!secretValue) {
      throw new Error(`Secret ${secretName} not found`)
    }

    return new Response(
      JSON.stringify({ value: secretValue }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
