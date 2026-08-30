FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

SHELL ["/bin/bash", "-c"]

USER vscode

RUN curl -o- https://fnm.vercel.app/install | bash \
    && export PATH="/home/vscode/.local/share/fnm:$PATH" \
    && eval "`fnm env`" \
    && fnm install 24 \
    && fnm default 24 \
    && npm cache clean --force

RUN curl -s "https://get.sdkman.io" | bash \
    && source "/home/vscode/.sdkman/bin/sdkman-init.sh" \
    && echo "sdkman_auto_answer=true" >> "/home/vscode/.sdkman/etc/config" \
    && sdk install java 25-tem \
    && sdk install maven \
    && sdk flush archives \
    && sdk flush temp

ENV FNM_DIR="/home/vscode/.local/share/fnm"
ENV SDKMAN_DIR="/home/vscode/.sdkman"
ENV PATH="$FNM_DIR:$SDKMAN_DIR/candidates/java/current/bin:$SDKMAN_DIR/candidates/maven/current/bin:$PATH"

RUN echo 'alias run-web="cd /workspace/web && npm run dev"' >> ~/.bashrc \
 && echo 'alias run-api="cd /workspace/api && mvn spring-boot:run"' >> ~/.bashrc \
 && echo 'alias gen-api="cd /workspace/web && npm run generate:api"' >> ~/.bashrc