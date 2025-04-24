import { QuickDFA } from './quickrun/DFA';
import { QuickNFA } from './quickrun/NFA';
import { QuickDPDA } from './quickrun/DPDA';
import { QuickNPDA } from './quickrun/NPDA';
import { QuickTM } from './quickrun/TM';
import { QuickMealy } from './quickrun/Mealy';
import { QuickMoore } from './quickrun/Moore';


export const QuickValidator = {
    async validateDFA(nodeMap, transitionMap, validStrings, invalidStrings, finalNodes) {
        const dfa = new QuickDFA(nodeMap, transitionMap, finalNodes);
        const errors = [];

        //Check if DFA is deterministic
        const nonDet = [...dfa.DeterminismChecker()];
        if (nonDet.length != 0) {
            errors.push(`Please Fix Non-Deterministic States: ${nonDet.join(', ')}`)
            return { errors };
        }

        for (const str of validStrings) {
            if (!dfa.validateString(str)) {
                errors.push(`Valid string "${str}" was rejected`);
            }
        }

        for (const str of invalidStrings) {
            if (dfa.validateString(str)) {
                errors.push(`Invalid string "${str}" was accepted`);
            }
        }

        return { errors };
    },

    async validateNFA(nodeMap, transitionMap, validStrings, invalidStrings, finalNodes) {
        const nfa = new QuickNFA(nodeMap, transitionMap, finalNodes);
        const errors = [];

        for (const str of validStrings) {
            if (!nfa.validateString(str)) {
                errors.push(`Valid string "${str}" was rejected`);
            }
        }

        for (const str of invalidStrings) {
            if (nfa.validateString(str)) {
                errors.push(`Invalid string "${str}" was accepted`);
            }
        }

        return { errors };
    },

    async validateDPDA(nodeMap, transitionMap, validStrings, invalidStrings, finalNodes) {
        const dpda = new QuickDPDA(nodeMap, transitionMap, finalNodes);
        const errors = [];

        for (const str of validStrings) {
            if (!dpda.validateString(str)) {
                errors.push(`Valid string "${str}" was rejected`);
            }
        }

        for (const str of invalidStrings) {
            if (dpda.validateString(str)) {
                errors.push(`Invalid string "${str}" was accepted`);
            }
        }

        return { errors };
    },

    async validateNPDA(nodeMap, transitionMap, validStrings, invalidStrings, finalNodes) {
        const npda = new QuickNPDA(nodeMap, transitionMap, finalNodes);
        const errors = [];

        for (const str of validStrings) {
            if (!npda.validateString(str)) {
                errors.push(`Valid string "${str}" was rejected`);
            }
        }

        for (const str of invalidStrings) {
            if (npda.validateString(str)) {
                errors.push(`Invalid string "${str}" was accepted`);
            }
        }

        return { errors };
    },

    async validateTM(nodeMap, transitionMap, validStrings, invalidStrings, finalNodes) {
        const tm = new QuickTM(nodeMap, transitionMap, finalNodes);
        const errors = [];

        for (const str of validStrings) {
            if (!tm.validateString(str)) {
                errors.push(`Valid string "${str}" was rejected`);
            }
        }

        for (const str of invalidStrings) {
            if (tm.validateString(str)) {
                errors.push(`Invalid string "${str}" was accepted`);
            }
        }

        return { errors };
    },

    async validateMealy(nodeMap, transitionMap, validStrings, invalidStrings) {
        const mealy = new QuickMealy(nodeMap, transitionMap);
        const errors = [];

        //Check if Mealy is deterministic
        const nonDet = [...mealy.DeterminismChecker()];
        if (nonDet.length != 0) {
            errors.push(`Please Fix Non-Deterministic States: ${nonDet.join(', ')}`)
            return { errors };
        }

        for (const str of validStrings) {
            const output = mealy.validateString(str);
            if (output === false) {
                errors.push(`Valid string "${str}" was rejected`);
            }
        }

        for (const str of invalidStrings) {
            const output = mealy.validateString(str);
            if (output === true) {
                errors.push(`Invalid string "${str}" was accepted`);
            }
        }

        return { errors };
    },

    async validateMoore(nodeMap, transitionMap, validStrings, invalidStrings, stateOutput) {
        const moore = new QuickMoore(nodeMap, transitionMap, stateOutput);
        const errors = [];

        for (const str of validStrings) {
            const output = moore.validateString(str);
            if (output === null) {
                errors.push(`Valid string "${str}" was rejected`);
            }
        }

        for (const str of invalidStrings) {
            const output = moore.validateString(str);
            if (output !== null) {
                errors.push(`Invalid string "${str}" was accepted`);
            }
        }

        return { errors };
    }
}; 