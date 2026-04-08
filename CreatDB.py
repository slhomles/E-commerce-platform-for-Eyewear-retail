import random

# --- CẤU HÌNH DANH SÁCH TÊN VIỆT NAM ---
ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô"]
dem_nam = ["Duy", "Trung", "Minh", "Hoàng", "Tiến", "Đức", "Thành", "Hữu", "Quang", "Anh"]
ten_nam = ["Thành", "Phúc", "Hoàng", "Nam", "Dũng", "Sơn", "Lâm", "Hải", "Phong", "Tùng", "Bách"]
dem_nu = ["Thị", "Ngọc", "Thanh", "Kim", "Minh", "Phương", "Hồng", "Mai"]
ten_nu = ["Anh", "Hoa", "Lan", "Trang", "Linh", "Hương", "Thảo", "Vy", "Nhi", "Hạnh"]

def sinh_ten_ngau_nhien():
    h = random.choice(ho)
    if random.random() > 0.5: # 50% là nam
        return f"{h} {random.choice(dem_nam)} {random.choice(ten_nam)}"
    else: # 50% là nữ
        return f"{h} {random.choice(dem_nu)} {random.choice(ten_nu)}"

# --- CẤU HÌNH DỮ LIỆU ĐỊA PHƯƠNG (Khớp với ảnh của bạn) ---
tinh_thanh = [
    ('37', 'Ninh Bình', 'Bắc Trung Bộ'), ('38', 'Thanh Hóa', 'Bắc Trung Bộ'), 
    ('40', 'Nghệ An', 'Bắc Trung Bộ'), ('42', 'Hà Tĩnh', 'Bắc Trung Bộ'),
    ('44', 'Quảng Trị', 'Bắc Trung Bộ'), ('46', 'Thừa Thiên Huế', 'Bắc Trung Bộ'),
    ('48', 'Đà Nẵng', 'Nam Trung Bộ'), ('51', 'Quảng Ngãi', 'Nam Trung Bộ'), 
    ('52', 'Gia Lai', 'Tây Nguyên')
]

# --- BẮT ĐẦU TẠO DỮ LIỆU ---
sql_file = open("data_setup.sql", "w", encoding="utf-8")
sql_file.write("USE QuanLyBanHang_OLAP;\n\n")

# 1. VanPhongDaiDien (4 bản ghi từ 9 tỉnh)
selected_vp = random.sample(tinh_thanh, 4)
for vp in selected_vp:
    sql_file.write(f"INSERT INTO VanPhongDaiDien VALUES ('{vp[0]}', '{vp[1]}', 'Địa chỉ VP {vp[1]}', '{vp[2]}');\n")

# 2. CuaHang (40 bản ghi)
for i in range(1, 41):
    ma_ch = f"CH{i:02d}"
    sdt = f"0243{random.randint(100000, 999999)}"
    ma_tp = random.choice(selected_vp)[0]
    sql_file.write(f"INSERT INTO CuaHang VALUES ('{ma_ch}', '{sdt}', '{ma_tp}');\n")

# 3. MatHang (200 bản ghi)
for i in range(1, 201):
    ma_mh = f"MH{i:03d}"
    gia = random.randint(50, 2000) * 1000
    sql_file.write(f"INSERT INTO MatHang VALUES ('{ma_mh}', 'Mô tả mặt hàng {i}', 'Hộp/Gói', {random.uniform(0.5, 5.0)}, {gia});\n")

# 4. KhachHang (12,000 bản ghi)
kh_ids = [f"KH{i:05d}" for i in range(1, 12001)]
for kid in kh_ids:
    ten = sinh_ten_ngau_nhien()
    ma_tp = random.choice(selected_vp)[0]
    sql_file.write(f"INSERT INTO KhachHang VALUES ('{kid}', '{ten}', '2025-01-01', '{ma_tp}');\n")

# 5. KhachHangDuLich (9,000 bản ghi - ngẫu nhiên từ 12k KH)
kh_du_lich = random.sample(kh_ids, 9000)
for kid in kh_du_lich:
    sql_file.write(f"INSERT INTO KhachHangDuLich VALUES ('{kid}', '{sinh_ten_ngau_nhien()}');\n")

# 6. KhachHangBuuDien (8,400 bản ghi - ngẫu nhiên từ 12k KH)
kh_buu_dien = random.sample(kh_ids, 8400)
for kid in kh_buu_dien:
    sql_file.write(f"INSERT INTO KhachHangBuuDien VALUES ('{kid}', 'Địa chỉ nhận hàng {random.randint(1, 500)}');\n")

# 7. DonDatHang (15,000 bản ghi)
don_ids = [f"DH{i:05d}" for i in range(1, 15001)]
for did in don_ids:
    kid = random.choice(kh_ids)
    sql_file.write(f"INSERT INTO DonDatHang VALUES ('{did}', '2026-03-{random.randint(1, 28):02d}', '{kid}');\n")

# 8. MatHangDuocDat (60,000 bản ghi - Phân bổ chi tiết đơn hàng)
for i in range(1, 60011):
    did = random.choice(don_ids)
    mmh = f"MH{random.randint(1, 200):03d}"
    sl = random.randint(1, 10)
    gia = random.randint(10, 500) * 1000
    sql_file.write(f"INSERT INTO MatHangDuocDat VALUES ('{did}', '{mmh}', {sl}, {gia});\n")

sql_file.close()
print("Đã tạo xong file data_setup.sql!")