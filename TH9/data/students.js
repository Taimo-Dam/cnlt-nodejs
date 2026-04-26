let students = [
  { id: 1, name: "Nguyen Van An", email: "an.nguyen@email.com", age: 20, class: "CNTT1", isDeleted: false },
  { id: 2, name: "Tran Thi Bich", email: "bich.tran@email.com", age: 21, class: "CNTT1", isDeleted: false },
  { id: 3, name: "Le Van Cuong", email: "cuong.le@email.com", age: 19, class: "CNTT2", isDeleted: false },
  { id: 4, name: "Pham Thi Dung", email: "dung.pham@email.com", age: 22, class: "CNTT2", isDeleted: false },
  { id: 5, name: "Hoang Van Em", email: "em.hoang@email.com", age: 20, class: "CNTT1", isDeleted: false },
  { id: 6, name: "Vo Thi Phuong", email: "phuong.vo@email.com", age: 23, class: "CNTT3", isDeleted: false },
  { id: 7, name: "Dang Van Giang", email: "giang.dang@email.com", age: 21, class: "CNTT2", isDeleted: true },
  { id: 8, name: "Bui Thi Hoa", email: "hoa.bui@email.com", age: 20, class: "CNTT3", isDeleted: false },
  { id: 9, name: "Nguyen Van Hung", email: "hung.nguyen2@email.com", age: 19, class: "CNTT1", isDeleted: false },
  { id: 10, name: "Tran Van Khai", email: "khai.tran@email.com", age: 24, class: "CNTT3", isDeleted: true },
];

let nextId = 11;

module.exports = {
  getAll: () => students,
  getActive: () => students.filter(s => !s.isDeleted),
  getById: (id) => students.find(s => s.id === id),
  create: (data) => {
    const student = { id: nextId++, ...data, isDeleted: false };
    students.push(student);
    return student;
  },
  update: (id, data) => {
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    students[idx] = { ...students[idx], ...data };
    return students[idx];
  },
  softDelete: (id) => {
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    students[idx].isDeleted = true;
    return students[idx];
  },
  emailExists: (email, excludeId = null) => {
    return students.some(s => s.email === email && s.id !== excludeId && !s.isDeleted);
  }
};