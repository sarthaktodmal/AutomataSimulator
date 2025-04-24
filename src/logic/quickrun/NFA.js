export class QuickNFA {
    constructor(nodeMap, transitionMap, finalNodes) {
        this.nodeMap = nodeMap;
        this.transitionMap = transitionMap;
        this.finalNodes = finalNodes;
    }

    computeEpsilonClosure(states) {
        const closure = new Set(states);
        const stack = [...states];

        while (stack.length > 0) {
            const state = stack.pop();
            const transitions = this.transitionMap[state.id] || [];

            transitions.forEach(transition => {
                if (transition.label.includes('ε')) {
                    const nextState = this.nodeMap[transition.targetid];
                    if (!closure.has(nextState)) {
                        closure.add(nextState);
                        stack.push(nextState);
                    }
                }
            });
        }

        return Array.from(closure);
    }

    validateString(input) {
        let currentStates = this.computeEpsilonClosure([this.nodeMap['q0']]);
        if (!currentStates.length) return false;

        for (const symbol of input) {
            let nextStates = new Set();

            currentStates.forEach(state => {
                const transitions = this.transitionMap[state.id] || [];
                transitions.forEach(transition => {
                    if (transition.label.includes(symbol)) {
                        nextStates.add(this.nodeMap[transition.targetid]);
                    }
                });
            });

            if (nextStates.size === 0) return false;
            currentStates = this.computeEpsilonClosure(Array.from(nextStates));
        }

        return currentStates.some(state => this.finalNodes.has(state.id));
    }
} 