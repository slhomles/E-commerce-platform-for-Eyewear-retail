# Deploy Guide

Tài liệu CI/CD cho dự án — mỗi commit lên `main` sẽ tự build Docker image và deploy lên EC2.

Workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

---

## 1. Setup lần đầu

### 1.1 Add GitHub Secrets

Vào repo trên GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Giá trị | Cách lấy |
|---|---|---|
| `DOCKERHUB_USERNAME` | `lephuc101` | Username Docker Hub của bạn |
| `DOCKERHUB_TOKEN` | Access token | Docker Hub → Account Settings → Security → New Access Token (scope: Read, Write, Delete) |
| `EC2_HOST` | IP public hoặc domain | AWS Console → EC2 → instance → Public IPv4 address |
| `EC2_USER` | `ubuntu` hoặc `ec2-user` | Phụ thuộc AMI (Ubuntu → `ubuntu`, Amazon Linux → `ec2-user`) |
| `EC2_SSH_KEY` | Nội dung private key | Xem mục 1.2 |
| `EC2_SSH_PORT` *(optional)* | `22` | Chỉ cần nếu bạn đổi port SSH |
| `PUBLIC_APP_URL` *(optional)* | `http://<EC2_HOST>` or `https://your-domain.com` | Public base URL used for OAuth redirects and email links. If empty, deploy uses `http://EC2_HOST`. |

### 1.2 Private key cho `EC2_SSH_KEY`

**Phải là key không có passphrase.** Có 2 cách:

**Cách A — Dùng lại file `.pem` hiện tại** (chỉ OK nếu không có passphrase):
```sh
cat /path/to/your-key.pem
```
Copy toàn bộ output (cả dòng `-----BEGIN/END-----`) → paste vào secret.

**Cách B — Tạo key riêng cho CI** (khuyến nghị):
```sh
# Trên máy local
ssh-keygen -t ed25519 -f ci_key -N ""
cat ci_key.pub
```
Sau đó SSH vào EC2 (qua Termius) và append public key:
```sh
echo "<nội dung ci_key.pub>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```
Cuối cùng `cat ci_key` → paste vào secret `EC2_SSH_KEY`.

### 1.3 Chuẩn bị EC2 (1 lần duy nhất)

SSH vào EC2 (qua Termius), chạy:
```sh
# Clone repo (chỉ để lấy docker-compose.yml)
cd ~ && git clone https://github.com/slhomles/E-commerce-platform-for-Eyewear-retail.git e-commerce
cd e-commerce && docker compose up -d

# Đảm bảo user trong group docker (logout/login sau khi chạy)
sudo usermod -aG docker $USER
```

---

## 2. Workflow hàng ngày

```sh
git add .
git commit -m "fix: something"
git push origin main
```

Vào tab **Actions** trên GitHub xem pipeline chạy (~3-5 phút). Khi job `smoke-test` xanh → app đã live.

### Kiểm tra trên EC2 (qua Termius)

```sh
cd ~/e-commerce
docker compose ps               # các container đang chạy
docker compose logs -f backend  # log realtime
docker images | grep lephuc101  # check digest mới nhất
```

### OAuth and email link URLs

Set `PUBLIC_APP_URL` in GitHub Actions secrets when you use a domain or HTTPS. Otherwise the deploy workflow uses `http://EC2_HOST`.

Configure OAuth provider callback URLs to match the public app URL:

```txt
Google:   <PUBLIC_APP_URL>/login/oauth2/code/google
Facebook: <PUBLIC_APP_URL>/login/oauth2/code/facebook
GitHub:   <PUBLIC_APP_URL>/login/oauth2/code/github
```

The backend uses the same public URL for:

```txt
<PUBLIC_APP_URL>/oauth2/redirect
<PUBLIC_APP_URL>/verify-email?token=...
<PUBLIC_APP_URL>/reset-password?token=...
```

---

## 3. Rollback

Mỗi lần build tạo 2 tag: `latest` và `<commit-sha>`. Cách rollback:

**Cách nhanh** — revert commit rồi push:
```sh
git revert <bad-commit-sha>
git push origin main
```
Pipeline tự deploy bản đã revert.

**Cách thủ công** — SSH vào EC2, sửa tag trong `docker-compose.yml`:
```yaml
backend:
  image: lephuc101/glasses-store-backend:abc1234   # đổi từ :latest sang SHA cũ
```
Sau đó:
```sh
docker compose pull
docker compose up -d
```

---

## 4. Troubleshooting

| Triệu chứng | Cách xử lý |
|---|---|
| Job `deploy-ec2` lỗi `Permission denied (publickey)` | Sai `EC2_SSH_KEY` hoặc public key chưa nằm trong `~/.ssh/authorized_keys` trên EC2 |
| Job `build-*` lỗi `unauthorized: authentication required` | Sai `DOCKERHUB_TOKEN` (đã expire?) hoặc thiếu quyền Write |
| Job deploy OK nhưng app không lên | SSH vào EC2 chạy `docker compose logs backend` để xem stacktrace |
| `smoke-test` fail nhưng manual curl OK | Security group EC2 chưa mở port 80 cho 0.0.0.0/0; hoặc app khởi động chậm > 60s |
| Workflow không trigger khi push | Branch không phải `main`, hoặc commit chỉ chạm `.md` ngoài 2 service (workflow vẫn chạy nhưng skip cả 2 build job — đó là behavior đúng) |

---

## 5. Termius — quan hệ với CI

Termius và GitHub Actions hoạt động độc lập:
- **Termius**: SSH client trên máy bạn → vẫn dùng để debug, xem log, restart container thủ công.
- **GitHub Actions**: mở session SSH riêng từ runner GitHub vào EC2 (qua `EC2_SSH_KEY`).

Không có xung đột. Cả hai có thể kết nối song song.
