# 🚀 Deploy Neon WEN Dashboard to Vercel

This guide will help you deploy your `neon-tracking.html` dashboard to Vercel and make it available on your custom domain `betr-wen.leovido.xyz`.

## 📋 Prerequisites

- [Vercel account](https://vercel.com/signup)
- [GitHub account](https://github.com) (recommended)
- Your neon dashboard files ready

## 🎯 Option 1: Quick Deploy (Recommended)

### Step 1: Install Vercel CLI

```bash
# Using npm (recommended)
npm i -g vercel

# Or using pip
pip install vercel
```

### Step 2: Run Deployment Script

```bash
python3 deploy_neon_dashboard.py
```

This script will:

- ✅ Check if Vercel CLI is installed
- ✅ Verify all required files exist
- ✅ Deploy to Vercel automatically
- ✅ Provide deployment URL

## 🎯 Option 2: Manual Deploy

### Step 1: Login to Vercel

```bash
vercel login
```

### Step 2: Deploy

```bash
vercel --prod
```

### Step 3: Follow Prompts

- **Set up and deploy**: `Y`
- **Which scope**: Select your account
- **Link to existing project**: `N`
- **Project name**: `neon-wen-dashboard` (or your preferred name)
- **Directory**: `.` (current directory)

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Add `betr-wen.leovido.xyz`

### Step 2: Configure DNS Records

Add these records to your domain provider (where `leovido.xyz` is managed):

#### For Vercel:

```
Type: A
Name: betr-wen
Value: 76.76.19.76
```

#### Or for CNAME (recommended):

```
Type: CNAME
Name: betr-wen
Value: cname.vercel-dns.com
```

### Step 3: Verify Domain

- Vercel will automatically verify your domain
- This may take a few minutes to propagate

## 📁 File Structure

Your deployment should include:

```
├── neon-tracking.html    # Main dashboard
├── neon-tracking.css     # Styles
├── neon-tracking.js      # JavaScript logic
├── vercel.json          # Vercel configuration
└── README.md            # Documentation
```

## 🔧 Vercel Configuration

The `vercel.json` file is configured to:

- Serve static files using `@vercel/static`
- Route `/` to `neon-tracking.html`
- Handle all asset files properly

## 🚨 Important Notes

### Backend Dependencies

⚠️ **Important**: Your dashboard currently connects to a local Flask backend (`http://localhost:5000`). For production:

1. **Option A**: Deploy backend to Vercel (requires Python functions)
2. **Option B**: Deploy backend to another service (Railway, Heroku, etc.)
3. **Option C**: Use Vercel serverless functions

### Environment Variables

If you need to configure API endpoints, add them in Vercel dashboard:

- Go to **Settings** → **Environment Variables**
- Add `BACKEND_URL` with your production backend URL

## 🔄 Updating Your Dashboard

### Automatic Updates (GitHub Integration)

1. Push changes to GitHub
2. Vercel automatically redeploys

### Manual Updates

```bash
vercel --prod
```

## 📊 Monitoring & Analytics

- **Vercel Analytics**: Built-in performance monitoring
- **Real-time logs**: View deployment logs in dashboard
- **Performance insights**: Core Web Vitals tracking

## 🆘 Troubleshooting

### Common Issues

#### 1. "Build Failed"

- Check `vercel.json` syntax
- Ensure all files exist
- Verify file permissions

#### 2. "Domain Not Working"

- Check DNS propagation (can take 24-48 hours)
- Verify DNS records are correct
- Check Vercel domain configuration

#### 3. "Assets Not Loading"

- Verify file paths in `vercel.json`
- Check browser console for 404 errors
- Ensure all files are deployed

### Get Help

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Support](https://vercel.com/support)

## 🎉 Success!

Once deployed, your dashboard will be available at:

- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: `https://betr-wen.leovido.xyz`

## 🔗 Quick Commands

```bash
# Deploy
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove project
vercel remove
```

---

**Need help?** Check the troubleshooting section or reach out to Vercel support!
