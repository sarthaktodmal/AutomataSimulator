export class QuickMoore {
    constructor(nodeMap, transitionMap, stateOutput) {
        this.nodeMap = nodeMap;
        this.transitionMap = transitionMap;
        this.stateOutput = stateOutput;
    }

    validateString(input) {
        let currentState = this.nodeMap['q0'];
        if (!currentState) return null;

        let output = this.stateOutput[currentState.id] || '';

        for (const symbol of input) {
            const transitions = this.transitionMap[currentState.id] || [];
            const validTransition = transitions.find(t => t.label === symbol);

            if (!validTransition) return null;

            currentState = this.nodeMap[validTransition.targetid];
            output += this.stateOutput[currentState.id] || '';
        }

        return output;
    }
} 