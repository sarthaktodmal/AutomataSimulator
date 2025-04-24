export class QuickTM {
    constructor(nodeMap, transitionMap, finalNodes) {
        this.nodeMap = nodeMap;
        this.transitionMap = transitionMap;
        this.finalNodes = finalNodes;
    }

    parseTransition(transition) {
        const [read, write, move] = transition.label.split(',');
        return { read, write, move };
    }

    validateString(input) {
        let currentState = this.nodeMap['q0'];
        if (!currentState) return false;

        let tape = ['B', ...input.split(''), 'B'];
        let headPosition = 1;

        while (true) {
            const currentSymbol = tape[headPosition];
            const transitions = this.transitionMap[currentState.id] || [];

            const validTransition = transitions.find(t => {
                const { read } = this.parseTransition(t);
                return read === currentSymbol;
            });

            if (!validTransition) return false;

            const { write, move } = this.parseTransition(validTransition);
            tape[headPosition] = write;

            if (move === 'L') {
                headPosition--;
                if (headPosition < 0) {
                    tape.unshift('B');
                    headPosition = 0;
                }
            } else if (move === 'R') {
                headPosition++;
                if (headPosition >= tape.length) {
                    tape.push('B');
                }
            }

            currentState = this.nodeMap[validTransition.targetid];
            if (this.finalNodes.has(currentState.id)) {
                return true;
            }
        }
    }
} 