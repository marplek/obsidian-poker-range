import { App, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, Editor, MarkdownView } from 'obsidian';
import './styles.css';

interface PokerRangeSettings {
	defaultRange: string;
}

const DEFAULT_SETTINGS: PokerRangeSettings = {
	defaultRange: ''
}

export default class PokerRangePlugin extends Plugin {
	settings: PokerRangeSettings;
	grid: Grid;

	async onload() {
		await this.loadSettings();
		this.grid = new Grid('default', this.settings.defaultRange.split(','), (selectedCodes, id) => {
		});

		this.addSettingTab(new PokerRangeSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor('poker-range', (source, el, ctx) => {
			const lines = source.split('\n');
			let range = this.settings.defaultRange;
			let gridId = this.generateUniqueId();

			if (lines[0].startsWith('<!-- grid-id:')) {
				gridId = lines[0].match(/<!-- grid-id:\s*(.+?)\s*-->/)?.[1] || gridId;
				range = lines.slice(1).join(',').trim() || range;
			} else {
				range = source.trim() || range;
			}

			const grid = new Grid(gridId, range.split(','), (selectedCodes, id) => {
				this.updateCodeBlock(ctx, selectedCodes.join(','), id);
			});
			el.appendChild(grid.render());
		});

		this.addCommand({
			id: 'insert-range-table',
			name: 'Insert Range Table', 
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const cursor = editor.getCursor();
				const range = this.settings.defaultRange;
				const gridId = this.generateUniqueId();
				const content = `\`\`\`poker-range\n<!-- grid-id: ${gridId} -->\n${range}\n\`\`\`\n`;
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

	async updateCodeBlock(ctx: MarkdownPostProcessorContext, newRange: string, gridId: string) {
		const file = this.app.workspace.getActiveFile();
		if (!file) return;

		const content = await this.app.vault.read(file);
		const lines = content.split('\n');

		let inCodeBlock = false;
		let codeBlockStart = -1;
		let codeBlockEnd = -1;

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].trim().startsWith('```poker-range')) {
				inCodeBlock = true;
				codeBlockStart = i;
			} else if (inCodeBlock && lines[i].trim() === '```') {
				codeBlockEnd = i;
				const blockContent = lines.slice(codeBlockStart, codeBlockEnd + 1).join('\n');
				if (blockContent.includes(`<!-- grid-id: ${gridId} -->`)) {
					lines[codeBlockStart + 1] = `<!-- grid-id: ${gridId} -->`;
					lines[codeBlockStart + 2] = newRange;
					const updatedContent = lines.join('\n');
					await this.app.vault.modify(file, updatedContent);
					return;
				}
				inCodeBlock = false;
			}
		}

	}

	private generateUniqueId(): string {
		return `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}

class Grid {
	private id: string;
	private values = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
	private selectedCodes: Set<string>;
	private onSelectionChange: (selectedCodes: string[], id: string) => void;
	private isSelecting: boolean = false;
	private lastSelectedState: boolean | null = null;

	constructor(id: string, selectedCodes: string[] = [], onSelectionChange: (selectedCodes: string[], id: string) => void) {
		this.id = id;
		this.selectedCodes = new Set(selectedCodes);
		this.onSelectionChange = onSelectionChange;
	}

	render(): HTMLElement {
		const grid = document.createElement('div');
		grid.className = 'poker-range-grid';
		grid.setAttribute('data-grid-id', this.id);

		// Add mouse event listeners to the grid
		grid.addEventListener('mousedown', () => this.isSelecting = true);
		grid.addEventListener('mouseup', () => {
			this.isSelecting = false;
			this.lastSelectedState = null;
		});
		grid.addEventListener('mouseleave', () => {
			this.isSelecting = false;
			this.lastSelectedState = null;
		});

		for (let i = 0; i < 13; i++) {
			for (let j = 0; j < 13; j++) {
				const cell = document.createElement('div');
				cell.className = 'poker-range-cell';
				let content: string;
				if (i < j) {
					content = `${this.values[i]}${this.values[j]}s`;
					cell.classList.add('poker-range-suited');
				} else if (i > j) {
					content = `${this.values[j]}${this.values[i]}o`;
					cell.classList.add('poker-range-offsuit');
				} else {
					content = `${this.values[j]}${this.values[i]}`;
					cell.classList.add('poker-range-pair');
				}
				cell.textContent = content;

				if (this.selectedCodes.has(content)) {
					cell.classList.add('poker-range-selected');
				}

				// Replace click event with mousedown and mouseover
				cell.addEventListener('mousedown', (e) => this.handleCellInteraction(cell, content, e));
				cell.addEventListener('mouseover', (e) => this.handleCellInteraction(cell, content, e));

				grid.appendChild(cell);
			}
		}

		return grid;
	}

	private handleCellInteraction(cell: HTMLElement, content: string, event: MouseEvent) {
		if (event.type === 'mousedown' || (event.type === 'mouseover' && this.isSelecting)) {
			if (this.lastSelectedState === null) {
				this.lastSelectedState = !this.selectedCodes.has(content);
			}
			this.toggleCell(cell, content, this.lastSelectedState);
		}
	}

	private toggleCell(cell: HTMLElement, content: string, forceState?: boolean) {
		const newState = forceState !== undefined ? forceState : !this.selectedCodes.has(content);
		if (newState) {
			this.selectedCodes.add(content);
			cell.classList.add('poker-range-selected');
		} else {
			this.selectedCodes.delete(content);
			cell.classList.remove('poker-range-selected');
		}
		this.onSelectionChange(Array.from(this.selectedCodes), this.id);
	}

	getSelectedCodes(): string[] {
		return Array.from(this.selectedCodes);
	}

	setSelectedCodes(codes: string[]) {
		this.selectedCodes = new Set(codes);
	}
}

class PokerRangeSettingTab extends PluginSettingTab {
	plugin: PokerRangePlugin;
	gridContainer: HTMLElement;

	constructor(app: App, plugin: PokerRangePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Default Range')
			.setDesc('Set the default poker range (comma-separated)')
			.addText(text => text
				.setPlaceholder('AKs,QJs')
				.setValue(this.plugin.settings.defaultRange)
				.onChange(async (value) => {
					this.plugin.settings.defaultRange = value;
					await this.plugin.saveSettings();
					this.updateGrid();
				}));

		this.gridContainer = containerEl.createDiv('poker-range-grid-container');
		this.updateGrid();
	}

	updateGrid() {
		this.gridContainer.empty();
		const grid = this.plugin.grid.render();
		this.gridContainer.appendChild(grid);
	}
}