FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build:ui:e2e
EXPOSE 1420
CMD ["pnpm", "exec", "vite", "preview", "--port", "1420", "--host", "0.0.0.0"]
