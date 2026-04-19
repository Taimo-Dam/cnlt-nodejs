const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8017;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Kiểm tra và tự tạo thư mục uploads nếu chưa có
        const uploadPath = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Lưu file với định dạng: Timestamp-TênGốc
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// --- CÁC ROUTE XỬ LÝ ---

// 1. Trả về trang master.html khi truy cập localhost:8017
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "master.html"));
});

// 2. Xử lý Upload 1 file (name="file_don")
app.post("/upload-single", upload.single("file_don"), (req, res) => {
    if (!req.file) return res.send("Bạn chưa chọn file nào!");
    
    console.log("Đã nhận 1 file:", req.file.filename);
    res.send(`<h3>Upload đơn thành công!</h3><p>File lưu tại: /uploads/${req.file.filename}</p><a href="/">Quay lại</a>`);
});

// 3. Xử lý Upload nhiều file (name="files_nhieu", tối đa 17)
app.post("/upload-multiple", upload.array("files_nhieu", 17), (req, res) => {
    if (!req.files || req.files.length === 0) return res.send("Bạn chưa chọn file nào!");

    console.log(`Đã nhận ${req.files.length} file.`);
    res.send(`<h3>Upload ${req.files.length} file thành công!</h3><a href="/">Quay lại</a>`);
});

// --- KHỞI CHẠY SERVER ---
app.listen(PORT, () => {
    console.log("-----------------------------------------");
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    console.log("-----------------------------------------");
});