# Deployment Guide - Factory Layout Sigma Plugin

## Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign up/sign in
2. Click "New Project"
3. Connect your GitHub account
4. Select the `factory_layout_sigma` repository
5. Click "Deploy" (no configuration needed)
6. Your site will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd factory_layout_sigma
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? factory-layout-sigma
# - Directory? ./
# - Override settings? N
```

### Option 3: Deploy via GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `nail-peter/factory_layout_sigma`
4. Configure:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: ./
5. Click "Deploy"

## Alternative Hosting Options

### Netlify
1. Go to [netlify.com](https://netlify.com)
2. "New site from Git"
3. Connect GitHub and select your repo
4. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: ./
5. Click "Deploy site"

### GitHub Pages
1. Go to your GitHub repository
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main
5. Folder: / (root)
6. Save

### Surge.sh (Command Line)
```bash
# Install surge
npm install -g surge

# Deploy
cd factory_layout_sigma
surge .

# Follow prompts for domain name
```

## Custom Domain Setup

### For Vercel:
1. Go to your project dashboard
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

### For Production Use:
- Use a custom domain for professional demos
- Enable analytics in Vercel dashboard
- Set up monitoring alerts

## Environment Variables (If Needed)

If you need to connect to live data sources:

```bash
# In Vercel dashboard, add environment variables:
SIGMA_API_KEY=your_api_key
DATA_SOURCE_URL=your_data_url
```

## Post-Deployment

1. Test all interactive features
2. Verify responsive design on mobile
3. Check performance with Lighthouse
4. Share the URL: `https://your-project.vercel.app`

## Updating the Site

Any push to the main branch will automatically redeploy on Vercel.

```bash
git add .
git commit -m "Update factory layout"
git push origin main
```

The site will be live within 30 seconds!