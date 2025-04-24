export class QuickNPDA {
    constructor(nodeMap, transitionMap, finalNodes) {
        this.nodeMap = nodeMap;
        this.transitionMap = transitionMap;
        this.finalNodes = finalNodes;
    }

    parseTransition(transition) {
        const [input, pop, push] = transition.label.split(',');
        return { input, pop, push };
    }

    computeEpsilonClosure(states) {
        const closure = new Set(states);
        const stack = [...states];

        while (stack.length > 0) {
            const { state, stack: currentStack } = stack.pop();
            const transitions = this.transitionMap[state.id] || [];

            transitions.forEach(transition => {
                const { input, pop, push } = this.parseTransition(transition);
                if (input === 'ε' && pop === currentStack[currentStack.length - 1]) {
                    const newStack = [...currentStack];
                    newStack.pop();
                    if (push !== 'ε') {
                        newStack.push(...push.split('').reverse());
                    }

                    const nextState = this.nodeMap[transition.targetid];
                    const newState = { state: nextState, stack: newStack };

                    if (!Array.from(closure).some(s =>
                        s.state.id === nextState.id &&
                        JSON.stringify(s.stack) === JSON.stringify(newStack)
                    )) {
                        closure.add(newState);
                        stack.push(newState);
                    }
                }
            });
        }

        return Array.from(closure);
    }

    validateString(input) {
        let currentStates = this.computeEpsilonClosure([{
            state: this.nodeMap['q0'],
            stack: ['z₀']
        }]);
        if (!currentStates.length) return false;

        for (const symbol of input) {
            let nextStates = new Set();

            currentStates.forEach(({ state, stack }) => {
                const transitions = this.transitionMap[state.id] || [];
                transitions.forEach(transition => {
                    const { input: transInput, pop, push } = this.parseTransition(transition);
                    if (transInput === symbol && pop === stack[stack.length - 1]) {
                        const newStack = [...stack];
                        newStack.pop();
                        if (push !== 'ε') {
                            newStack.push(...push.split('').reverse());
                        }
                        nextStates.add({
                            state: this.nodeMap[transition.targetid],
                            stack: newStack
                        });
                    }
                });
            });

            if (nextStates.size === 0) return false;
            currentStates = this.computeEpsilonClosure(Array.from(nextStates));
        }

        return currentStates.some(({ state, stack }) =>
            this.finalNodes.has(state.id)
        );
    }
} 