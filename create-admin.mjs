import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { mysqlTable, serial, varchar, int, text, timestamp } from "drizzle-orm/mysql-core";

// Schema inline - não depende de TypeScript
const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }),
  username: varchar("username", { length: 64 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  fullName: varchar("fullName", { length: 255 }).notNull().default(""),
  credits: int("credits").notNull().default(0),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  registeredIp: varchar("registeredIp", { length: 45 }),
  isIpBlocked: int("isIpBlocked").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Hash da senha "thzin123" com salt "shadow_salt_v1"
const passwordHash = "62b5d8aadb8a68c929048b59823ad58e201f59fc8eab786db5332760754ebfc3";

async function createAdmin() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log("Criando usuário admin...");
    
    await db.insert(users).values({
      username: "admin123",
      passwordHash,
      fullName: "Admin User",
      credits: 1000,
      role: "admin",
      lastSignedIn: new Date(),
    }).onDuplicateKeyUpdate({ set: { role: "admin" } });

    console.log("✅ Usuário admin criado com sucesso!");
    console.log("Login: admin123");
    console.log("Senha: thzin123");
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
  } finally {
    await connection.end();
  }
}

createAdmin();
