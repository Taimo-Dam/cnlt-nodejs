const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const uploadManyFiles = multer({ storage }).array("many-files", 17);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "master.html"));
});

app.post("/upload", (req, res) => {
  uploadManyFiles(req, res, (err) => {
    if (err) {
      return res.status(500).send("Lỗi upload");
    }
    if (!req.files || req.files.length === 0) {
      return res.send("Không có file nào được upload");
    }
    res.send(`Upload thành công (${req.files.length} file)`);
  });
});

app.listen(8017, () => {
  console.log("Server chạy tại http://localhost:8017");
});
