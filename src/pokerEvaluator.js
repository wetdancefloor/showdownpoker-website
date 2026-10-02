// --- Poker Evaluation Logic ---

function getRankValue(rankStr) {
    const ranks = {
        "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
        "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14
    };
    return ranks[rankStr] || 0;
}

function isStraight(hand) {
    const sortedRanks = hand.map(card => getRankValue(card.rank)).sort((a, b) => a - b);
    const uniqueRanks = [...new Set(sortedRanks)];

    if (uniqueRanks.length !== 5) {
        return false;
    }

    let isSeq = true;
    for (let i = 0; i < 4; ++i) {
        if (uniqueRanks[i + 1] !== uniqueRanks[i] + 1) {
            isSeq = false;
            break;
        }
    }
    if (isSeq) return true;

    // Ace-low straight check (A-2-3-4-5)
    if (uniqueRanks[0] === 2 &&
        uniqueRanks[1] === 3 &&
        uniqueRanks[2] === 4 &&
        uniqueRanks[3] === 5 &&
        uniqueRanks[4] === 14) {
        return true;
    }

    return false;
}

function isFlush(hand) {
    if (hand.length === 0) return false;
    const firstSuit = hand[0].suit;
    return hand.every(card => card.suit === firstSuit);
}

function countRanks(hand) {
    const rankCounts = {};
    for (const card of hand) {
        rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }
    return rankCounts;
}

function getHighCard(hand) {
    let highCard = 0;
    for (const card of hand) {
        const rankValue = getRankValue(card.rank);
        if (rankValue > highCard) {
            highCard = rankValue;
        }
    }
    return highCard;
}

function checkHand(hand) {
    const isHandFlush = isFlush(hand);
    const isHandStraight = isStraight(hand);
    const rankCounts = countRanks(hand);
    const highCard = getHighCard(hand);

    let hasFour = false;
    let hasThree = false;
    let numPairs = 0;

    for (const rank in rankCounts) {
        const count = rankCounts[rank];
        if (count === 4) hasFour = true;
        if (count === 3) hasThree = true;
        if (count === 2) numPairs++;
    }

    if (isHandStraight && isHandFlush) {
        if (highCard === 14) {
            return { category: 9, name: "Royal Flush", tiebreakers: [14], hand };
        } else {
            return { category: 8, name: "Straight Flush", tiebreakers: [highCard], hand };
        }
    } else if (hasFour) {
        return { category: 7, name: "Four of a Kind", tiebreakers: [highCard], hand };
    } else if (hasThree && numPairs === 1) {
        return { category: 6, name: "Full House", tiebreakers: [highCard], hand };
    } else if (isHandFlush) {
        return { category: 5, name: "Flush", tiebreakers: [highCard], hand };
    } else if (isHandStraight) {
        return { category: 4, name: "Straight", tiebreakers: [highCard], hand };
    } else if (hasThree) {
        return { category: 3, name: "Three of a Kind", tiebreakers: [highCard], hand };
    } else if (numPairs === 2) {
        return { category: 2, name: "Two Pairs", tiebreakers: [highCard], hand };
    } else if (numPairs === 1) {
        return { category: 1, name: "Pair", tiebreakers: [highCard], hand };
    } else {
        return { category: 0, name: "High Card", tiebreakers: [highCard], hand };
    }
}

function compareHands(a, b) {
    if (!b) return true;
    if (a.category !== b.category) {
        return a.category > b.category;
    }
    for (let i = 0; i < a.tiebreakers.length && i < b.tiebreakers.length; ++i) {
        if (a.tiebreakers[i] !== b.tiebreakers[i]) {
            return a.tiebreakers[i] > b.tiebreakers[i];
        }
    }
    return false;
}

function combinations(list, k) {
    const result = [];
    function generate(start, current) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        for (let i = start; i < list.length; ++i) {
            current.push(list[i]);
            generate(i + 1, current);
            current.pop();
        }
    }
    generate(0, []);
    return result;
}

export function evaluatePokerHand(playerCards, communityCards) {
    const allCards = [...playerCards, ...communityCards];

    if (allCards.length < 5) {
        return null; 
    }

    const allCombinations = combinations(allCards, 5);
    let bestScore = null;

    for (const hand of allCombinations) {
        const currentScore = checkHand(hand);
        if (compareHands(currentScore, bestScore)) {
            bestScore = currentScore;
        }
    }

    return bestScore;
}