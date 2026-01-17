import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.send("Folly Backend ONLINE 🚀");
});

// =====================
// CRIAR VENDA PIX - BLACKCAT
// =====================
app.post("/api/pix/create", async (req, res) => {
  try {
    const {
      items,
      customer,
      shipping,
      metadata,
      externalRef,
      amount,
    } = req.body;

    const response = await fetch(
      `${process.env.BLACKCAT_API_URL}/sales/create-sale`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.BLACKCAT_API_KEY,
        },
        body: JSON.stringify({
          amount,
          paymentMethod: "pix",
          items,
          customer,
          shipping,
          metadata,
          externalRef,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json(data);
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("Erro ao criar PIX:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// =====================
// WEBHOOK BLACKCAT
// =====================
app.post("/api/webhook/blackcat", (req, res) => {
  const event = req.body;

  console.log("📩 Webhook recebido:", event);

  // Próximo passo:
  // - validar status = PAID
  // - atualizar pedido no Supabase
  // - disparar WhatsApp

  res.status(200).json({ received: true });
});

// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
