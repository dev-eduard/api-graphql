const { buildSchema } = require("graphql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("./database");

const schema = buildSchema(`
  type Usuario {
    id: ID!
    nome: String!
    email: String!
    criado_em: String!
  }

  type AuthPayload {
    token: String!
    usuario: Usuario!
  }

  type Query {
    me: Usuario
    usuarios: [Usuario!]!
    usuario(id: ID!): Usuario
  }

  type Mutation {
    registrar(nome: String!, email: String!, senha: String!): AuthPayload
    login(email: String!, senha: String!): AuthPayload
    atualizarUsuario(id: ID!, nome: String!, email: String!): Usuario
    excluirUsuario(id: ID!): Boolean!
  }
`);

const cadastroSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  senha: z.string().min(8).max(72)
});

const usuarioSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254)
});

function usuarioPublico(usuario) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criado_em: usuario.criado_em
  };
}

function requireAuth(context) {
  if (!context.usuario) {
    throw new Error("Não autenticado");
  }
}

const root = {
  me: ({}, context) => {
    requireAuth(context);
    return usuarioPublico(
      db.prepare(`
        SELECT id,nome,email,criado_em
        FROM usuarios WHERE id=?
      `).get(context.usuario.sub)
    );
  },

  usuarios: ({}, context) => {
    requireAuth(context);
    return db.prepare(`
      SELECT id,nome,email,criado_em
      FROM usuarios ORDER BY id
    `).all();
  },

  usuario: ({ id }, context) => {
    requireAuth(context);
    const usuario = db.prepare(`
      SELECT id,nome,email,criado_em
      FROM usuarios WHERE id=?
    `).get(Number(id));

    return usuarioPublico(usuario);
  },

  registrar: async ({ nome, email, senha }) => {
    const dados = cadastroSchema.parse({ nome, email, senha });
    const emailNormalizado = dados.email.toLowerCase();
    const hash = await bcrypt.hash(dados.senha, 12);

    try {
      const result = db.prepare(`
        INSERT INTO usuarios(nome,email,senha)
        VALUES(?,?,?)
      `).run(dados.nome, emailNormalizado, hash);

      const usuario = db.prepare(`
        SELECT id,nome,email,criado_em
        FROM usuarios WHERE id=?
      `).get(result.lastInsertRowid);

      const token = jwt.sign(
        { sub: Number(usuario.id) },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { token, usuario };
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        throw new Error("Email já cadastrado");
      }
      throw error;
    }
  },

  login: async ({ email, senha }) => {
    const dados = z.object({
      email: z.string().email(),
      senha: z.string().min(1).max(72)
    }).parse({ email, senha });

    const usuario = db.prepare(`
      SELECT id,nome,email,senha,criado_em
      FROM usuarios WHERE email=?
    `).get(dados.email.toLowerCase());

    if (!usuario || !(await bcrypt.compare(dados.senha, usuario.senha))) {
      throw new Error("Email ou senha inválidos");
    }

    const token = jwt.sign(
      { sub: Number(usuario.id) },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token, usuario: usuarioPublico(usuario) };
  },

  atualizarUsuario: ({ id, nome, email }, context) => {
    requireAuth(context);

    // Neste exemplo, um usuário só pode alterar a própria conta.
    if (Number(id) !== Number(context.usuario.sub)) {
      throw new Error("Sem permissão");
    }

    const dados = usuarioSchema.parse({ nome, email });

    try {
      const result = db.prepare(`
        UPDATE usuarios
        SET nome=?, email=?
        WHERE id=?
      `).run(dados.nome, dados.email.toLowerCase(), Number(id));

      if (!result.changes) return null;

      return db.prepare(`
        SELECT id,nome,email,criado_em
        FROM usuarios WHERE id=?
      `).get(Number(id));
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        throw new Error("Email já cadastrado");
      }
      throw error;
    }
  },

  excluirUsuario: ({ id }, context) => {
    requireAuth(context);

    if (Number(id) !== Number(context.usuario.sub)) {
      throw new Error("Sem permissão");
    }

    const result = db.prepare(`
      DELETE FROM usuarios WHERE id=?
    `).run(Number(id));

    return result.changes > 0;
  }
};

module.exports = { schema, root };
