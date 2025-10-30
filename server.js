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

app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    const consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    const resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    consulta = "DELETE FROM questoes WHERE id = $1"; // Consulta SQL para deletar a questão pelo ID
    resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    res.status(200).json({ mensagem: "Questão excluida com sucesso!!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao excluir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const data = req.body; // Obtém os dados do corpo da requisição
    // Validação dos dados recebidos
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem:
          "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD(); // Conecta ao banco de dados

    const consulta =
      "INSERT INTO questoes (enunciado,disciplina,tema,nivel) VALUES ($1,$2,$3,$4) "; // Consulta SQL para inserir a questão
    const questao = [data.enunciado, data.disciplina, data.tema, data.nivel]; // Array com os valores a serem inseridos
    const resultado = await db.query(consulta, questao); // Executa a consulta SQL com os valores fornecidos
    res.status(201).json({ mensagem: "Questão criada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao inserir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let questao = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (questao.length === 0) {
      return res.status(404).json({ message: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    const data = req.body; // Obtém os dados do corpo da requisição

    // Usa o valor enviado ou mantém o valor atual do banco
    data.enunciado = data.enunciado || questao[0].enunciado;
    data.disciplina = data.disciplina || questao[0].disciplina;
    data.tema = data.tema || questao[0].tema;
    data.nivel = data.nivel || questao[0].nivel;

    // Atualiza a questão
    consulta ="UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5";
    // Executa a consulta SQL com os valores fornecidos
    resultado = await db.query(consulta, [
      data.enunciado,
      data.disciplina,
      data.tema,
      data.nivel,
      id,
    ]);

    res.status(200).json({ message: "Questão atualizada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao atualizar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// ######
// Rotas para usuários
// ######

app.get("/usuarios", async (req, res) => {
  console.log("Rota GET /usuarios solicitada");

  const db = conectarBD();

  try {
    const resultado = await db.query("SELECT * FROM usuarios");
    const dados = resultado.rows;
    res.json(dados);
  } catch (e) {
    console.error("Erro ao buscar usuários:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar os usuários.",
    });
  }
});

app.get("/usuarios/:id", async (req, res) => {
  console.log("Rota GET /usuarios/:id solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();
    const consulta = "SELECT * FROM usuarios WHERE id = $1";
    const resultado = await db.query(consulta, [id]);
    const dados = resultado.rows;

    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.json(dados);
  } catch (e) {
    console.error("Erro ao buscar usuário:", e);
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

app.post("/usuarios", async (req, res) => {
  console.log("Rota POST /usuarios solicitada");

  try {
    const data = req.body;
    // Assumindo campos: nome, email, senha (ajuste conforme sua tabela)
    if (!data.nome || !data.email || !data.senha) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem: "Todos os campos (nome, email, senha) são obrigatórios.",
      });
    }

    const db = conectarBD();

    const consulta = "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)";
    const usuario = [data.nome, data.email, data.senha];
    const resultado = await db.query(consulta, usuario);
    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch (e) {
    console.error("Erro ao inserir usuário:", e);
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  console.log("Rota PUT /usuarios/:id solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();
    let consulta = "SELECT * FROM usuarios WHERE id = $1";
    let resultado = await db.query(consulta, [id]);
    let usuario = resultado.rows;

    if (usuario.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const data = req.body;

    data.nome = data.nome || usuario[0].nome;
    data.email = data.email || usuario[0].email;
    data.senha = data.senha || usuario[0].senha;

    consulta = "UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4";
    resultado = await db.query(consulta, [
      data.nome,
      data.email,
      data.senha,
      id,
    ]);

    res.status(200).json({ message: "Usuário atualizado com sucesso!" });
  } catch (e) {
    console.error("Erro ao atualizar usuário:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  console.log("Rota DELETE /usuarios/:id solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();
    let consulta = "SELECT * FROM usuarios WHERE id = $1";
    let resultado = await db.query(consulta, [id]);
    let dados = resultado.rows;

    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    consulta = "DELETE FROM usuarios WHERE id = $1";
    resultado = await db.query(consulta, [id]);
    res.status(200).json({ mensagem: "Usuário excluído com sucesso!" });
  } catch (e) {
    console.error("Erro ao excluir usuário:", e);
    res.status(500).json({
      erro: "Erro interno do servidor"
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
