
export interface PokerRange {
    [hand: string]: boolean;
}

export const parseRange = (rangeString: string): PokerRange => {
    const range: PokerRange = {};
    const hands = rangeString.split(",");
    hands.forEach(hand => {
        range[hand.trim()] = true;
    });
    return range;
};