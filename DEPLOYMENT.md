# Production Deployment Guide: Oracle Cloud Infrastructure (OCI)

> Comprehensive, step-by-step production deployment manual for the dynamic portfolio platform on an Oracle Cloud Infrastructure (OCI) Always Free Ubuntu instance.

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Prerequisites](#2-prerequisites)
3. [OCI VM Setup](#3-oci-vm-setup)
4. [Clone and Configure Project](#4-clone-and-configure-project)
5. [Build the Applications](#5-build-the-applications)
6. [systemd Configuration](#6-systemd-configuration)
7. [Nginx Reverse Proxy](#7-nginx-reverse-proxy)
8. [DNS and Cloudflare](#8-dns-and-cloudflare)
9. [HTTPS / Let's Encrypt](#9-https--lets-encrypt)
10. [Firewall](#10-firewall)
11. [Deployment / Redeployment Procedure](#11-deployment--redeployment-procedure)
12. [Manual Rebuild and Restart](#12-manual-rebuild-and-restart)
13. [Database](#13-database)
14. [Uploads](#14-uploads)
15. [Troubleshooting](#15-troubleshooting)
16. [Verification Checklist](#16-verification-checklist)
17. [Useful Commands Cheat Sheet](#17-useful-commands-cheat-sheet)

---

## 1. Architecture

### 1.1 Architecture Flow Diagram

```text
                  Internet / Client Browsers
                              │
                              │ HTTPS (Port 443) / HTTP (Port 80)
                              ▼
                 Cloudflare DNS & Proxy (CDN)
                              │
                              ▼
            Oracle Cloud Infrastructure (OCI) VCN
               └── Internet Gateway
                    └── Public Subnet Security List (Ingress: 22, 80, 443)
                         └── Ubuntu VM (Host Firewall: iptables / UFW)
                              │
                              ▼
                    Nginx (Reverse Proxy)
                    ├── Port 80  ───► Permanent Redirect (301) to HTTPS
                    └── Port 443 ───► SSL Termination (Let's Encrypt)
                         │
                         ├── Location: /api/v1/
                         │    └──► Express API (127.0.0.1:3001) ──► PostgreSQL (127.0.0.1:5432)
                         │
                         ├── Location: /uploads/
                         │    └──► Express API Static Server (127.0.0.1:3001/uploads/)
                         │          └── Local disk: apps/api/uploads/
                         │
                         └── Location: / (All other routes)
                              └──► Next.js App Router (127.0.0.1:3000)
```

### 1.2 Localhost Isolation & Security Architecture

- **Next.js (`apps/web`)** explicitly binds to `127.0.0.1:3000` via `next start --hostname 127.0.0.1`.
- **Express API (`apps/api`)** explicitly binds to `127.0.0.1:3001` via `app.listen(PORT, '127.0.0.1')`.
- **PostgreSQL** listens on `127.0.0.1:5432` only.

#### Why Nginx is the sole public entry point:

1. **Attack Surface Reduction**: Application runtimes (Node.js/Next.js) are never exposed directly to the internet. Ports 3000, 3001, and 5432 are closed to outside traffic at both the cloud network layer and the operating system firewall.
2. **Unified Domain Origin**: Both frontend (`/`) and API (`/api/v1/`) reside on the same origin (`https://anuj.curio.dpdns.org`), eliminating cross-origin browser restrictions while allowing unified SSL termination.
3. **Optimized Static Delivery & Buffering**: Nginx efficiently handles slow clients, connection pooling, SSL/TLS handshakes, HTTP/2 multiplexing, and large file upload buffering before proxying to the Node.js application.
4. **Header Normalization**: Nginx safely sets `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto`, which the Express server trusts (`app.set('trust proxy', 1)`) for accurate visitor telemetry and rate limiting.

---

## 2. Prerequisites

Ensure you have the following items ready before beginning deployment:

| Requirement           | Details                                                          | Recommended / Tested Spec                                          |
| :-------------------- | :--------------------------------------------------------------- | :----------------------------------------------------------------- |
| **OCI Account**       | Oracle Cloud Infrastructure account                              | Always Free Tier                                                   |
| **Compute Shape**     | VM.Standard.A1.Flex (Arm Ampere) or VM.Standard.E2.1.Micro (AMD) | 2–4 OCPUs, 12–24 GB RAM (A1.Flex) or 1 OCPU, 1 GB RAM (E2.1.Micro) |
| **Operating System**  | Ubuntu Linux                                                     | Ubuntu 22.04 LTS or 24.04 LTS                                      |
| **Networking**        | Public Subnet with Internet Gateway & Public IP                  | Ephemeral or Reserved OCI Public IP                                |
| **Domain Name**       | Fully Qualified Domain Name (FQDN)                               | e.g., `anuj.curio.dpdns.org` or your custom domain                 |
| **DNS Manager**       | Cloudflare account managing the domain's DNS                     | Free Plan                                                          |
| **Node.js Runtime**   | Node.js engine ≥ 20.0.0 and npm ≥ 10.0.0                         | Node.js v20.x or v22.x LTS                                         |
| **Database**          | PostgreSQL engine ≥ 15 (Local OR Hosted/Serverless)              | Local PostgreSQL on VM **OR** **Neon Database** / Supabase / RDS   |
| **Media Storage**     | File & Image upload storage backend                              | Local VM Disk (`apps/api/uploads/`) **OR** **Cloudinary**          |
| **Repository Access** | Git and GitHub SSH key or Personal Access Token (PAT)            | Access to clone the private/public repo                            |
| **Local Tools**       | SSH client, terminal                                             | OpenSSH on Linux/macOS or PowerShell on Windows                    |

> [!TIP]
> **Recommended Resource Optimization**: Using a hosted serverless database such as **Neon Database** (`ep-xyz.neon.tech`) and **Cloudinary** for image uploads significantly reduces CPU, RAM, and disk consumption on your OCI VM. This is especially advantageous on OCI's 1 GB RAM AMD micro instance, as it avoids running local PostgreSQL and media backups entirely.

---

## 3. OCI VM Setup

### 3.1 Network Architecture Requirements

- The VM must be provisioned inside a **Virtual Cloud Network (VCN)** with a **Public Subnet**.
- The VCN's Default Route Table must route all outbound traffic (`0.0.0.0/0`) to an **Internet Gateway**.
- A **Public IPv4 address** must be assigned to the instance VNIC.

> [!NOTE]
> A NAT Gateway is **NOT** required for this architecture because the instance resides in a public subnet with direct internet routing through the Internet Gateway.

### 3.2 OCI Security List Ingress Rules

Navigate in the OCI Console to:  
**Networking** ➔ **Virtual Cloud Networks** ➔ **Your VCN** ➔ **Security Lists** ➔ **Default Security List for `<your-vcn>`** ➔ **Add Ingress Rules**.

Add the following stateful rules:

| Source CIDR | IP Protocol | Source Port Range | Destination Port Range | Description                                    |
| :---------- | :---------- | :---------------- | :--------------------- | :--------------------------------------------- |
| `0.0.0.0/0` | TCP         | All               | `22`                   | SSH Remote Management                          |
| `0.0.0.0/0` | TCP         | All               | `80`                   | HTTP (Certbot ACME challenge & HTTPS redirect) |
| `0.0.0.0/0` | TCP         | All               | `443`                  | HTTPS Production Traffic                       |

> [!CAUTION]
> **DO NOT** add ingress rules for ports `3000`, `3001`, or `5432`. These services must remain accessible exclusively from `127.0.0.1`.

---

## 4. Clone and Configure Project

### 4.1 SSH into the VM and Install Core Tooling

```bash
# Connect to your OCI VM
ssh -i ~/.ssh/id_rsa ubuntu@<YOUR_OCI_VM_PUBLIC_IP>

# Update package repositories and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# Install build tools, Git, and utilities
sudo apt install -y curl git build-essential ufw netfilter-persistent iptables-persistent
```

### 4.2 Install Node.js (v20 LTS)

```bash
# Install NodeSource repository for Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and verify
sudo apt install -y nodejs
node -v # Should display v20.x.x
npm -v  # Should display 10.x.x
```

### 4.3 Clone the Repository

Deploy the codebase under the standard `ubuntu` user directory (`/home/ubuntu/portfolio`):

```bash
cd /home/ubuntu
git clone <YOUR_GITHUB_REPOSITORY_URL> portfolio
cd /home/ubuntu/portfolio

# Install all workspace dependencies cleanly
npm ci
```

### 4.4 Production Environment Variables Configuration

The project uses workspace-level environment files. Create the production `.env` files using safe production values:

#### 1. Backend Environment File (`apps/api/.env`)

```bash
cat << 'EOF' > /home/ubuntu/portfolio/apps/api/.env
# ==============================================================================
# Database Connection (Choose Option A or Option B)
# ==============================================================================
# Option A: Local PostgreSQL on OCI VM
DATABASE_URL="postgresql://portfolio_user:<DB_PASSWORD>@localhost:5432/portfolio?schema=public"

# Option B: Hosted Neon Database (or Supabase / AWS RDS)
# (Note: Always include ?sslmode=require for Neon serverless PostgreSQL)
# DATABASE_URL="postgresql://<NEON_USER>:<NEON_PASSWORD>@<EP_HOST>.neon.tech/portfolio?sslmode=require"

# Authentication Security (Must be random, >=32 characters)
JWT_SECRET="<GENERATE_RANDOM_32_CHAR_SECRET>"
JWT_REFRESH_SECRET="<GENERATE_RANDOM_32_CHAR_REFRESH_SECRET>"
JWT_ACCESS_TOKEN_TTL_MINUTES=15
JWT_REFRESH_TOKEN_TTL_DAYS=7

# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN="https://anuj.curio.dpdns.org"
API_PUBLIC_URL="https://anuj.curio.dpdns.org"

# ==============================================================================
# File & Image Storage Configuration (Choose Option A or Option B)
# ==============================================================================
# Option A: Local Disk Storage on OCI VM
STORAGE_PROVIDER=local
UPLOAD_DIR=uploads

# Option B: Cloudinary Cloud Storage (Recommended for zero VM disk usage)
# STORAGE_PROVIDER=cloudinary
# CLOUDINARY_CLOUD_NAME="your_cloud_name"
# CLOUDINARY_API_KEY="your_api_key"
# CLOUDINARY_API_SECRET="your_api_secret"

# Optional: SMTP Configuration (For email notifications / contact form)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="noreply@anuj.curio.dpdns.org"
EOF
```

#### 2. Frontend Environment File (`apps/web/.env`)

```bash
cat << 'EOF' > /home/ubuntu/portfolio/apps/web/.env
# Public REST API Base URL (called by browser client)
NEXT_PUBLIC_API_URL="https://anuj.curio.dpdns.org/api/v1"

# Internal REST API Base URL (called during SSR server-side fetch directly on localhost)
INTERNAL_API_URL="http://127.0.0.1:3001/api/v1"

# Public Canonical Site URL
NEXT_PUBLIC_SITE_URL="https://anuj.curio.dpdns.org"

# Telemetry Feature Flags
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_JWT_ACCESS_TTL_MINUTES=15
EOF
```

> [!IMPORTANT]
> **Never commit `.env` files to Git.** Verify that `.gitignore` contains `.env`, `.env.local`, and `*.env`. Ensure permissions on `.env` files are restricted:
>
> ```bash
> chmod 600 /home/ubuntu/portfolio/apps/api/.env /home/ubuntu/portfolio/apps/web/.env
> ```

---

## 5. Build the Applications

### 5.1 Step-by-Step Build Order

The monorepo contains interdependent packages. They must be generated and compiled in the correct dependency sequence:

```bash
cd /home/ubuntu/portfolio

# 1. Generate Prisma ORM Client
npm run db:generate -w @portfolio/api

# 2. Build the Shared Type and Schema Library
npm run build:shared

# 3. Build the Express TypeScript API
npm run build:api

# 4. Build the Next.js Web Frontend
npm run build:web
```

Or execute all steps simultaneously using the root build pipeline:

```bash
npm run db:generate -w @portfolio/api && npm run build
```

### 5.2 Next.js Environment Baking Principle

> [!WARNING]
> In Next.js, all environment variables prefixed with `NEXT_PUBLIC_*` (such as `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`) are inlined statically into the JavaScript client bundle **at compile time** (`next build`).
>
> If you ever update the domain name or API URL in `apps/web/.env`, you **MUST** re-run `npm run build:web` for the changes to take effect in the browser.

---

## 6. systemd Configuration

To ensure zero-downtime, process monitoring, auto-restarts on failure, and automatic startup after VM reboots, both applications run as Ubuntu `systemd` services under the `ubuntu` user.

### 6.1 Backend API Service (`portfolio-api.service`)

Create `/etc/systemd/system/portfolio-api.service`:

```ini
[Unit]
Description=Portfolio Express API Service
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/portfolio
EnvironmentFile=/home/ubuntu/portfolio/apps/api/.env
ExecStart=/usr/bin/node /home/ubuntu/portfolio/apps/api/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=portfolio-api

[Install]
WantedBy=multi-user.target
```

### 6.2 Frontend Web Service (`portfolio-web.service`)

Create `/etc/systemd/system/portfolio-web.service`:

```ini
[Unit]
Description=Portfolio Next.js Web Service
After=network.target portfolio-api.service
Wants=portfolio-api.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/portfolio/apps/web
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=portfolio-web

[Install]
WantedBy=multi-user.target
```

### 6.3 Service Management Commands

```bash
# Reload systemd to register new unit files
sudo systemctl daemon-reload

# Enable services to launch automatically upon system boot
sudo systemctl enable portfolio-api.service
sudo systemctl enable portfolio-web.service

# Start the services
sudo systemctl start portfolio-api.service
sudo systemctl start portfolio-web.service

# Check real-time service status
sudo systemctl status portfolio-api.service
sudo systemctl status portfolio-web.service

# Restart services
sudo systemctl restart portfolio-api.service
sudo systemctl restart portfolio-web.service

# Stop services
sudo systemctl stop portfolio-web.service
sudo systemctl stop portfolio-api.service

# Inspect live application logs
sudo journalctl -u portfolio-api -f -n 50
sudo journalctl -u portfolio-web -f -n 50
```

---

## 7. Nginx Reverse Proxy

### 7.1 Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 7.2 Configure the Site Block

Create `/etc/nginx/sites-available/portfolio`:

```nginx
# Upstream definition for Next.js web application
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Upstream definition for Express API
upstream express_upstream {
    server 127.0.0.1:3001;
    keepalive 64;
}

# HTTP — Redirect all traffic to HTTPS (and serve Certbot ACME challenges)
server {
    listen 80;
    listen [::]:80;
    server_name anuj.curio.dpdns.org;

    # Let's Encrypt ACME challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS — Production Reverse Proxy
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name anuj.curio.dpdns.org;

    # SSL Certificates (Populated automatically by Certbot)
    ssl_certificate /etc/letsencrypt/live/anuj.curio.dpdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anuj.curio.dpdns.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Global Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Maximum file upload size (matches backend limit)
    client_max_body_size 25M;

    # 1. API Endpoints Proxy
    location /api/v1/ {
        proxy_pass http://express_upstream;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for longer requests (e.g. database sync or analytics)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 2. Uploaded Media Files Proxy
    location /uploads/ {
        proxy_pass http://express_upstream/uploads/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static uploads in client browser for 30 days
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        add_header Cross-Origin-Resource-Policy "cross-origin" always;
        add_header Access-Control-Allow-Origin "*" always;
    }

    # 3. Next.js Frontend Application Proxy (Root and all other routes)
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;

        # WebSocket support for Next.js hot-reload / dynamic subscriptions
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.3 Enable the Configuration

```bash
# Enable the site by creating a symlink
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# Remove default boilerplate configuration
sudo rm -f /etc/nginx/sites-enabled/default

# Validate configuration syntax
sudo nginx -t

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

---

## 8. DNS and Cloudflare

### 8.1 Configure the DNS Record

1. Log in to your **Cloudflare Dashboard**.
2. Select your domain.
3. Go to **DNS** ➔ **Records** ➔ **Add record**:
   - **Type**: `A`
   - **Name**: `anuj` (or `@` if using root domain)
   - **IPv4 address**: `<YOUR_OCI_VM_PUBLIC_IP>`
   - **Proxy status**: **DNS Only (Gray Cloud)** _(Important during initial Certbot certificate issuance!)_
   - **TTL**: `Auto`
4. Click **Save**.

### 8.2 Cloudflare SSL/TLS Encryption Mode

Navigate to **SSL/TLS** ➔ **Overview**:

- Select **Full (Strict)**.

> [!IMPORTANT]
>
> - **DO NOT USE "Flexible" mode**: When using "Flexible", Cloudflare communicates with Nginx on port 80, but Nginx sends a 301 redirect to HTTPS (port 443). Cloudflare then calls port 80 again, triggering an **infinite redirect loop** (`ERR_TOO_MANY_REDIRECTS`).
> - **Once Certbot is issued**, you can safely change the Cloudflare Proxy status from **DNS Only (Gray Cloud)** to **Proxied (Orange Cloud)** to benefit from Cloudflare CDN caching and DDoS mitigation.

---

## 9. HTTPS / Let's Encrypt

### 9.1 Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Obtain and Install the SSL Certificate

Run Certbot targeting your public domain:

```bash
sudo certbot --nginx -d anuj.curio.dpdns.org
```

Certbot will:

1. Contact the Let's Encrypt ACME server.
2. Complete the HTTP-01 challenge via port 80.
3. Deploy the TLS certificate to `/etc/letsencrypt/live/anuj.curio.dpdns.org/`.
4. Update the Nginx configuration automatically with secure SSL ciphers and parameters.

### 9.3 Certificate Verification & Auto-Renewal

Let's Encrypt certificates expire after 90 days. Ubuntu sets up an automated systemd timer upon installation.

```bash
# Verify the automated renewal timer is active
systemctl list-timers | grep -E 'certbot|apt'

# Perform a dry-run renewal test
sudo certbot renew --dry-run

# Re-validate Nginx syntax and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. Firewall

In Oracle Cloud Ubuntu images, firewall security operates on **two distinct layers**:

1. **OCI VCN Ingress Rules** (Cloud level)
2. **Ubuntu OS iptables Rules** (Host level)

> [!CAUTION]
> **The Classic OCI Gotcha**: Default Oracle Ubuntu VM images ship with pre-configured `iptables` rules that reject all inbound connections on ports 80 and 443, even if OCI VCN Ingress rules are fully opened! If your site hangs or times out, this is almost always the cause.

### 10.1 Host Firewall Setup (iptables & netfilter-persistent)

Insert rules accepting TCP ports 80 and 443 before the default DROP rule:

```bash
# Check current rule positions
sudo iptables -L INPUT --line-numbers -n

# Insert HTTP (80) and HTTPS (443) rules
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Save the iptables rules to persist across VM reboots
sudo netfilter-persistent save
```

### 10.2 Alternative: Using UFW (Uncomplicated Firewall)

If you prefer UFW:

```bash
# Allow SSH first to avoid getting locked out!
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify status
sudo ufw status numbered
```

### 10.3 Verify Localhost Binding Security

Confirm that internal ports (3000, 3001, 5432) are bound strictly to `127.0.0.1`:

```bash
sudo ss -tulpn | grep -E '3000|3001|5432'
```

Output must show `127.0.0.1:3000`, `127.0.0.1:3001`, and `127.0.0.1:5432`. They must **NEVER** display `0.0.0.0` or `*`.

---

## 11. Deployment / Redeployment Procedure

### 11.1 Fresh Deployment Procedure (From Scratch)

Follow this sequence when setting up a brand new server:

1. **Provision VM**: Launch Ubuntu 22.04/24.04 instance in OCI with a Public IP.
2. **Configure VCN**: Add Security List Ingress rules for TCP `22`, `80`, `443`.
3. **Configure DNS**: Point domain `A` record in Cloudflare to VM Public IP (Gray Cloud).
4. **Configure Host Firewall**: Run `sudo iptables` or `sudo ufw` commands to open `80` and `443`.
5. **Install System Software**: Node.js 20, PostgreSQL, Nginx, Certbot, Git.
6. **Set Up Database**: Create database user `portfolio_user` and database `portfolio`.
7. **Clone Code**: `git clone <repo> /home/ubuntu/portfolio && cd /home/ubuntu/portfolio`.
8. **Create `.env` Files**: Fill in `apps/api/.env` and `apps/web/.env`.
9. **Install Dependencies**: `npm ci`.
10. **Database Migration**: Run `npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma`.
11. **Seed Admin User**: Run `npm run db:seed:admin -w @portfolio/api`.
12. **Build Applications**: Run `npm run db:generate -w @portfolio/api && npm run build`.
13. **Configure systemd**: Create, enable, and start `portfolio-api` and `portfolio-web`.
14. **Configure Nginx**: Create site config, test with `nginx -t`, and reload.
15. **Issue SSL**: Run `sudo certbot --nginx -d anuj.curio.dpdns.org`.
16. **Enable Cloudflare Proxy**: Switch Cloudflare record from Gray Cloud to Orange Cloud (Proxied) with Full (Strict) SSL.

---

### 11.2 Routine Update / Redeployment Procedure (New Code Push)

When you have pushed commits to `main` and want to update the production server:

```bash
# 1. Navigate to project root
cd /home/ubuntu/portfolio

# 2. Pull the latest code
git pull origin main

# 3. Install any updated dependencies
npm ci

# 4. Apply database schema migrations (if any)
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# 5. Re-generate Prisma client
npm run db:generate -w @portfolio/api

# 6. Rebuild shared package, API, and Next.js frontend
npm run build

# 7. Restart systemd services
sudo systemctl restart portfolio-api portfolio-web

# 8. Verify service status and application health
sudo systemctl is-active portfolio-api portfolio-web
curl -s https://anuj.curio.dpdns.org/api/v1/health | grep -q "ok" && echo "✅ API is Healthy" || echo "❌ API Health Failed"
```

---

## 12. Manual Rebuild and Restart

Use these targeted commands when you only need to update or bounce specific layers:

### Rebuild and Restart API Only

```bash
cd /home/ubuntu/portfolio
npm run build:shared
npm run build:api
sudo systemctl restart portfolio-api
sudo journalctl -u portfolio-api -n 30 --no-pager
```

### Rebuild and Restart Frontend Only

```bash
cd /home/ubuntu/portfolio
npm run build:shared
npm run build:web
sudo systemctl restart portfolio-web
sudo journalctl -u portfolio-web -n 30 --no-pager
```

### Rebuild and Restart Both

```bash
cd /home/ubuntu/portfolio
npm run build
sudo systemctl restart portfolio-api portfolio-web
```

### VM Reboot Verification

When the OCI VM reboots:

1. `systemd` automatically boots `postgresql.service`.
2. `portfolio-api.service` launches after PostgreSQL is available.
3. `portfolio-web.service` launches after `portfolio-api` starts.
4. `nginx.service` starts and begins serving traffic immediately.

To simulate and test this recovery:

```bash
sudo reboot
```

Wait 60 seconds, reconnect via SSH, and confirm with `sudo systemctl status portfolio-api portfolio-web nginx`.

---

## 13. Database

You can configure the portfolio database using either a **local PostgreSQL service** directly on the OCI VM or a **hosted/serverless database** such as **Neon Database**.

---

### 13.1 Option A: Local PostgreSQL Installation on OCI VM

Use this option if you want a self-contained setup on the same Ubuntu instance without external third-party database dependencies.

```bash
# Install PostgreSQL and contrib package
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database user and database
sudo -u postgres psql << 'EOF'
CREATE USER portfolio_user WITH PASSWORD '<STRONG_SECURE_PASSWORD>';
CREATE DATABASE portfolio OWNER portfolio_user;
GRANT ALL PRIVILEGES ON DATABASE portfolio TO portfolio_user;
\c portfolio
GRANT ALL ON SCHEMA public TO portfolio_user;
EOF
```

Set the connection string in `apps/api/.env`:

```bash
DATABASE_URL="postgresql://portfolio_user:<STRONG_SECURE_PASSWORD>@localhost:5432/portfolio?schema=public"
```

---

### 13.2 Option B: Hosted Neon Database (Serverless PostgreSQL)

**Recommended for resource-constrained instances (e.g., OCI AMD 1 GB RAM Micro Shape)**. Using Neon offloads database memory and background vacuuming from the VM to Neon's cloud infrastructure.

#### 1. Setup in Neon Console

1. Create a free account at [neon.tech](https://neon.tech).
2. Create a new project (e.g., `portfolio-prod`) and select a region closest to your OCI VM.
3. In the Neon Project Dashboard, copy your connection string.

#### 2. Connection String Format

Ensure `?sslmode=require` is present at the end of the URL:

```bash
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<EP_NAME>-pooler.<REGION>.aws.neon.tech/portfolio?sslmode=require"
```

> [!NOTE]
>
> - **Connection Pooling**: Neon provides both a pooled connection (with `-pooler` in the host) and a direct connection. For Prisma ORM with `@prisma/adapter-pg`, both work reliably. The pooled connection is recommended for production web traffic.
> - **No Local DB Service Needed**: When using Neon, you **do not need to install `postgresql`** on the Ubuntu VM. This saves approximately 300–500 MB of system RAM.
> - If you omit local PostgreSQL, update `/etc/systemd/system/portfolio-api.service` to remove `After=postgresql.service` and `Wants=postgresql.service`.

---

### 13.3 Running Prisma Migrations

Prisma migrations execute identically whether pointing to a local PostgreSQL instance or a remote Neon Database:

```bash
cd /home/ubuntu/portfolio
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

### 13.4 Seeding the Admin User

The project provides a dedicated admin seed script (`apps/api/prisma/seed-admin.ts`):

```bash
cd /home/ubuntu/portfolio

ADMIN_SEED_EMAIL="your-admin@example.com" \
ADMIN_SEED_USERNAME="admin" \
ADMIN_SEED_NAME="Portfolio Admin" \
ADMIN_SEED_PASSWORD="<STRONG_ADMIN_PASSWORD>" \
npm run db:seed:admin -w @portfolio/api
```

### 13.5 Optional: Full Sample Data Seeding

If deploying to a fresh demo instance and you want pre-populated projects, blog posts, and site settings:

```bash
npm run db:seed -w @portfolio/api
```

---

## 14. Uploads

The portfolio supports two storage providers: **Local Disk Storage** and **Cloudinary**.

---

### 14.1 Option A: Local Disk Storage (`STORAGE_PROVIDER=local`)

Media files (images, PDFs, resume documents) are stored directly on the OCI VM filesystem.

#### 1. Directory Setup & Permissions

- **Filesystem Path**: `/home/ubuntu/portfolio/apps/api/uploads/`
- **Public URL**: `https://anuj.curio.dpdns.org/uploads/<filename>`

Ensure the directory exists with proper permissions for the `ubuntu` user:

```bash
mkdir -p /home/ubuntu/portfolio/apps/api/uploads
chmod 755 /home/ubuntu/portfolio/apps/api/uploads
```

#### 2. Critical Production Lesson: Domain & Protocol Migration

> [!CRITICAL]
> When you initially test on an IP address (e.g. `http://150.136.x.x:3001`) and later switch to a domain with HTTPS (`https://anuj.curio.dpdns.org`), **existing records in the database may still store the old IP in their image URLs!**
>
> When `API_PUBLIC_URL` was changed, old database rows (such as `Media.url`, `BlogPost.coverImageUrl`, `Project.coverImageUrl`) do not update automatically. You must run a SQL migration script to update existing records:

```bash
sudo -u postgres psql -d portfolio << 'EOF'
-- Update Media library URLs
UPDATE "Media"
SET url = REPLACE(url, 'http://<OLD_IP>:3001', 'https://anuj.curio.dpdns.org')
WHERE url LIKE 'http://<OLD_IP>:3001%';

-- Update Blog Post cover images
UPDATE "BlogPost"
SET "coverImageUrl" = REPLACE("coverImageUrl", 'http://<OLD_IP>:3001', 'https://anuj.curio.dpdns.org')
WHERE "coverImageUrl" LIKE 'http://<OLD_IP>:3001%';

-- Update Project cover images
UPDATE "Project"
SET "coverImageUrl" = REPLACE("coverImageUrl", 'http://<OLD_IP>:3001', 'https://anuj.curio.dpdns.org')
WHERE "coverImageUrl" LIKE 'http://<OLD_IP>:3001%';

-- Update Author avatars
UPDATE "Author"
SET "avatarUrl" = REPLACE("avatarUrl", 'http://<OLD_IP>:3001', 'https://anuj.curio.dpdns.org')
WHERE "avatarUrl" LIKE 'http://<OLD_IP>:3001%';
EOF
```

_(If using Neon Database, execute the equivalent queries via the Neon SQL Editor in your browser console)._

#### 3. Backup and Disaster Recovery

Regularly back up the uploads directory:

```bash
# Backup uploads folder to a timestamped tarball
tar -czvf /home/ubuntu/uploads-backup-$(date +%F).tar.gz /home/ubuntu/portfolio/apps/api/uploads

# Backup PostgreSQL database (if local)
pg_dump -U portfolio_user -h 127.0.0.1 portfolio > /home/ubuntu/db-backup-$(date +%F).sql
```

---

### 14.2 Option B: Cloudinary Cloud Storage (`STORAGE_PROVIDER=cloudinary`)

**Recommended for production deployments**. Offloads all media storage, transformations, and bandwidth from your OCI VM to Cloudinary's global media CDN.

#### 1. Setup in Cloudinary Dashboard

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com).
2. Go to your **Dashboard** / **Settings** ➔ **Access Keys**.
3. Note your **Cloud Name**, **API Key**, and **API Secret**.

#### 2. Configure Environment Variables

Update `/home/ubuntu/portfolio/apps/api/.env`:

```ini
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME="your_actual_cloud_name"
CLOUDINARY_API_KEY="your_actual_api_key"
CLOUDINARY_API_SECRET="your_actual_api_secret"
```

Then restart the API service:

```bash
sudo systemctl restart portfolio-api
```

#### 3. Why Cloudinary is Advantageous in Production

- **Zero VM Disk Usage**: Prevents the OCI VM disk from filling up over time with uploaded media.
- **Global CDN Delivery**: Images are served with high speed from worldwide edge locations with automatic WebP/AVIF format optimization.
- **Next.js Pre-Configured**: Next.js image optimization in `apps/web/next.config.ts` already includes `res.cloudinary.com` in its `remotePatterns`.
- **Zero Domain Migration Headaches**: Image URLs are absolute Cloudinary URLs (`https://res.cloudinary.com/...`). If you change your server IP or domain name, media links will **never break** and require no database SQL replace scripts.
- **No Disk Backup Needed**: Uploaded assets remain safely stored in the cloud independently of your VM instance.

---

## 15. Troubleshooting

| Symptom                                                | Primary Root Cause                                                         | Diagnostic Command                                                           | Resolution                                                                                                                                                                                                 |
| :----------------------------------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Site hangs / Connection Timed Out**                  | OCI VCN Ingress rule or Ubuntu host `iptables` blocking port 80/443        | `curl -Iv https://anuj.curio.dpdns.org`                                      | 1. Check OCI Security List for port 80 & 443.<br>2. Run `sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT && sudo iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT && sudo netfilter-persistent save`. |
| **DNS Not Resolving**                                  | Cloudflare DNS record incorrect or propagation pending                     | `dig anuj.curio.dpdns.org +trace` or `nslookup anuj.curio.dpdns.org`         | Confirm A record in Cloudflare matches OCI public IP. Flush local DNS cache.                                                                                                                               |
| **HTTP works, but HTTPS fails**                        | Missing Let's Encrypt certificate or port 443 closed                       | `sudo nginx -t && sudo certbot certificates`                                 | Ensure Certbot finished successfully. Check `/etc/nginx/sites-available/portfolio` has SSL certificate directives.                                                                                         |
| **Infinite Redirect Loop (`ERR_TOO_MANY_REDIRECTS`)**  | Cloudflare SSL mode set to "Flexible"                                      | Inspect response headers with `curl -IL https://anuj.curio.dpdns.org`        | In Cloudflare dashboard, change SSL/TLS mode to **Full** or **Full (Strict)**.                                                                                                                             |
| **502 Bad Gateway on `/`**                             | Next.js frontend service is stopped or failed                              | `sudo systemctl status portfolio-web`                                        | Inspect logs with `sudo journalctl -u portfolio-web -n 50`. Rebuild with `npm run build:web` and restart.                                                                                                  |
| **502 Bad Gateway on `/api/v1/`**                      | Express API service is stopped or crashing                                 | `sudo systemctl status portfolio-api`                                        | Inspect logs with `sudo journalctl -u portfolio-api -n 50`. Check database connection and `.env` variables.                                                                                                |
| **API Health Check Fails (`503 Service Unavailable`)** | Database connection refused or Prisma schema out of sync                   | `curl http://127.0.0.1:3001/api/v1/health/ready`                             | Check `sudo systemctl status postgresql`. Validate `DATABASE_URL` in `apps/api/.env`. Run `npx prisma migrate deploy`.                                                                                     |
| **CORS Errors in Browser Console**                     | `CORS_ORIGIN` in `apps/api/.env` does not match public domain              | Inspect browser Network tab CORS headers                                     | Set `CORS_ORIGIN="https://anuj.curio.dpdns.org"` in `apps/api/.env` and restart `portfolio-api`.                                                                                                           |
| **Uploaded Images Return 404**                         | Missing uploads folder, wrong permissions, or legacy IP URL                | `ls -la /home/ubuntu/portfolio/apps/api/uploads`                             | Run `mkdir -p /home/ubuntu/portfolio/apps/api/uploads && chmod 755 ...`. Check Section 14.1 for SQL migration of old IP URLs.                                                                              |
| **Neon DB Connection Fails (`P1001` / Timeout)**       | Missing `sslmode=require` or network unreachable                           | Test connection: `npx prisma db push --schema=apps/api/prisma/schema.prisma` | Ensure `?sslmode=require` is appended to `DATABASE_URL` in `apps/api/.env`. Verify VM can resolve external DNS.                                                                                            |
| **Cloudinary Upload Error (`CONFIG_ERROR`)**           | Missing credentials with `STORAGE_PROVIDER=cloudinary`                     | `sudo journalctl -u portfolio-api -n 50`                                     | Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set in `apps/api/.env`. Restart `portfolio-api`.                                                                     |
| **Certbot Renewal Fails**                              | Cloudflare Orange Cloud (Proxy) blocking ACME challenge or port 80 blocked | `sudo certbot renew --dry-run`                                               | Temporarily switch Cloudflare to **DNS Only (Gray Cloud)** during renewal, or ensure `/.well-known/acme-challenge/` in Nginx points to `/var/www/html`.                                                    |
| **Frontend SSR Errors / Hydration Mismatch**           | `INTERNAL_API_URL` cannot connect to Express during server-side render     | `sudo journalctl -u portfolio-web -f`                                        | Ensure `INTERNAL_API_URL="http://127.0.0.1:3001/api/v1"` in `apps/web/.env` and API is running on port 3001.                                                                                               |

---

## 16. Verification Checklist

Complete this verification checklist after initial deployment or major upgrades:

- [ ] **DNS Resolution**: `nslookup anuj.curio.dpdns.org` resolves to the OCI Public IP.
- [ ] **OCI Network Connectivity**: Public IP responds to ping (if ICMP enabled) and SSH on port 22.
- [ ] **OCI VCN Ingress Rules**: Ports `80` and `443` allowed in Security List.
- [ ] **Host Firewall Active**: `iptables` / `ufw` permits incoming traffic on ports `80` and `443`.
- [ ] **Internal Ports Isolated**: `ss -tulpn` shows `3000`, `3001`, and `5432` bound only to `127.0.0.1`.
- [ ] **Nginx Service Active**: `sudo systemctl is-active nginx` returns `active`.
- [ ] **HTTP to HTTPS Redirect**: `curl -I http://anuj.curio.dpdns.org` returns HTTP `301 Moved Permanently`.
- [ ] **HTTPS Status 200**: `curl -I https://anuj.curio.dpdns.org` returns HTTP `200 OK`.
- [ ] **Valid SSL Certificate**: SSL certificate issued by Let's Encrypt with >30 days validity remaining.
- [ ] **Cloudflare SSL Mode**: Cloudflare dashboard set to **Full (Strict)**.
- [ ] **Express API Service Active**: `sudo systemctl is-active portfolio-api` returns `active`.
- [ ] **Next.js Web Service Active**: `sudo systemctl is-active portfolio-web` returns `active`.
- [ ] **API Health Endpoint**: `curl https://anuj.curio.dpdns.org/api/v1/health` returns `{"status":"ok"}`.
- [ ] **Database Connectivity**: Prisma connects to local PostgreSQL or remote Neon Database successfully (`/api/v1/health/ready` returns ready and database connected).
- [ ] **Admin Authentication**: Admin login functions at `https://anuj.curio.dpdns.org/admin/login`.
- [ ] **Media Upload Functionality**: Able to upload a new media asset via the Admin dashboard.
- [ ] **Media Serving**: Uploaded media renders correctly (via `/uploads/<filename>` if using local storage, or `res.cloudinary.com` if using Cloudinary).
- [ ] **Reboot Recovery**: Services automatically recover after `sudo reboot`.
- [ ] **Secrets Security**: No `.env` files or database credentials are committed to the Git repository.

---

## 17. Useful Commands Cheat Sheet

### Git & Source Control

```bash
git status
git pull origin main
git log -n 5 --oneline
```

### Build & Package Management

```bash
# Clean install
npm ci

# Generate Prisma client
npm run db:generate -w @portfolio/api

# Deploy database migrations
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Build individual packages
npm run build:shared
npm run build:api
npm run build:web

# Full project build
npm run build
```

### systemd Service Management

```bash
# Status
sudo systemctl status portfolio-api portfolio-web nginx postgresql

# Restart
sudo systemctl restart portfolio-api portfolio-web

# Live log streams
sudo journalctl -u portfolio-api -f -n 50
sudo journalctl -u portfolio-web -f -n 50
```

### Nginx Management

```bash
# Test configuration syntax
sudo nginx -t

# Reload configuration gracefully
sudo systemctl reload nginx

# Check error logs
sudo tail -n 50 /var/log/nginx/error.log
```

### Network & Port Inspection

```bash
# View active TCP listening sockets and processes
sudo ss -tulpn

# Filter specifically for web, api, and database ports
sudo ss -tulpn | grep -E '80|443|3000|3001|5432'
```

### HTTP & API Health Probing

```bash
# Test local Express API
curl -s http://127.0.0.1:3001/api/v1/health

# Test local Next.js frontend
curl -I http://127.0.0.1:3000

# Test public HTTPS endpoints
curl -I https://anuj.curio.dpdns.org
curl -s https://anuj.curio.dpdns.org/api/v1/health
curl -s https://anuj.curio.dpdns.org/api/v1/health/ready
```

### DNS Diagnostics

```bash
# Check authoritative name servers and A record resolution
dig anuj.curio.dpdns.org +short
nslookup anuj.curio.dpdns.org
```

### Firewall (iptables & ufw)

```bash
# List current iptables rules with line numbers
sudo iptables -L INPUT --line-numbers -n

# Persist iptables modifications
sudo netfilter-persistent save

# UFW status
sudo ufw status verbose
```

### Certbot & SSL

```bash
# List installed certificates and expiration dates
sudo certbot certificates

# Dry-run certificate renewal
sudo certbot renew --dry-run
```
