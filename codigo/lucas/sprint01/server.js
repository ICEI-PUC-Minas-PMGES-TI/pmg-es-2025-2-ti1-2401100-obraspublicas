const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;
const DATA_PATH = "./feedback.json";

function readFeedbacks() {
  const data = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(data).feedbacks;
}

function saveFeedbacks(feedbacks) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ feedbacks }, null, 2), "utf8");
}

app.get("/", (req, res) => {
  res.send("API de Feedbacks - Obra Prima");
});

app.get("/feedbacks", (req, res) => {
  const feedbacks = readFeedbacks();
  res.json(feedbacks);
});

app.get("/feedbacks/:id", (req, res) => {
  const feedbacks = readFeedbacks();
  const feedback = feedbacks.find(f => f.id === parseInt(req.params.id));
  if (!feedback) {
    return res.status(404).json({ error: "Feedback não encontrado" });
  }
  res.json(feedback);
});

app.post("/feedbacks", (req, res) => {
  const feedbacks = readFeedbacks();

  const novoFeedback = {
    id: feedbacks.length > 0 ? feedbacks[feedbacks.length - 1].id + 1 : 1,
    obra: req.body.obra,
    nome: req.body.nome,
    cpf: req.body.cpf,
    email: req.body.email,
    tipo: req.body.tipo,
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    dataEnvio: new Date().toISOString(),
    anexo: req.body.anexo || ""
  };

  feedbacks.push(novoFeedback);
  saveFeedbacks(feedbacks);
  res.status(201).json({ message: "Feedback cadastrado com sucesso!", novoFeedback });
});

app.delete("/feedbacks/:id", (req, res) => {
  let feedbacks = readFeedbacks();
  const id = parseInt(req.params.id);
  const novoArray = feedbacks.filter(f => f.id !== id);

  if (novoArray.length === feedbacks.length) {
    return res.status(404).json({ error: "Feedback não encontrado" });
  }

  saveFeedbacks(novoArray);
  res.json({ message: "Feedback removido com sucesso!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
