# Ecsendia Autos — VPS Deployment Guide

**Server:** DigitalOcean Droplet — Ubuntu 22.04, 2GB RAM, 1 vCPU ($12/mo)
**Domain:** ecsendia.site
**Stack:** Next.js + PM2 + Nginx + Let's Encrypt

---

## Step 1 — Create the Droplet

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. **Create → Droplets**
3. Choose: **Ubuntu 22.04**, **Basic**, **Regular**, **2GB / 1 CPU ($12/mo)**
4. Authentication: **SSH Key** (add your public key)
5. Hostname: `ecsendia-autos`
6. Create Droplet — copy the IP address

---

## Step 2 — Point Your Domain to the Server

In your domain registrar (wherever you bought `ecsendia.site`), add:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `YOUR_SERVER_IP` |
| A | `www` | `YOUR_SERVER_IP` |

DNS takes 5–30 minutes to propagate.

---

## Step 3 — First-Time Server Setup

SSH into your server:
```bash
ssh root@YOUR_SERVER_IP
```

### Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should show v20.x
```

### Install PM2, Git, Nginx
```bash
npm install -g pm2
sudo apt-get install -y nginx git
```

### Install Playwright system dependencies
```bash
sudo apt-get install -y \
  libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 libpango-1.0-0 \
  libcairo2 libatspi2.0-0 libgtk-3-0 fonts-liberation wget ca-certificates
```

### Create PM2 log directory
```bash
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
```

---

## Step 4 — Clone the Repo & Configure

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/Elvis142/ecsendia-autos.git
cd ecsendia-autos
```

### Create the .env file
```bash
cp .env.example .env
nano .env
```

Fill in all values (copy from your local `.env`). Make sure to update:
- `NEXTAUTH_URL="https://ecsendia.site"`
- `NEXT_PUBLIC_SITE_URL="https://ecsendia.site"`

---

## Step 5 — Build & Start

```bash
npm ci
npx prisma generate
npx playwright install chromium
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

Check it's running:
```bash
pm2 status
curl http://localhost:3000   # should return HTML
```

---

## Step 6 — Configure Nginx

```bash
sudo cp /var/www/ecsendia-autos/nginx.conf.example /etc/nginx/sites-available/ecsendia-autos
sudo ln -s /etc/nginx/sites-available/ecsendia-autos /etc/nginx/sites-enabled/
sudo nginx -t   # test config
sudo systemctl reload nginx
```

Your site should now be live at `http://ecsendia.site`.

---

## Step 7 — Enable HTTPS (SSL)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ecsendia.site -d www.ecsendia.site
```

Certbot auto-configures Nginx for HTTPS and sets up auto-renewal.

Your site is now live at **https://ecsendia.site** ✅

---

## Deploying Updates

Every time you push changes to GitHub, SSH in and run:
```bash
cd /var/www/ecsendia-autos
bash scripts/deploy.sh
```

Or set up automatic deploys with a GitHub Actions webhook (optional).

---

## Useful Commands

```bash
pm2 status              # check app status
pm2 logs ecsendia-autos # view live logs
pm2 reload ecsendia-autos --update-env  # reload after .env changes
sudo systemctl status nginx             # check nginx
sudo nginx -t && sudo systemctl reload nginx  # reload nginx config
```
