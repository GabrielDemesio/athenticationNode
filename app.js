const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = 3000;


app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'admin123',
  resave: false,
  saveUninitialized: true
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'tmvohs91',
  database: 'Accounts'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao MySQL');

  // Criar a tabela 'users' se ela não existir
  db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  )`, (err) => {
    if (err) {
      throw err;
    }
    console.log('Tabela de usuários criada');
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/register.html');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
    if (err) {
      res.status(500).send('Erro ao registrar usuário');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      res.status(500).send('Erro ao fazer login');
    } else if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
      res.status(401).send('Credenciais inválidas');
    } else {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect('/profile');
    }
  });
});

app.get('/profile', (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(__dirname + '/profile.html');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
