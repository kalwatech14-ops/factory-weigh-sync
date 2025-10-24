// This function is now disabled. Please use the Node.js backend API for Google Sheets integration.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve((_req) => {
  return new Response(
    JSON.stringify({
      error: "This endpoint is disabled. Use the main backend API for Google Sheets integration.",
      success: false
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 501
    }
  );
});