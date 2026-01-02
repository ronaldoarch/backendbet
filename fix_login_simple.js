import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const email = 'midasreidoblack@gmail.com';
const novaSenha = 'MidasBlack@123';

try {
  console.log('Conectando...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway',
    ssl: { rejectUnauthorized: false },
    connectTimeout: 20000
  });
  
  console.log('Conectado!');
  
  const [users] = await conn.execute(
    'SELECT id, email, name, banned FROM users WHERE email = ?',
    [email]
  );
  
  if (users.length === 0) {
    console.log('Usuário não encontrado!');
    const [all] = await conn.execute('SELECT id, email FROM users LIMIT 5');
    console.table(all);
  } else {
    console.log('Usuário:', users[0]);
    const hash = await bcrypt.hash(novaSenha, 10);
    await conn.execute(
      'UPDATE users SET password = ?, banned = 0 WHERE email = ?',
      [hash, email]
    );
    console.log('\nSenha atualizada!');
    console.log('Email:', email);
    console.log('Senha:', novaSenha);
  }
  
  await conn.end();
} catch (error) {
  console.error('ERRO:', error.message);
}
