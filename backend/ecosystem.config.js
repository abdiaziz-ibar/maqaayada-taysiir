// PM2 process definition for the backend in production.
// One-time setup on the server:
//   cd backend && pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup   # follow the printed command once, so PM2 survives a reboot
module.exports = {
  apps: [
    {
      name: "maqaayda-taysiir-backend",
      cwd: __dirname,
      script: "server.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
