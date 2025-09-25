// ######
// Local onde os pacotes de dependências serão importados
// ######
import express from "express"; // Requisição do pacote do express
import pkg from "pg"; // Requisição do pacote do pg (PostgreSQL)
import dotenv from "dotenv"; // Importa o pacote dotenv para carregar variáveis de ambiente

// ######
// Local onde as configurações do servidor serão feitas
// ######
const app = express(); // Inicializa o servidor Express
const port = 3000; // Define a porta onde o servidor irá escutar
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env
const { Pool } = pkg; // Obtém o construtor Pool do pacote pg para gerenciar conexões com o banco de dados PostgreSQL

// ######
// Local onde as rotas (endpoints) serão definidas
// ######

app.get("/", async (req, res) => {
  // Rota raiz do servidor
  // Rota GET /
  // Esta rota é chamada quando o usuário acessa a raiz do servidor
  // Ela retorna uma mensagem de boas-vindas e o status da conexão com o banco de dados
  // Cria a rota da raiz do projeto

  console.log("Rota GET / solicitada"); // Log no terminal para indicar que a rota foi acessada

  const db = new Pool({
    // Cria uma nova instância do Pool para gerenciar conexões com o banco de dados
    connectionString: process.env.URL_BD, // Usa a variável de ambiente do arquivo .env DATABASE_URL para a string de conexão
  });

  let dbStatus = "ok";

  // Tenta executar uma consulta simples para verificar a conexão com o banco de dados
  // Se a consulta falhar, captura o erro e define o status do banco de dados como a mensagem de erro
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }

  // Responde com um JSON contendo uma mensagem, o nome do autor e o status da conexão com o banco de dados
  res.json({
    message: "API para _____", // Substitua pelo conteúdo da sua API
    author: "Fernanda Barbosa Rodrigues", // Substitua pelo seu nome
    dbStatus: dbStatus,
  });
});

app.get("/questoes", async (req, res) => {
	console.log("Rota GET /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada
	
  const db = new Pool({
    // Cria uma nova instância do Pool para gerenciar conexões com o banco de dados
    connectionString: process.env.URL_BD, // Usa a variável de ambiente do arquivo .env DATABASE_URL para a string de conexão
  });

  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa uma consulta SQL para selecionar todas as questões
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta
    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

// ######
// Local onde o servidor irá escutar as requisições
// ######
app.listen(port, () => {
  // Inicia o servidor na porta definida
  // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});
