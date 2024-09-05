import { PokerRange } from "./PokerRange";

export class PokerRangeRenderer {
    constructor(private range: PokerRange) { }

    getElement(): HTMLElement {
        const table = document.createElement("table");
        table.className = "poker-range-table";

        for (const hand in this.range) {
            if (this.range[hand]) {
                const cell = document.createElement("td");
                cell.textContent = hand;
                table.appendChild(cell);
            }
        }

        return table;
    }
}