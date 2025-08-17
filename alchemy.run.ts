/// <reference types="@types/node" />

import alchemy from "alchemy";
import { GitHubComment } from "alchemy/github";
import { CloudflareStateStore } from "alchemy/state";
import { Vite } from "alchemy/cloudflare";

const app = await alchemy("my-alchemy-app", {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

export const worker = await Vite("my-alchemy-app", {
  entrypoint: "worker/index.ts",
  version: app.stage === "prod" ? undefined : app.stage,
});

console.log({
  url: worker.url,
});


if (process.env.PULL_REQUEST) {
  const previewUrl = worker.url;
  
  await GitHubComment("pr-preview-comment", {
    owner: process.env.GITHUB_REPOSITORY_OWNER || "your-username",
    repository: process.env.GITHUB_REPOSITORY_NAME || "my-app",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `
## 🚀 Preview Deployed

Your preview is ready! 

**Preview URL:** ${previewUrl}

This preview was built from commit ${process.env.GITHUB_SHA}

---
<sub>🤖 This comment will be updated automatically when you push new commits to this PR.</sub>`,
  });
}

await app.finalize();
