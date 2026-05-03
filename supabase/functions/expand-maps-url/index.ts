
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
        const { shortUrl } = await req.json()

        if (!shortUrl) {
            return new Response(
                JSON.stringify({ error: 'shortUrl is required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Fetch the URL to get the redirect
        // By default fetch follows redirects
        const response = await fetch(shortUrl, {
            method: 'HEAD', // HEAD might be enough and faster, but some shorteners strictly require GET. Google Maps works with HEAD usually but simpler to just GET if HEAD fails.
            redirect: 'follow',
        })

        const expandedUrl = response.url

        return new Response(
            JSON.stringify({ expandedUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
