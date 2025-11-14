import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_SECRET_KEY = Deno.env.get("MAILJET_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  otp: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, fullName }: OTPRequest = await req.json();

    console.log("Sending OTP to:", email);
    console.log("Using Mailjet API Key:", MAILJET_API_KEY?.substring(0, 10) + "...");

    const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`)}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: "ferdjan285@gmail.com",
              Name: "QuiSKO",
            },
            To: [
              {
                Email: email,
                Name: fullName,
              },
            ],
            Subject: "Your QuiSKO Verification Code",
            TextPart: `Your verification code is: ${otp}`,
            HTMLPart: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #6C63FF, #8A80FF); padding: 40px 20px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; text-align: center; }
                    .otp-box { background: #f8f8ff; border: 2px solid #6C63FF; border-radius: 12px; padding: 30px; margin: 30px 0; }
                    .otp-code { font-size: 36px; font-weight: bold; color: #6C63FF; letter-spacing: 8px; }
                    .footer { background: #f8f8ff; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>✨ QuiSKO</h1>
                    </div>
                    <div class="content">
                      <h2>Hello, ${fullName}!</h2>
                      <p>Thank you for registering with QuiSKO. Please use the verification code below to complete your registration:</p>
                      <div class="otp-box">
                        <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
                        <div class="otp-code">${otp}</div>
                      </div>
                      <p style="color: #999; font-size: 14px;">This code will expire in 10 minutes.</p>
                      <p style="color: #999; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                    </div>
                    <div class="footer">
                      <p>© 2025 QuiSKO. All rights reserved.</p>
                      <p>Your scholarship search companion</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          },
        ],
      }),
    });

    const mailjetData = await mailjetResponse.json();

    if (!mailjetResponse.ok) {
      console.error("Mailjet error response:", mailjetData);
      console.error("Mailjet status:", mailjetResponse.status);
      throw new Error(`Failed to send email via Mailjet: ${JSON.stringify(mailjetData)}`);
    }

    console.log("OTP email sent successfully:", mailjetData);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
