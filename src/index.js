import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   ROTA TESTE
========================= */
app.get("/", (req, res) => {
  res.send("Folly Backend ONLINE 🚀");
});

/* =========================
   CRIAR VENDA PIX (BLACKCAT)
========================= */
app.post("/create-sale", async (req, res) => {
  try {
    const {
      items,
      customer,
      amount,
      externalRef,
      shipping
    } = req.body;

    const response = await axios.post(
      "https://api.blackcatpagamentos.online/api/sales/create-sale",
      {
        amount,
        currency: "BRL",
        paymentMethod: "pix",
        items,
        customer,
        shipping,
        pix: {
          expiresInDays: 1
        },
        externalRef,
        postbackUrl: `${process.env.BACKEND_URL}/webhook/blackcat`
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.BLACKCAT_API_KEY
        }
      }
    );

    return res.status(201).json(response.data);
  } catch (error) {
    console.error("❌ Erro ao criar venda:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar pagamento"
    });
  }
});

/* =========================
   WEBHOOK BLACKCAT
========================= */
app.post("/webhook/blackcat", async (req, res) => {
  console.log("🔔 Webhook BlackCat recebido:");
  console.log(req.body);

  const { status, transactionId, externalRef } = req.body;

  if (status === "PAID") {
    console.log("✅ PAGAMENTO CONFIRMADO");
    console.log("🧾 Pedido:", externalRef);
    console.log("💳 Transação:", transactionId);

    // AQUI DEPOIS:
    // - atualizar pedido no Supabase
    // - marcar status = paid
    // - disparar WhatsApp
  }

  res.sendStatus(200);
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
