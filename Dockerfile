# Local development only. GitHub Pages does not use this image; see
# "Local container" in docs/ARCHITECTURE.md.
FROM node:22-alpine

WORKDIR /app
# Run as the image's unprivileged "node" user, not root.
RUN chown node:node /app
USER node

# Only the package files: the source is mounted as a volume at run time, so
# nothing else from the host (secrets, .env files) ends up in the image.
COPY --chown=node:node package.json package-lock.json ./
# No dependency needs an install script; skipping them blocks a compromised
# package from running code during install.
RUN npm ci --ignore-scripts

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
