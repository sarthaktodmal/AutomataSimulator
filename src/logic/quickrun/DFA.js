export class QuickDFA {
    constructor(nodeMap, transitionMap, finalNodes) {
        this.nodeMap = nodeMap;
        this.transitionMap = transitionMap;
        this.finalNodes = finalNodes;
    }

    DeterminismChecker(){
        let alphabets = new Set()
    
        Object.entries(this.transitionMap).map(([key, transitions]) => {
            return transitions.map((transition) => (
                transition.label.split(',').forEach(element => {
                    alphabets.add(element)
                })
            ));
        })
    
        let nonDeterministicStates = []
    
        Object.entries(this.nodeMap).map(([id, node]) => {
            const transitionsOfNode = this.transitionMap[node.id];
            let allLabels = []
            if(transitionsOfNode){
                for(const trans of transitionsOfNode){
                    trans.label.split(',').map((symb)=>{
                        allLabels.push(symb)
                    })
                }
            }
            //Check node has all outgoing transition
            // for all alphbets
            alphabets.forEach((element)=>{
                if (!allLabels.includes(element)) {
                    nonDeterministicStates.push(node.id)
                }
            })
            //Check Node Does not have Multiple trans for same symbol
            if(new Set(allLabels).size !== allLabels.length){
                nonDeterministicStates.push(node.id)
            }
        })
        return new Set(nonDeterministicStates)
    }

    validateString(input) {
        let currentState = this.nodeMap['q0'];
        if (!currentState) return false;

        for (const symbol of input) {
            const transitions = this.transitionMap[currentState.id] || [];
            const nextTransition = transitions.find(t => t.label.includes(symbol));

            if (!nextTransition) return false;
            currentState = this.nodeMap[nextTransition.targetid];
        }

        return this.finalNodes.has(currentState.id);
    }
} 