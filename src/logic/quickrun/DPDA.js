export class QuickDPDA {
    constructor(nodeMap, transitionMap, finalNodes) {
        this.nodeMap = nodeMap;
        this.transitionMap = transitionMap;
        this.finalNodes = finalNodes;
    }

    parseTransition(transition) {
        const [input, pop, push] = transition.label.split(',');
        return { input, pop, push };
    }

    validateString(input) {
        let currentState = this.nodeMap['q0'];
        if (!currentState) return false;

        let stack = ['z₀'];
        let inputIndex = 0;

        while (inputIndex < input.length) {
            const currentSymbol = input[inputIndex];
            const topOfStack = stack[stack.length - 1];
            const transitions = this.transitionMap[currentState.id] || [];

            const validTransition = transitions.find(t => {
                const { input, pop } = this.parseTransition(t);
                return input === currentSymbol && pop === topOfStack;
            });

            if (!validTransition) return false;

            const { push } = this.parseTransition(validTransition);
            stack.pop();
            if (push !== 'ε') {
                stack.push(...push.split('').reverse());
            }

            currentState = this.nodeMap[validTransition.targetid];
            inputIndex++;
        }

        return this.finalNodes.has(currentState.id);
    }
} 