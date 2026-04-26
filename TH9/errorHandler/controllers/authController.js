
const VALID_USER = { username: "admin", password: "123456" };
 
const login = (req, res) => {
  const { username, password } = req.body;
 
  if (username === VALID_USER.username && password === VALID_USER.password) {
    req.session.user = { username };
    return res.json({ message: "Login successful", user: { username } });
  }
 
  return res.status(401).json({ error: "Invalid username or password" });
};
 
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.json({ message: "Logged out successfully" });
  });
};
 
module.exports = { login, logout };
