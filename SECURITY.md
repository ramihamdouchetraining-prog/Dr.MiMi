# 🔐 Security Guidelines - Dr.MiMi

## 🚨 Security Best Practices

### 1. Environment Variables

**NEVER commit these files to Git:**
- ❌ `.env`
- ❌ `.env.production` (contains production URLs)
- ❌ `.env.local`
- ❌ `cookies.txt` (contains session tokens)

**Use environment variables for:**
- Database credentials (`DATABASE_URL`)
- API keys (`OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`)
- OAuth secrets (`GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_SECRET`)
- Owner password (`OWNER_PASSWORD`)
- Session secrets (`SESSION_SECRET`)
- Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)

### 2. Password Security

**Owner Account:**
- Default username: `MiMiBEN`
- Default password: **MUST** be set via `OWNER_PASSWORD` environment variable
- Recommended: 12+ characters, mixed case, numbers, symbols
- Example: `MySecureP@ssw0rd2025!`

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 3. Production Deployment

#### Vercel (Frontend)
Set these environment variables in Vercel Dashboard:
```bash
VITE_API_URL=https://your-backend.onrender.com
```

#### Render (Backend)
Set these environment variables in Render Dashboard:
```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=your-random-secret-here
OWNER_PASSWORD=your-secure-password
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
OPENAI_API_KEY=...
GOOGLE_AI_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.onrender.com
NODE_ENV=production
```

### 4. CORS Configuration

Allowed origins for production:
- `https://your-app.vercel.app`
- `https://your-custom-domain.com`

**Never use:**
- `*` (wildcard) in production
- `http://localhost` in production

### 5. Database Security

- ✅ Use connection pooling
- ✅ Enable SSL/TLS for connections
- ✅ Use parameterized queries (Drizzle ORM does this)
- ✅ Implement row-level security
- ✅ Regular backups
- ❌ Never log database credentials

### 6. Session Management

- Session timeout: 2 hours (7200 seconds)
- Secure cookies: `httpOnly`, `secure`, `sameSite: 'lax'`
- Session rotation on login
- Automatic logout on inactivity

### 7. OAuth Security

**Google OAuth:**
- Authorized redirect URIs must match exactly
- Use state parameter for CSRF protection
- Validate tokens server-side

**Facebook OAuth:**
- Keep App Secret confidential
- Use HTTPS for redirect URIs
- Verify app domain

**Microsoft OAuth:**
- Register correct redirect URIs
- Use PKCE flow when possible

### 8. API Security

**Rate Limiting:**
- Implement rate limiting on sensitive endpoints
- Limit: 100 requests per 15 minutes per IP

**Authentication:**
- JWT tokens for API authentication
- Token expiration: 24 hours
- Refresh tokens: 7 days

### 9. Content Security Policy (CSP)

Implemented via Helmet.js:
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
})
```

### 10. Dependencies

**Regular Updates:**
```bash
npm audit
npm audit fix
npm outdated
```

**Known Vulnerabilities:**
- Check `npm audit` output
- Update packages regularly
- Use `npm audit fix --force` only for non-breaking changes

### 11. File Uploads

**Security measures:**
- File type validation (whitelist)
- File size limits (5MB for images, 10MB for documents)
- Virus scanning (recommended)
- Sanitize filenames
- Store files outside web root

### 12. Logging & Monitoring

**What to log:**
- ✅ Failed login attempts
- ✅ API errors
- ✅ Security events
- ✅ Database errors

**What NOT to log:**
- ❌ Passwords
- ❌ Session tokens
- ❌ API keys
- ❌ Personal data (GDPR)

### 13. GDPR Compliance

- User consent for data collection
- Data export functionality
- Data deletion on request
- Privacy policy
- Cookie consent banner

### 14. Backup & Recovery

**Database Backups:**
- Automated daily backups (Neon provides this)
- Point-in-time recovery
- Backup retention: 7 days minimum

**Code Backups:**
- Git repository (GitHub)
- Tag releases: `v1.0.0`, `v1.1.0`, etc.

### 15. Incident Response

**In case of security breach:**
1. Immediately rotate all secrets and API keys
2. Force logout all users
3. Investigate the breach
4. Notify affected users (if applicable)
5. Document the incident
6. Implement preventive measures

---

## 📞 Security Contacts

- Project Owner: dr.mimi.ben@gmail.com
- Security Issues: Report via GitHub Issues (private)

## 🔄 Last Updated

October 22, 2025

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security](https://react.dev/learn/security)
