import {Assessment, KeyCapture, KeyEvent} from "./model";
import {KeyDef, Percent, RatedKeyDef} from "../../common/key-model";
import {Timestamper} from "../../common/timing";

export const PERFECT: Percent = 100;
export const AssessmentConst = {
    PERFECT_KEY_RATE_DEFAULT: 5, // equals a score of 100% for keys per sec (default)
    HISTORY_SIZE_MAX: 200, // how much history to retain
    PROMPT_SIZE: 5, // how many chars are in the prompt. Smaller is better for responsive key range setting.
    MOVING_AVERAGE_WINDOW: 4, // size of moving average window for displaying score
    INTERVAL_RANGE_FACTOR: 10, // 10 times slower than perfect is 0% (unless limit is activated)
    KEY_RANGE_GAIN_QUOTIENT: 6, // 1/x proportion of the difference will be compensated (default)
    KEY_RANGE_DELTA_POSITIVE_MIN: 2, // will vary by at least this percent for every positive adjustment
    KEY_RANGE_DELTA_NEGATIVE_MIN: 1, // will vary by at least this percent for every negative adjustment
    STEADY_ACCURACY: .9 * PERFECT, // the accuracy that is deemed desirable, assuming it can be imperfect
    STEADY_SPEED: .7 * PERFECT, // the speed that is deemed desirable
}

const INTERVAL_PERFECT = 1000 / AssessmentConst.PERFECT_KEY_RATE_DEFAULT;
const INTERVAL_0 = AssessmentConst.INTERVAL_RANGE_FACTOR * INTERVAL_PERFECT;
const INTERVAL_RANGE = INTERVAL_0 - INTERVAL_PERFECT;

/** Assess the given key capture/prompt/interval */
export function assess(prompt: RatedKeyDef, intervalMillis: number, keyCapture: KeyCapture): Assessment {
    const accuracy = isKeyDefMatch(prompt, keyCapture) ? PERFECT : 0;
    const difficulty = prompt.normDifficulty;
    const speed = calcSpeedSingle(intervalMillis);
    const overall = average([accuracy, difficulty, speed]);
    return {
        assessedAt: Timestamper(),
        speed,
        accuracy,
        difficulty,
        overall,
    };
}

export function calcMovingAverage(history: KeyEvent[]): Assessment {
    let count = 0;
    let difficulty = 0;
    let speed = 0;
    let accuracy = 0;
    let assessedAt = 0;
    for (let ix = history.length - 1; ix >= 0; ix--) {
        const keyEvent = history[ix];
        if (keyEvent.assessment) {
            count++;
            assessedAt = keyEvent.assessment.assessedAt;
            difficulty += keyEvent.assessment.difficulty;
            speed += keyEvent.assessment.speed;
            accuracy += keyEvent.assessment.accuracy;
            
            if (count === AssessmentConst.MOVING_AVERAGE_WINDOW) break;
        }
    }
    
    if (count === 0) throw new Error('Cannot summarize because no assessments');
    
    const overall = (speed + accuracy + difficulty) / 3;
    
    return {
        assessedAt,
        difficulty: difficulty / count,
        speed: speed / count,
        accuracy: accuracy / count,
        overall: overall / count,
    };
}

export function isKeyDefMatch(l: KeyDef, r: KeyDef) {
    return l.char === r.char
        && l.shift === r.shift
        && l.control === r.control
        && l.alt === r.alt;
}

function average(values: number[]) {
    const sum = values.reduce((soFar, next) => soFar + next);
    return sum / values.length;
}

function calcSpeedSingle(intervalMillis: number) {
    let normDuration = (intervalMillis - INTERVAL_PERFECT) * PERFECT / INTERVAL_RANGE;
    normDuration = Math.max(0, normDuration);
    normDuration = Math.min(PERFECT, normDuration);
    return PERFECT - normDuration;
}
