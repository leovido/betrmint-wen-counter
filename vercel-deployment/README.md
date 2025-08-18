# 🚀 Deploy Farcaster API Proxy to Vercel

This guide will help you deploy your Farcaster API proxy to Vercel for free, making it accessible at `betrmint-leovido.xyz` or a custom domain.

## ✅ Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)
2. **GitHub Account**: For connecting your repository
3. **Domain** (optional): If you want to use `betrmint.leovido.xyz`

## 📁 Required Files for Vercel

The following files are needed for Vercel deployment:

```
📁 your-repo/
├── 📄 vercel.json              # Vercel configuration
├── 📄 requirements-vercel.txt  # Python dependencies for Vercel
└── 📁 api/
    └── 📄 proxy.py            # Serverless function handler
```

## 🎯 Step-by-Step Deployment

### Step 1: Push Code to GitHub

1. **Create a new GitHub repository** (e.g., `betrmint-wen-proxy`)

2. **Upload these files** to your GitHub repo:
   - `vercel.json`
   - `requirements-vercel.txt` 
   - `api/proxy.py`

```bash
# In your local directory
git init
git add vercel.json requirements-vercel.txt api/
git commit -m "Add Vercel proxy deployment"
git remote add origin https://github.com/YOUR_USERNAME/betrmint-wen-proxy.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import from GitHub**: Select your `betrmint-wen-proxy` repository
4. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: **Leave empty** (use root)
   - Build Command: **Leave empty**
   - Output Directory: **Leave empty**
   - Install Command: `pip install -r requirements-vercel.txt`

5. **Environment Variables** (Optional):
   - Add `FARCASTER_BASE_URL` = `https://client.farcaster.xyz/v2`
   - (This is already set as default in the code)

6. **Click "Deploy"** 🚀

### Step 3: Test Your Deployment

After deployment, Vercel will give you a URL like:
`https://betrmint-wen-proxy.vercel.app`

**Test endpoints:**

```bash
# Health check
curl https://betrmint-wen-proxy.vercel.app/health

# API proxy test (replace with your actual conversationId and token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://betrmint-wen-proxy.vercel.app/api/direct-cast-conversation-messages?conversationId=123&limit=5"
```

### Step 4: Custom Domain (Optional)

To use `betrmint.leovido.xyz`:

1. **In Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. **Add Domain**: `betrmint.leovido.xyz`
3. **Configure DNS**: Vercel will show you the DNS records to add
4. **Add DNS records** to your domain registrar:
   ```
   Type: CNAME
   Name: betrmint (or @)
   Value: cname.vercel-dns.com
   ```

## 🎯 Using with WEN Tools

Once deployed, update your WEN counter and monitor to use your Vercel URL:

```bash
# Instead of:
python3 wen_counter.py -u "https://client.farcaster.xyz/v2/direct-cast-conversation-messages?..." -t "TOKEN"

# Use your Vercel deployment:
python3 wen_counter.py -u "https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?..." -t "TOKEN"

# For monitoring:
python3 wen_monitor.py -u "https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?..." -t "TOKEN" -i 1m
```

## 🔧 Vercel Configuration Details

### vercel.json
```json
{
  "version": 2,
  "builds": [{"src": "api/proxy.py", "use": "@vercel/python"}],
  "routes": [
    {"src": "/health", "dest": "/api/proxy.py"},
    {"src": "/api/(.*)", "dest": "/api/proxy.py"},
    {"src": "/(.*)", "dest": "/api/proxy.py"}
  ],
  "env": {
    "FARCASTER_BASE_URL": "https://client.farcaster.xyz/v2"
  },
  "functions": {
    "api/proxy.py": {"maxDuration": 30}
  }
}
```

### Endpoints Available

- **`/health`** - Health check endpoint
- **`/api/*`** - Proxy to Farcaster API 
- **`/`** - API information

## ⚡ Vercel Advantages

- **🆓 Free Tier**: Perfect for this use case
- **🚀 Global CDN**: Fast worldwide
- **🔒 HTTPS**: Automatic SSL certificates
- **📊 Analytics**: Built-in usage analytics
- **🔄 Auto-deploy**: Updates when you push to GitHub
- **⚡ Serverless**: Scales automatically
- **🛠️ Zero Configuration**: Just push and deploy

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**: 
   - Check `requirements-vercel.txt` has correct package versions
   - Ensure `api/proxy.py` has no syntax errors

2. **Timeout Errors**:
   - Vercel free tier has 10-second timeout
   - Our function has 30-second max duration configured

3. **CORS Issues**:
   - Headers are configured for `*` origin
   - Preflight requests are handled

4. **Environment Variables**:
   - Set in Vercel Dashboard → Project → Settings → Environment Variables

### Logs and Debugging

1. **Vercel Dashboard** → Your Project → **Functions** → View logs
2. **Real-time logs**: `vercel logs` (using Vercel CLI)
3. **Local testing**: `vercel dev` (requires Vercel CLI)

## 🔐 Security Notes

- ✅ Original Farcaster URL is hidden from users
- ✅ Bearer tokens are passed through securely  
- ✅ HTTPS is enforced by default
- ✅ No server maintenance required
- ✅ Vercel handles security updates

## 📈 Monitoring

Monitor your proxy usage in:
- **Vercel Dashboard** → Analytics
- **Function invocations** and **bandwidth usage**
- **Response times** and **error rates**

## 💡 Next Steps

1. **Deploy to Vercel** following the steps above
2. **Test thoroughly** with both tools
3. **Set up custom domain** if desired
4. **Monitor usage** in Vercel dashboard
5. **Update WEN tools** to use your new proxy URL

Your Farcaster API endpoint will now be completely obfuscated behind your Vercel deployment! 🎉
