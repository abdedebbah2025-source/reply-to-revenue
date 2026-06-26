module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const data = req.body;

  const message = `🔥 NEW MED SPA LEAD

👤 Name: ${data.name}
🏢 Business: ${data.business}
📧 Email: ${data.email}
📱 Phone: ${data.phone}
📸 Instagram: ${data.instagram}

📈 Monthly Leads:
${data.leads}

⚠️ Biggest Challenge:
${data.challenge}`;

  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    }
  );

  if (!response.ok) {
    return res.status(500).json({ success: false });
  }

  return res.status(200).json({ success: true });
};
