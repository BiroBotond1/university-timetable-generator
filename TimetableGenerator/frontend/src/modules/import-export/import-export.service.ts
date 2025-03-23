export async function doExport(data: string): Promise<void> {
  try {
    // Check if File System Access API is supported
    if ("showSaveFilePicker" in window) {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: "timetable.json",
        types: [{ description: "Json file", accept: { "application/json": [".json"] } }],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    } else {
      // Fallback for older browsers
      const blob = new Blob([data], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "timetable.json";
      link.click();
    }
  } catch (error) {
    console.error("Error saving file:", error);
  }
}

export async function doImport(): Promise<string> {
  try {
    // Check if File System Access API is supported
    if ("showOpenFilePicker" in window) {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{ description: "JSON file", accept: { "application/json": [".json"] } }],
      });

      const file = await fileHandle.getFile();
      const content = await file.text();
      return content; // Returns the file content as a string
    } else {
      // Fallback for older browsers
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = async (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve("");
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        };
        input.click();
      });
    }
  } catch (error) {
    console.error("Error reading file:", error);
    return "";
  }
}