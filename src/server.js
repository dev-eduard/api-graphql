require("dotenv").config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres.");
}

const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { schema, root } = require("./schema");
const { autenticar } = require("./auth");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header (curl, Postman and server-to-server)
    // are not subject to browser CORS restrictions.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origem não permitida pelo CORS"));
  }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

app.use("/api", limiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", graphqlHTTP((req) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  return {
    schema,
    rootValue: root,
    graphiql: process.env.NODE_ENV !== "production",
    context: {
      usuario: autenticar(token)
    }
  };
}));

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}/api`);
});
