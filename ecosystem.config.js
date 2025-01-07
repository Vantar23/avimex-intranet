module.exports = {
    apps: [
      {
        name: "nextjs-prod",
        script: "node_modules/next/dist/bin/next",
        args: "start -H 0.0.0.0 -p 3000",
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };
  