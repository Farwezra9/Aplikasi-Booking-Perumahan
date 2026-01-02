const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'secret123'; // gunakan .env di produksi

exports.login = (req, res) => {
  const { email, password, keepLoggedIn } = req.body; // frontend kirim flag
  User.findByEmail(email, (err, user) => {
    if(err) return res.status(500).json({ message: err });
    if(!user) return res.status(404).json({ message: 'User not found' });

    const valid = bcrypt.compareSync(password, user.password);
    if(!valid) return res.status(401).json({ message: 'Invalid password' });

    const jwtOptions = keepLoggedIn ? {} : { expiresIn: '1h' }; 
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, status: user.status },
      SECRET_KEY,
      jwtOptions
    );

    res.json({ token, role: user.role, email: user.email, name: user.name, status: user.status });
  });
};


exports.registrasi = (req, res) => {
  const { name, email, password } = req.body;

  User.findByEmail(email, (err, existingUser) => {
    if (err) return res.status(500).json({ message: err });
    if (existingUser)
      return res.status(400).json({ message: 'Email sudah terdaftar' });

    const hashedPassword = bcrypt.hashSync(password, 10);

    User.create(
      { name, email, password: hashedPassword, role: 'user', status: 'aktif' },
      (err, user) => {
        if (err) return res.status(500).json({ message: err });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, status: user.status }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token,  role: user.role,email: user.email, name: user.name, status: user.status });
      }
    );
  });
};


