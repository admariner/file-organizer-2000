import React from "react";
import { motion } from "framer-motion";
import { App } from "obsidian";
import { ToolInvocation } from "ai";
import { YouTubeHandler } from "./youtube-handler";
import { SearchHandler } from "./search-handler";
import { DateRangeHandler } from "./date-range-handler";
import { LastModifiedHandler } from "./last-modified-handler";
import { ScreenpipeHandler } from "./screenpipe-handler";
import { SettingsUpdateHandler } from "./settings-update-handler";
import { AppendContentHandler } from "./append-content-handler";
import { OnboardHandler } from "./onboard-handler";
import { MoveFilesHandler } from "./move-files-handler";
import { RenameFilesHandler } from "./rename-files-handler";
import { SearchRenameHandler } from "./search-rename-handler";
import { ExecuteActionsHandler } from "./execute-actions-handler";
import { AddTextHandler } from "./add-text-handler";
import { ModifyTextHandler } from "./modify-text-handler";

interface ToolInvocationHandlerProps {
  toolInvocation: ToolInvocation;
  addToolResult: (result: { toolCallId: string; result: string }) => void;
  app: App;
}

function ToolInvocationHandler({
  toolInvocation,
  addToolResult,
  app,
}: ToolInvocationHandlerProps) {
  const toolCallId = toolInvocation.toolCallId;
  const handleAddResult = (result: string) =>
    addToolResult({ toolCallId, result });

  const getToolTitle = (toolName: string) => {
    const toolTitles = {
      getNotesForDateRange: "Fetching Notes",
      getSearchQuery: "Searching Notes",
      askForConfirmation: "Confirmation Required",
      getYoutubeVideoId: "YouTube Transcript",
      modifyCurrentNote: "Note Modification",
      getLastModifiedFiles: "Recent File Activity",
      getScreenpipeDailySummary: "Querying Screenpipe Data",
      generateSettings: "Settings Update",
      appendContentToFile: "Append Content",
      analyzeVaultStructure: "Vault Analysis",
      moveFiles: "Moving Files",
      renameFiles: "Renaming Files",
      searchByName: "Search Files by Name",
      executeActionsOnFileBasedOnPrompt: "Execute Actions on Files",
      addTextToDocument: "Adding Text to Document",
      modifyDocumentText: "Modifying Document Text",
      onboardUser: "Onboarding User",
    };
    return toolTitles[toolName] ;
  };

  const renderContent = () => {
    const handlers = {
      getSearchQuery: () => (
        <SearchHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      getYoutubeVideoId: () => (
        <YouTubeHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
        />
      ),
      getNotesForDateRange: () => (
        <DateRangeHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      getLastModifiedFiles: () => (
        <LastModifiedHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      getScreenpipeDailySummary: () => (
        <ScreenpipeHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      generateSettings: () => (
        <SettingsUpdateHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
        />
      ),
      appendContentToFile: () => (
        <AppendContentHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
        />
      ),
      analyzeVaultStructure: () => (
        <OnboardHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      moveFiles: () => (
        <MoveFilesHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      renameFiles: () => (
        <RenameFilesHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      searchByName: () => (
        <SearchRenameHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      executeActionsOnFileBasedOnPrompt: () => (
        <ExecuteActionsHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      addTextToDocument: () => (
        <AddTextHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
      modifyDocumentText: () => (
        <ModifyTextHandler
          toolInvocation={toolInvocation}
          handleAddResult={handleAddResult}
          app={app}
        />
      ),
    };

    return handlers[toolInvocation.toolName]?.() || null;
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="m-0 mb-2 text-[--text-normal] text-sm font-semibold">
        {getToolTitle(toolInvocation.toolName)}
      </h4>
      <div className="text-sm text-[--text-muted]">{renderContent()}</div>
    </motion.div>
  );
}

export default ToolInvocationHandler;

