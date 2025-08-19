import express from "express";      // Requisição do pacote do express
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta

app.get("/", (req, res) => {        // Cria endpoint na rota da raiz do projeto
  console.log("Rota GET / solicitada");
  res.json({
		message: "API para .....",      // Substitua pelo conteúdo da sua API
    author: "FERNANDA BARBOSA RODRIGUES",    // Substitua pelo seu nome
  });
});

app.listen(port, () => {            // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});