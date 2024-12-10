FROM denoland/deno:latest
RUN apt-get update && apt-get install -y curl
COPY . /app
WORKDIR /app
RUN deno run -A init.ts

RUN echo "Running tests"
RUN deno test
RUN echo "Tests passed"

RUN echo "Starting server"
ENTRYPOINT ["deno", "task", "start"]