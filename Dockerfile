FROM jdxcode/mise:2026.10.19-debian

RUN useradd --create-home --uid 1000 ofadiman
RUN chown --recursive ofadiman:ofadiman /mise
USER ofadiman
WORKDIR /home/ofadiman/postgresting

ENV MISE_TRUSTED_CONFIG_PATHS=/home/ofadiman/postgresting

COPY --chown=ofadiman:ofadiman mise.toml ./
RUN mise install

COPY --chown=ofadiman:ofadiman package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY --chown=ofadiman:ofadiman tsconfig.json vite.config.ts react-router.config.ts ./
COPY --chown=ofadiman:ofadiman app ./app
COPY --chown=ofadiman:ofadiman public ./public

CMD ["pnpm", "start:dev", "--host"]
