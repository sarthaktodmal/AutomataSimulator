export class QuickMealy {
    constructor(nodeMap, transitionMap) {
        this.nodeMap = nodeMap;
        this.transitionMap = transitionMap;
    }

    parseTransition(transition) {
        const [input, output] = transition.label.split('/');
        return { input, output };
    }

    validateString(inputx) {
        const [input, outputexp] = inputx.split('/');
        let currentState = this.nodeMap['q0'];
        if (!currentState) return null;

        let output = '';

        for (const symbol of input) {
            const transitions = this.transitionMap[currentState.id] || [];
            let outputchar = ''
            const validTransition = transitions.find(t => {
                return t.label.split(',').some((ahh) => {
                    const [input, output] = ahh.split('/')
                    if (input === symbol) {
                        outputchar = output
                        return true
                    }
                })
            })

            if (!validTransition) return null;

            output += outputchar;
            currentState = this.nodeMap[validTransition.targetid];
        }

        return output === outputexp;
    }
    DeterminismChecker() {
        let alphabets = new Set()

        Object.entries(this.transitionMap).map(([key, transitions]) => {
            return transitions.map((transition) => (
                transition.label.split(',').forEach(element => {
                    const [symbol,] = element.split('/')
                    alphabets.add(symbol)
                })
            ));
        })

        let nonDeterministicStates = []

        Object.entries(this.nodeMap).map(([id, node]) => {
            const transitionsOfNode = this.transitionMap[node.id];
            let allLabels = []
            if (transitionsOfNode) {
                for (const trans of transitionsOfNode) {
                    trans.label.split(',').map((symb) => {
                        const [symbol,] = symb.split('/')
                        allLabels.push(symbol)
                    })
                }
            }
            //Check node has all outgoing transition
            // for all alphbets
            alphabets.forEach((element) => {
                if (!allLabels.includes(element)) {
                    nonDeterministicStates.push(node.id)
                }
            })
            //Check Node Does not have Multiple trans for same symbol
            if (new Set(allLabels).size !== allLabels.length) {
                nonDeterministicStates.push(node.id)
            }
        })
        return new Set(nonDeterministicStates)
    }
} 