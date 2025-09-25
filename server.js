// ######
// Local onde os pacotes de dependências serão importados
// ######
import express from "express"; // Importa o pacote express
import pkg from "pg"; // Importa o pacote do pg (PostgreSQL)
import dotenv from "dotenv"; // Importa o pacote dotenv para variáveis de ambiente

// ######
// Local onde as configurações do servidor serão feitas
// ######
const app = express(); // Inicializa o servidor Express
const port = 3000; // Define a porta onde o servidor irá escutar
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env
const { Pool } = pkg; // Obtém a classe Pool do pacote pg

let pool = null; // Variável para armazenar o pool de conexões com o banco de dados

// Adiciona um middleware para processar corpos de requisições em JSON
app.use(express.json());

/**
 * Função para obter uma conexão com o banco de dados.
 * Cria o pool de conexões na primeira chamada e o reutiliza nas seguintes.
 * @returns {Pool} O pool de conexões com o banco de dados.
 */
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  return pool;
}

// ######
// Local onde as rotas (endpoints) serão definidas
// ######

app.get("/", async (req, res) => {
  // Rota GET para a raiz do servidor.
  // Retorna uma mensagem de boas-vindas e o status da conexão com o banco de dados.
  console.log("Rota GET / solicitada");

  const db = conectarBD();

  let dbStatus = "ok";
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }

  res.json({
    message: "Bem-vindo à API de Questões!",
    author: "Fernanda Barbosa Rodrigues",
    statusBD: dbStatus,
  });
});

app.get("/questoes", async (req, res) => {
  // Rota GET para buscar todas as questões.
  console.log("Rota GET /questoes solicitada");

  const db = conectarBD();

  try {
    const resultado = await db.query("SELECT * FROM questoes");
    const dados = resultado.rows;
    res.json(dados);
  } catch (e) {
    console.error("Erro ao buscar questões:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões.",
    });
  }
});

// ######
// Local onde o servidor irá escutar as requisições
// ######
app.listen(port, () => {
  // Inicia o servidor na porta definida.
  console.log(`Serviço rodando na porta: ${port}`);
});