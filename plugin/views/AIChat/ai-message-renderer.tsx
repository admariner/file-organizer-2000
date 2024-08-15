import React, { useEffect, useRef, useState } from "react";
import {
  MarkdownRenderer,
  MarkdownView,
  Notice,
  TFile,
} from "obsidian";
import { usePlugin } from "./provider";

interface ObsidianRendererProps {
  content: string;
}

export const AIMarkdown: React.FC<ObsidianRendererProps> = ({
  content,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plugin = usePlugin();
  const [renderedContent, setRenderedContent] = useState("");
  const [activeFile, setActiveFile] = useState<TFile | null>(null);

  useEffect(() => {
    if (!app || !containerRef.current) return;

    const renderMarkdown = async () => {
      try {
        const leaf = plugin.app.workspace.getMostRecentLeaf();
        if (leaf && leaf.view instanceof MarkdownView) {
          const tempContainer = document.createElement("div");
          await MarkdownRenderer.render(
            app,
            content,
            tempContainer,
            "",
            leaf.view
          );
          setRenderedContent(tempContainer.innerHTML);
        }
      } catch (e) {
        console.error(e);
      }
    };

    renderMarkdown();
  }, [content, app]);

  useEffect(() => {
    if (!app) return;

    const updateActiveFile = () => {
      const file = app.workspace.getActiveFile();
      setActiveFile(file);
    };

    updateActiveFile();

    // Listen for file changes
    const eventRef = app.workspace.on("file-open", updateActiveFile);

    return () => {
      app.workspace.offref(eventRef);
    };
  }, [app]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !app) return;

    const createIcon = (icon: string, onClick: () => void, tooltip: string, actionText: string) => {
      const iconContainer = document.createElement("button");
      iconContainer.className = "clickable-icon-container";
      iconContainer.title = tooltip;
      iconContainer.addEventListener("click", onClick);

      const iconEl = document.createElement("span");
      iconEl.innerHTML = icon;
      iconEl.className = "clickable-icon";

      const actionSpan = document.createElement("span");
      actionSpan.textContent = actionText;
      actionSpan.className = "icon-action-text";

      iconContainer.appendChild(iconEl);
      iconContainer.appendChild(actionSpan);
      container.appendChild(iconContainer);
      return iconContainer;
    };

    const copyIcon = createIcon(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
      () => navigator.clipboard.writeText(content),
      "Copy content",
      "Copy"
    );

    const appendIcon = createIcon(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus-square"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
      async () => {
        if (activeFile) {
          const oldContent = await plugin.app.vault.read(activeFile);
          await plugin.app.vault.modify(activeFile, oldContent + content);
          new Notice("Content appended to the current note");
        } else {
          new Notice("No active file");
        }
      },
      "Append to current note",
      "Append"
    );

    const replaceIcon = createIcon(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-refresh-cw"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
      async () => {
        if (activeFile) {
          await plugin.app.vault.modify(activeFile, content);
          new Notice("Content replaced in the current note");
        } else {
          new Notice("No active file");
        }
      },
      "Replace content in current note",
      "Replace"
    );

    const aiFormatIcon = createIcon(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
      async () => {
        if (!activeFile) {
          new Notice("No active file");
          return;
        }
        await plugin.formatContent(activeFile, "", content);
        new Notice("Content formatted and replaced in the current note");
      },
      "Format and replace content in current note",
      "Format"
    );

    return () => {
      copyIcon.remove();
      appendIcon.remove();
      replaceIcon.remove();
      aiFormatIcon.remove();
    };
  }, [content, plugin, app, activeFile]);

  return (
    <div className="obsidian-renderer">
      <div className="icon-container" ref={containerRef}>

      </div>
      <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </div>
  );
};