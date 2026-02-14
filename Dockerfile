FROM gcr.io/distroless/nodejs18
WORKDIR /app
COPY dist ./dist
COPY node_modules ./node_modules
CMD ["dist/index.js"]
