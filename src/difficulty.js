// Active play time only; both routes reach the same bounded threat tier.
export function difficultyFor(seconds, score) {
 const tier = Math.min(6, Math.max(0, Math.floor(seconds / 45), Math.floor(score / 15)));
 return { tier, enemies:7+tier*2, speed:1+tier*0.06, chaseRange:45+tier*5 };
}
