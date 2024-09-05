/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PokerRangePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  defaultRange: ""
};
var PokerRangePlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.grid = new Grid("default", this.settings.defaultRange.split(","), (selectedCodes, id) => {
    });
    this.addSettingTab(new PokerRangeSettingTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor("poker-range", (source, el, ctx) => {
      var _a;
      const lines = source.split("\n");
      let range = this.settings.defaultRange;
      let gridId = this.generateUniqueId();
      if (lines[0].startsWith("<!-- grid-id:")) {
        gridId = ((_a = lines[0].match(/<!-- grid-id:\s*(.+?)\s*-->/)) == null ? void 0 : _a[1]) || gridId;
        range = lines.slice(1).join(",").trim() || range;
      } else {
        range = source.trim() || range;
      }
      const grid = new Grid(gridId, range.split(","), (selectedCodes, id) => {
        this.updateCodeBlock(ctx, selectedCodes.join(","), id);
      });
      el.appendChild(grid.render());
    });
    this.addCommand({
      id: "insert-poker-range",
      name: "Insert Poker Range Table",
      editorCallback: (editor, view) => {
        const cursor = editor.getCursor();
        const range = this.settings.defaultRange;
        const gridId = this.generateUniqueId();
        const content = `\`\`\`poker-range
<!-- grid-id: ${gridId} -->
${range}
\`\`\`
`;
        editor.replaceRange(content, cursor);
        const endPos = editor.offsetToPos(editor.posToOffset(cursor) + content.length);
        editor.setCursor(endPos);
      }
    });
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async updateCodeBlock(ctx, newRange, gridId) {
    const file = this.app.workspace.getActiveFile();
    if (!file)
      return;
    const content = await this.app.vault.read(file);
    const lines = content.split("\n");
    let inCodeBlock = false;
    let codeBlockStart = -1;
    let codeBlockEnd = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith("```poker-range")) {
        inCodeBlock = true;
        codeBlockStart = i;
      } else if (inCodeBlock && lines[i].trim() === "```") {
        codeBlockEnd = i;
        const blockContent = lines.slice(codeBlockStart, codeBlockEnd + 1).join("\n");
        if (blockContent.includes(`<!-- grid-id: ${gridId} -->`)) {
          lines[codeBlockStart + 1] = `<!-- grid-id: ${gridId} -->`;
          lines[codeBlockStart + 2] = newRange;
          const updatedContent = lines.join("\n");
          await this.app.vault.modify(file, updatedContent);
          return;
        }
        inCodeBlock = false;
      }
    }
  }
  generateUniqueId() {
    return `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
var Grid = class {
  constructor(id, selectedCodes = [], onSelectionChange) {
    this.values = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
    this.isSelecting = false;
    this.lastSelectedState = null;
    this.id = id;
    this.selectedCodes = new Set(selectedCodes);
    this.onSelectionChange = onSelectionChange;
  }
  render() {
    const grid = document.createElement("div");
    grid.className = "poker-range-grid";
    grid.setAttribute("data-grid-id", this.id);
    grid.addEventListener("mousedown", () => this.isSelecting = true);
    grid.addEventListener("mouseup", () => {
      this.isSelecting = false;
      this.lastSelectedState = null;
    });
    grid.addEventListener("mouseleave", () => {
      this.isSelecting = false;
      this.lastSelectedState = null;
    });
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 13; j++) {
        const cell = document.createElement("div");
        cell.className = "poker-range-cell";
        cell.style.userSelect = "none";
        let content;
        if (i < j) {
          content = `${this.values[i]}${this.values[j]}s`;
          cell.classList.add("poker-range-suited");
        } else if (i > j) {
          content = `${this.values[j]}${this.values[i]}o`;
          cell.classList.add("poker-range-offsuit");
        } else {
          content = `${this.values[j]}${this.values[i]}`;
          cell.classList.add("poker-range-pair");
        }
        cell.textContent = content;
        if (this.selectedCodes.has(content)) {
          cell.classList.add("poker-range-selected");
        }
        cell.addEventListener("mousedown", (e) => this.handleCellInteraction(cell, content, e));
        cell.addEventListener("mouseover", (e) => this.handleCellInteraction(cell, content, e));
        grid.appendChild(cell);
      }
    }
    return grid;
  }
  handleCellInteraction(cell, content, event) {
    if (event.type === "mousedown" || event.type === "mouseover" && this.isSelecting) {
      if (this.lastSelectedState === null) {
        this.lastSelectedState = !this.selectedCodes.has(content);
      }
      this.toggleCell(cell, content, this.lastSelectedState);
    }
  }
  toggleCell(cell, content, forceState) {
    const newState = forceState !== void 0 ? forceState : !this.selectedCodes.has(content);
    if (newState) {
      this.selectedCodes.add(content);
      cell.classList.add("poker-range-selected");
    } else {
      this.selectedCodes.delete(content);
      cell.classList.remove("poker-range-selected");
    }
    this.onSelectionChange(Array.from(this.selectedCodes), this.id);
  }
  getSelectedCodes() {
    return Array.from(this.selectedCodes);
  }
  setSelectedCodes(codes) {
    this.selectedCodes = new Set(codes);
  }
};
var PokerRangeSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Default Range").setDesc("Set the default poker range (comma-separated)").addText((text) => text.setPlaceholder("AKs,QJs").setValue(this.plugin.settings.defaultRange).onChange(async (value) => {
      this.plugin.settings.defaultRange = value;
      await this.plugin.saveSettings();
      this.updateGrid();
    }));
    this.gridContainer = containerEl.createDiv("poker-range-grid-container");
    this.updateGrid();
  }
  updateGrid() {
    this.gridContainer.empty();
    const grid = this.plugin.grid.render();
    this.gridContainer.appendChild(grid);
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBOb3RpY2UsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgTWFya2Rvd25Qb3N0UHJvY2Vzc29yQ29udGV4dCwgRWRpdG9yLCBNYXJrZG93blZpZXcgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG5pbnRlcmZhY2UgUG9rZXJSYW5nZVNldHRpbmdzIHtcclxuXHRkZWZhdWx0UmFuZ2U6IHN0cmluZztcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogUG9rZXJSYW5nZVNldHRpbmdzID0ge1xyXG5cdGRlZmF1bHRSYW5nZTogJydcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9rZXJSYW5nZVBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcblx0c2V0dGluZ3M6IFBva2VyUmFuZ2VTZXR0aW5ncztcclxuXHRncmlkOiBHcmlkO1xyXG5cclxuXHRhc3luYyBvbmxvYWQoKSB7XHJcblx0XHRhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xyXG5cdFx0dGhpcy5ncmlkID0gbmV3IEdyaWQoJ2RlZmF1bHQnLCB0aGlzLnNldHRpbmdzLmRlZmF1bHRSYW5nZS5zcGxpdCgnLCcpLCAoc2VsZWN0ZWRDb2RlcywgaWQpID0+IHtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUG9rZXJSYW5nZVNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcclxuXHJcblx0XHR0aGlzLnJlZ2lzdGVyTWFya2Rvd25Db2RlQmxvY2tQcm9jZXNzb3IoJ3Bva2VyLXJhbmdlJywgKHNvdXJjZSwgZWwsIGN0eCkgPT4ge1xyXG5cdFx0XHRjb25zdCBsaW5lcyA9IHNvdXJjZS5zcGxpdCgnXFxuJyk7XHJcblx0XHRcdGxldCByYW5nZSA9IHRoaXMuc2V0dGluZ3MuZGVmYXVsdFJhbmdlO1xyXG5cdFx0XHRsZXQgZ3JpZElkID0gdGhpcy5nZW5lcmF0ZVVuaXF1ZUlkKCk7XHJcblxyXG5cdFx0XHRpZiAobGluZXNbMF0uc3RhcnRzV2l0aCgnPCEtLSBncmlkLWlkOicpKSB7XHJcblx0XHRcdFx0Z3JpZElkID0gbGluZXNbMF0ubWF0Y2goLzwhLS0gZ3JpZC1pZDpcXHMqKC4rPylcXHMqLS0+Lyk/LlsxXSB8fCBncmlkSWQ7XHJcblx0XHRcdFx0cmFuZ2UgPSBsaW5lcy5zbGljZSgxKS5qb2luKCcsJykudHJpbSgpIHx8IHJhbmdlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJhbmdlID0gc291cmNlLnRyaW0oKSB8fCByYW5nZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgZ3JpZCA9IG5ldyBHcmlkKGdyaWRJZCwgcmFuZ2Uuc3BsaXQoJywnKSwgKHNlbGVjdGVkQ29kZXMsIGlkKSA9PiB7XHJcblx0XHRcdFx0dGhpcy51cGRhdGVDb2RlQmxvY2soY3R4LCBzZWxlY3RlZENvZGVzLmpvaW4oJywnKSwgaWQpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0ZWwuYXBwZW5kQ2hpbGQoZ3JpZC5yZW5kZXIoKSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ2luc2VydC1wb2tlci1yYW5nZScsXHJcblx0XHRcdG5hbWU6ICdJbnNlcnQgUG9rZXIgUmFuZ2UgVGFibGUnLFxyXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yLCB2aWV3OiBNYXJrZG93blZpZXcpID0+IHtcclxuXHRcdFx0XHRjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XHJcblx0XHRcdFx0Y29uc3QgcmFuZ2UgPSB0aGlzLnNldHRpbmdzLmRlZmF1bHRSYW5nZTtcclxuXHRcdFx0XHRjb25zdCBncmlkSWQgPSB0aGlzLmdlbmVyYXRlVW5pcXVlSWQoKTtcclxuXHRcdFx0XHRjb25zdCBjb250ZW50ID0gYFxcYFxcYFxcYHBva2VyLXJhbmdlXFxuPCEtLSBncmlkLWlkOiAke2dyaWRJZH0gLS0+XFxuJHtyYW5nZX1cXG5cXGBcXGBcXGBcXG5gO1xyXG5cdFx0XHRcdGVkaXRvci5yZXBsYWNlUmFuZ2UoY29udGVudCwgY3Vyc29yKTtcclxuXHJcblx0XHRcdFx0Y29uc3QgZW5kUG9zID0gZWRpdG9yLm9mZnNldFRvUG9zKGVkaXRvci5wb3NUb09mZnNldChjdXJzb3IpICsgY29udGVudC5sZW5ndGgpO1xyXG5cdFx0XHRcdGVkaXRvci5zZXRDdXJzb3IoZW5kUG9zKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XHJcblx0XHR0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcclxuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XHJcblx0fVxyXG5cclxuXHRhc3luYyB1cGRhdGVDb2RlQmxvY2soY3R4OiBNYXJrZG93blBvc3RQcm9jZXNzb3JDb250ZXh0LCBuZXdSYW5nZTogc3RyaW5nLCBncmlkSWQ6IHN0cmluZykge1xyXG5cdFx0Y29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XHJcblx0XHRpZiAoIWZpbGUpIHJldHVybjtcclxuXHJcblx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHRcdGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdCgnXFxuJyk7XHJcblxyXG5cdFx0bGV0IGluQ29kZUJsb2NrID0gZmFsc2U7XHJcblx0XHRsZXQgY29kZUJsb2NrU3RhcnQgPSAtMTtcclxuXHRcdGxldCBjb2RlQmxvY2tFbmQgPSAtMTtcclxuXHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmIChsaW5lc1tpXS50cmltKCkuc3RhcnRzV2l0aCgnYGBgcG9rZXItcmFuZ2UnKSkge1xyXG5cdFx0XHRcdGluQ29kZUJsb2NrID0gdHJ1ZTtcclxuXHRcdFx0XHRjb2RlQmxvY2tTdGFydCA9IGk7XHJcblx0XHRcdH0gZWxzZSBpZiAoaW5Db2RlQmxvY2sgJiYgbGluZXNbaV0udHJpbSgpID09PSAnYGBgJykge1xyXG5cdFx0XHRcdGNvZGVCbG9ja0VuZCA9IGk7XHJcblx0XHRcdFx0Y29uc3QgYmxvY2tDb250ZW50ID0gbGluZXMuc2xpY2UoY29kZUJsb2NrU3RhcnQsIGNvZGVCbG9ja0VuZCArIDEpLmpvaW4oJ1xcbicpO1xyXG5cdFx0XHRcdGlmIChibG9ja0NvbnRlbnQuaW5jbHVkZXMoYDwhLS0gZ3JpZC1pZDogJHtncmlkSWR9IC0tPmApKSB7XHJcblx0XHRcdFx0XHRsaW5lc1tjb2RlQmxvY2tTdGFydCArIDFdID0gYDwhLS0gZ3JpZC1pZDogJHtncmlkSWR9IC0tPmA7XHJcblx0XHRcdFx0XHRsaW5lc1tjb2RlQmxvY2tTdGFydCArIDJdID0gbmV3UmFuZ2U7XHJcblx0XHRcdFx0XHRjb25zdCB1cGRhdGVkQ29udGVudCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xyXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIHVwZGF0ZWRDb250ZW50KTtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aW5Db2RlQmxvY2sgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgZ2VuZXJhdGVVbmlxdWVJZCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIGBncmlkLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEdyaWQge1xyXG5cdHByaXZhdGUgaWQ6IHN0cmluZztcclxuXHRwcml2YXRlIHZhbHVlcyA9IFsnQScsICdLJywgJ1EnLCAnSicsICdUJywgJzknLCAnOCcsICc3JywgJzYnLCAnNScsICc0JywgJzMnLCAnMiddO1xyXG5cdHByaXZhdGUgc2VsZWN0ZWRDb2RlczogU2V0PHN0cmluZz47XHJcblx0cHJpdmF0ZSBvblNlbGVjdGlvbkNoYW5nZTogKHNlbGVjdGVkQ29kZXM6IHN0cmluZ1tdLCBpZDogc3RyaW5nKSA9PiB2b2lkO1xyXG5cdHByaXZhdGUgaXNTZWxlY3Rpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRwcml2YXRlIGxhc3RTZWxlY3RlZFN0YXRlOiBib29sZWFuIHwgbnVsbCA9IG51bGw7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHNlbGVjdGVkQ29kZXM6IHN0cmluZ1tdID0gW10sIG9uU2VsZWN0aW9uQ2hhbmdlOiAoc2VsZWN0ZWRDb2Rlczogc3RyaW5nW10sIGlkOiBzdHJpbmcpID0+IHZvaWQpIHtcclxuXHRcdHRoaXMuaWQgPSBpZDtcclxuXHRcdHRoaXMuc2VsZWN0ZWRDb2RlcyA9IG5ldyBTZXQoc2VsZWN0ZWRDb2Rlcyk7XHJcblx0XHR0aGlzLm9uU2VsZWN0aW9uQ2hhbmdlID0gb25TZWxlY3Rpb25DaGFuZ2U7XHJcblx0fVxyXG5cclxuXHRyZW5kZXIoKTogSFRNTEVsZW1lbnQge1xyXG5cdFx0Y29uc3QgZ3JpZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0Z3JpZC5jbGFzc05hbWUgPSAncG9rZXItcmFuZ2UtZ3JpZCc7XHJcblx0XHRncmlkLnNldEF0dHJpYnV0ZSgnZGF0YS1ncmlkLWlkJywgdGhpcy5pZCk7XHJcblxyXG5cdFx0Ly8gQWRkIG1vdXNlIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZ3JpZFxyXG5cdFx0Z3JpZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoKSA9PiB0aGlzLmlzU2VsZWN0aW5nID0gdHJ1ZSk7XHJcblx0XHRncmlkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoKSA9PiB7XHJcblx0XHRcdHRoaXMuaXNTZWxlY3RpbmcgPSBmYWxzZTtcclxuXHRcdFx0dGhpcy5sYXN0U2VsZWN0ZWRTdGF0ZSA9IG51bGw7XHJcblx0XHR9KTtcclxuXHRcdGdyaWQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcclxuXHRcdFx0dGhpcy5pc1NlbGVjdGluZyA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLmxhc3RTZWxlY3RlZFN0YXRlID0gbnVsbDtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgMTM7IGkrKykge1xyXG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IDEzOyBqKyspIHtcclxuXHRcdFx0XHRjb25zdCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHRcdFx0Y2VsbC5jbGFzc05hbWUgPSAncG9rZXItcmFuZ2UtY2VsbCc7XHJcblx0XHRcdFx0Y2VsbC5zdHlsZS51c2VyU2VsZWN0ID0gJ25vbmUnO1xyXG5cdFx0XHRcdGxldCBjb250ZW50O1xyXG5cdFx0XHRcdGlmIChpIDwgaikge1xyXG5cdFx0XHRcdFx0Y29udGVudCA9IGAke3RoaXMudmFsdWVzW2ldfSR7dGhpcy52YWx1ZXNbal19c2A7XHJcblx0XHRcdFx0XHRjZWxsLmNsYXNzTGlzdC5hZGQoJ3Bva2VyLXJhbmdlLXN1aXRlZCcpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoaSA+IGopIHtcclxuXHRcdFx0XHRcdGNvbnRlbnQgPSBgJHt0aGlzLnZhbHVlc1tqXX0ke3RoaXMudmFsdWVzW2ldfW9gO1xyXG5cdFx0XHRcdFx0Y2VsbC5jbGFzc0xpc3QuYWRkKCdwb2tlci1yYW5nZS1vZmZzdWl0Jyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnRlbnQgPSBgJHt0aGlzLnZhbHVlc1tqXX0ke3RoaXMudmFsdWVzW2ldfWA7XHJcblx0XHRcdFx0XHRjZWxsLmNsYXNzTGlzdC5hZGQoJ3Bva2VyLXJhbmdlLXBhaXInKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2VsbC50ZXh0Q29udGVudCA9IGNvbnRlbnQ7XHJcblxyXG5cdFx0XHRcdGlmICh0aGlzLnNlbGVjdGVkQ29kZXMuaGFzKGNvbnRlbnQpKSB7XHJcblx0XHRcdFx0XHRjZWxsLmNsYXNzTGlzdC5hZGQoJ3Bva2VyLXJhbmdlLXNlbGVjdGVkJyk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBSZXBsYWNlIGNsaWNrIGV2ZW50IHdpdGggbW91c2Vkb3duIGFuZCBtb3VzZW92ZXJcclxuXHRcdFx0XHRjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLmhhbmRsZUNlbGxJbnRlcmFjdGlvbihjZWxsLCBjb250ZW50LCBlKSk7XHJcblx0XHRcdFx0Y2VsbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZSkgPT4gdGhpcy5oYW5kbGVDZWxsSW50ZXJhY3Rpb24oY2VsbCwgY29udGVudCwgZSkpO1xyXG5cclxuXHRcdFx0XHRncmlkLmFwcGVuZENoaWxkKGNlbGwpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGdyaWQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGhhbmRsZUNlbGxJbnRlcmFjdGlvbihjZWxsOiBIVE1MRWxlbWVudCwgY29udGVudDogc3RyaW5nLCBldmVudDogTW91c2VFdmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nIHx8IChldmVudC50eXBlID09PSAnbW91c2VvdmVyJyAmJiB0aGlzLmlzU2VsZWN0aW5nKSkge1xyXG5cdFx0XHRpZiAodGhpcy5sYXN0U2VsZWN0ZWRTdGF0ZSA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHRoaXMubGFzdFNlbGVjdGVkU3RhdGUgPSAhdGhpcy5zZWxlY3RlZENvZGVzLmhhcyhjb250ZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLnRvZ2dsZUNlbGwoY2VsbCwgY29udGVudCwgdGhpcy5sYXN0U2VsZWN0ZWRTdGF0ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHRvZ2dsZUNlbGwoY2VsbDogSFRNTEVsZW1lbnQsIGNvbnRlbnQ6IHN0cmluZywgZm9yY2VTdGF0ZT86IGJvb2xlYW4pIHtcclxuXHRcdGNvbnN0IG5ld1N0YXRlID0gZm9yY2VTdGF0ZSAhPT0gdW5kZWZpbmVkID8gZm9yY2VTdGF0ZSA6ICF0aGlzLnNlbGVjdGVkQ29kZXMuaGFzKGNvbnRlbnQpO1xyXG5cdFx0aWYgKG5ld1N0YXRlKSB7XHJcblx0XHRcdHRoaXMuc2VsZWN0ZWRDb2Rlcy5hZGQoY29udGVudCk7XHJcblx0XHRcdGNlbGwuY2xhc3NMaXN0LmFkZCgncG9rZXItcmFuZ2Utc2VsZWN0ZWQnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuc2VsZWN0ZWRDb2Rlcy5kZWxldGUoY29udGVudCk7XHJcblx0XHRcdGNlbGwuY2xhc3NMaXN0LnJlbW92ZSgncG9rZXItcmFuZ2Utc2VsZWN0ZWQnKTtcclxuXHRcdH1cclxuXHRcdHRoaXMub25TZWxlY3Rpb25DaGFuZ2UoQXJyYXkuZnJvbSh0aGlzLnNlbGVjdGVkQ29kZXMpLCB0aGlzLmlkKTtcclxuXHR9XHJcblxyXG5cdGdldFNlbGVjdGVkQ29kZXMoKTogc3RyaW5nW10ge1xyXG5cdFx0cmV0dXJuIEFycmF5LmZyb20odGhpcy5zZWxlY3RlZENvZGVzKTtcclxuXHR9XHJcblxyXG5cdHNldFNlbGVjdGVkQ29kZXMoY29kZXM6IHN0cmluZ1tdKSB7XHJcblx0XHR0aGlzLnNlbGVjdGVkQ29kZXMgPSBuZXcgU2V0KGNvZGVzKTtcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIFBva2VyUmFuZ2VTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcblx0cGx1Z2luOiBQb2tlclJhbmdlUGx1Z2luO1xyXG5cdGdyaWRDb250YWluZXI6IEhUTUxFbGVtZW50O1xyXG5cclxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBQb2tlclJhbmdlUGx1Z2luKSB7XHJcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XHJcblx0XHR0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuXHR9XHJcblxyXG5cdGRpc3BsYXkoKTogdm9pZCB7XHJcblx0XHRjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xyXG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcclxuXHJcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0LnNldE5hbWUoJ0RlZmF1bHQgUmFuZ2UnKVxyXG5cdFx0XHQuc2V0RGVzYygnU2V0IHRoZSBkZWZhdWx0IHBva2VyIHJhbmdlIChjb21tYS1zZXBhcmF0ZWQpJylcclxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdBS3MsUUpzJylcclxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFJhbmdlKVxyXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRSYW5nZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZUdyaWQoKTtcclxuXHRcdFx0XHR9KSk7XHJcblxyXG5cdFx0dGhpcy5ncmlkQ29udGFpbmVyID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KCdwb2tlci1yYW5nZS1ncmlkLWNvbnRhaW5lcicpO1xyXG5cdFx0dGhpcy51cGRhdGVHcmlkKCk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGVHcmlkKCkge1xyXG5cdFx0dGhpcy5ncmlkQ29udGFpbmVyLmVtcHR5KCk7XHJcblx0XHRjb25zdCBncmlkID0gdGhpcy5wbHVnaW4uZ3JpZC5yZW5kZXIoKTtcclxuXHRcdHRoaXMuZ3JpZENvbnRh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QU07QUFDcEMsYUFBSyxvQkFBb0IsQ0FBQyxLQUFLLGNBQWMsSUFBSSxPQUFPO0FBQUEsTUFDekQ7QUFDQSxXQUFLLFdBQVcsTUFBTSxTQUFTLEtBQUssaUJBQWlCO0FBQUEsSUFDdEQ7QUFBQSxFQUNEO0FBQUEsRUFFUSxXQUFXLE1BQW1CLFNBQWlCLFlBQXNCO0FBQzVFLFVBQU0sV0FBVyxlQUFlLFNBQVksYUFBYSxDQUFDLEtBQUssY0FBYyxJQUFJLE9BQU87QUFDeEYsUUFBSSxVQUFVO0FBQ2IsV0FBSyxjQUFjLElBQUksT0FBTztBQUM5QixXQUFLLFVBQVUsSUFBSSxzQkFBc0I7QUFBQSxJQUMxQyxPQUFPO0FBQ04sV0FBSyxjQUFjLE9BQU8sT0FBTztBQUNqQyxXQUFLLFVBQVUsT0FBTyxzQkFBc0I7QUFBQSxJQUM3QztBQUNBLFNBQUssa0JBQWtCLE1BQU0sS0FBSyxLQUFLLGFBQWEsR0FBRyxLQUFLLEVBQUU7QUFBQSxFQUMvRDtBQUFBLEVBRUEsbUJBQTZCO0FBQzVCLFdBQU8sTUFBTSxLQUFLLEtBQUssYUFBYTtBQUFBLEVBQ3JDO0FBQUEsRUFFQSxpQkFBaUIsT0FBaUI7QUFDakMsU0FBSyxnQkFBZ0IsSUFBSSxJQUFJLEtBQUs7QUFBQSxFQUNuQztBQUNEO0FBRUEsSUFBTSx1QkFBTixjQUFtQyxpQ0FBaUI7QUFBQSxFQUluRCxZQUFZLEtBQVUsUUFBMEI7QUFDL0MsVUFBTSxLQUFLLE1BQU07QUFDakIsU0FBSyxTQUFTO0FBQUEsRUFDZjtBQUFBLEVBRUEsVUFBZ0I7QUFDZixVQUFNLEVBQUUsWUFBWSxJQUFJO0FBQ3hCLGdCQUFZLE1BQU07QUFFbEIsUUFBSSx3QkFBUSxXQUFXLEVBQ3JCLFFBQVEsZUFBZSxFQUN2QixRQUFRLCtDQUErQyxFQUN2RCxRQUFRLFVBQVEsS0FDZixlQUFlLFNBQVMsRUFDeEIsU0FBUyxLQUFLLE9BQU8sU0FBUyxZQUFZLEVBQzFDLFNBQVMsT0FBTyxVQUFVO0FBQzFCLFdBQUssT0FBTyxTQUFTLGVBQWU7QUFDcEMsWUFBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQixXQUFLLFdBQVc7QUFBQSxJQUNqQixDQUFDLENBQUM7QUFFSixTQUFLLGdCQUFnQixZQUFZLFVBQVUsNEJBQTRCO0FBQ3ZFLFNBQUssV0FBVztBQUFBLEVBQ2pCO0FBQUEsRUFFQSxhQUFhO0FBQ1osU0FBSyxjQUFjLE1BQU07QUFDekIsVUFBTSxPQUFPLEtBQUssT0FBTyxLQUFLLE9BQU87QUFDckMsU0FBSyxjQUFjLFlBQVksSUFBSTtBQUFBLEVBQ3BDO0FBQ0Q7IiwKICAibmFtZXMiOiBbXQp9Cg==
