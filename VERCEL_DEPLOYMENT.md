# Vercel Deployment Guide

## 🚀 Quick Deployment

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from project root:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name: **ai-copilot-parents** (or your preferred name)
   - Directory: **./** (current directory)
   - Override settings? **No**

### Option 2: Using Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**
2. **Go to [vercel.com](https://vercel.com)**
3. **Click "New Project"**
4. **Import your repository**
5. **Configure build settings:**
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 🔧 Build Configuration

### Build Command
```bash
npm run build
```

### Environment Variables
Set these in your Vercel dashboard under Project Settings > Environment Variables:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### Build Settings
- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node.js Version:** 18.x

## 📁 Project Structure for Vercel

```
ai-copilot-parents/
├── vercel.json          # Vercel configuration
├── package.json         # Root package.json
├── build.js            # Build script
├── client/             # React frontend
│   ├── package.json
│   ├── src/
│   └── dist/           # Built frontend (created during build)
├── server/             # Node.js backend
│   ├── package.json
│   ├── index.js
│   ├── routes/
│   ├── models/
│   └── utils/
└── dist/               # Final build output (created during build)
```

## 🔄 Build Process

The build process does the following:

1. **Installs client dependencies** (`client/package.json`)
2. **Builds the React app** (`npm run build` in client)
3. **Installs server dependencies** (`server/package.json`)
4. **Copies client build to root** (`client/dist` → `dist`)
5. **Prepares server for deployment**

## 🌐 API Routes

Your API routes will be available at:
- `https://your-app.vercel.app/api/children`
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/reminders`
- `https://your-app.vercel.app/api/care-plans`
- `https://your-app.vercel.app/api/ai`

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas account** at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Create a new cluster**
3. **Get connection string** and add to Vercel environment variables
4. **Run migration script** (optional):
   ```bash
   # Set MONGODB_URI in your local .env
   npm run migrate --prefix server
   ```

### Environment Variables in Vercel

Go to your Vercel project dashboard:
1. **Settings** → **Environment Variables**
2. **Add the following:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-copilot-parents
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=production
   ```

## 🚀 Deployment Commands

### First Deployment
```bash
# From project root
vercel

# Or with specific settings
vercel --prod
```

### Subsequent Deployments
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Local Development
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check Node.js version (should be 18.x or higher)
   - Verify all dependencies are installed
   - Check for TypeScript errors in client

2. **API Routes Not Working:**
   - Verify `vercel.json` configuration
   - Check server logs in Vercel dashboard
   - Ensure MongoDB connection string is correct

3. **Environment Variables Not Loading:**
   - Check Vercel dashboard environment variables
   - Ensure variables are set for all environments (Development, Preview, Production)
   - Redeploy after adding new environment variables

4. **Database Connection Issues:**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

### Debug Commands

```bash
# Check Vercel CLI version
vercel --version

# View deployment logs
vercel logs

# Check project status
vercel ls

# Remove deployment
vercel remove
```

## 📊 Monitoring

### Vercel Dashboard
- **Functions:** Monitor serverless function performance
- **Analytics:** View traffic and performance metrics
- **Logs:** Check server logs and errors

### Health Check
Your app includes a health check endpoint:
```
GET https://your-app.vercel.app/api/health
```

## 🔄 Continuous Deployment

### GitHub Integration
1. **Connect your GitHub repository** to Vercel
2. **Enable automatic deployments** on push to main branch
3. **Set up preview deployments** for pull requests

### Custom Domains
1. **Go to Project Settings** → **Domains**
2. **Add your custom domain**
3. **Update DNS records** as instructed

## 📝 Notes

- **Serverless Functions:** Your Node.js server runs as serverless functions
- **Cold Starts:** First request may be slower due to cold start
- **File System:** Use MongoDB for persistent storage (not local files)
- **Environment:** All environment variables must be set in Vercel dashboard

## 🆘 Support

If you encounter issues:
1. **Check Vercel logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test locally** with `npm run build` and `npm start`
4. **Check MongoDB Atlas** connection and permissions

Your app should now be successfully deployed on Vercel! 🎉
