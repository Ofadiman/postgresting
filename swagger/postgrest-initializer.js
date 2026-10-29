const specUrl = "http://127.0.0.1:25000/";

const tagsByPath = {
  "/rpc/signup": "auth",
  "/rpc/login": "auth",
};

const regroup = (spec) => {
  for (const [path, tag] of Object.entries(tagsByPath)) {
    for (const operation of Object.values(spec.paths?.[path] ?? {})) {
      operation.tags = [tag];
    }
  }
  return spec;
};

window.onload = () => {
  window.ui = SwaggerUIBundle({
    url: specUrl,
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
    responseInterceptor: (response) => {
      if (response.url === specUrl && response.ok) {
        const spec = regroup(JSON.parse(response.text));
        response.text = JSON.stringify(spec);
        response.body = spec;
        response.obj = spec;
      }
      return response;
    },
  });
};
