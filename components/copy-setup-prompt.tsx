"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

function setupPrompt(origin: string) {
  return `Help me set up Airreload in my Flutter project so I can build, install, and hot reload my Android app over Wi-Fi.

Read the current setup guide at ${origin}/docs/quickstart.md and CLI reference at ${origin}/docs/reference/cli.md first. The complete documentation is available at ${origin}/llms-full.txt. If you cannot access these pages, ask me to provide them before proceeding.

1. Inspect my project and detect my operating system and CPU architecture. Check that this is a supported standalone Flutter Android app, and check Git, Android build tools, and a compatible JDK. Preserve my existing Flutter/FVM configuration and project changes.
2. Check whether Airreload is already installed. If needed, use the documented installer for macOS Apple Silicon or Windows x64, or follow the documented source installation for Linux. Explain any unsupported setup before proceeding. Airreload manages its own Flutter SDK; follow the additional Dart requirements for a source install.
3. Run airreload doctor and help resolve relevant setup issues. This checks local tools, not the phone connection.
4. Guide me through installing Airreload Go from https://github.com/Airreload/airreload-go/releases on my Android 8.0+ phone. My phone and computer must be on the same trusted local network.
5. Run airreload run from my Flutter project (or use the documented source executable with --project), preserving any required entrypoint, flavor, and build definitions. Keep the session running. Ask me to scan the pairing QR with Airreload Go, tap Pair and download, approve Android's installation prompts, and open the app.
6. Help me verify a small visible change using r for hot reload, and explain R for hot restart and Ctrl-C to stop. Report what you verified and which phone steps still need my input.`;
}

export function CopySetupPrompt() {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">(
    "idle",
  );
  const [manualPrompt, setManualPrompt] = useState("");

  async function copyPrompt() {
    const prompt = setupPrompt(window.location.origin);
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("copied");
      setManualPrompt("");
    } catch {
      setManualPrompt(prompt);
      setStatus("error");
    }
  }

  return (
    <div className="air-agent-setup">
      <div className="air-agent-setup-row">
        <button
          type="button"
          className="air-copy-prompt"
          onClick={copyPrompt}
          disabled={status === "copying"}
          aria-describedby="air-agent-setup-hint"
        >
          {status === "copied" ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          {status === "copied"
            ? "Copied!"
            : status === "copying"
              ? "Copying…"
              : "Copy setup prompt"}
        </button>
        <p id="air-agent-setup-hint" role="status">
          {status === "error"
            ? "Copy unavailable. Select and copy the prompt below."
            : status === "copied"
              ? "Paste it into your AI agent to get started."
              : "Let your AI agent help with setup."}
        </p>
      </div>
      {manualPrompt && (
        <textarea
          className="air-setup-prompt-fallback"
          aria-label="Setup prompt — select and copy into your AI agent"
          readOnly
          value={manualPrompt}
          rows={7}
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
