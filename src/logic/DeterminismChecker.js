
export function DeterminismChecker4DFA(nodeMap,transitionMap){
    let alphabets = new Set()

    Object.entries(transitionMap).map(([key, transitions]) => {
        return transitions.map((transition) => (
            transition.label.split(',').forEach(element => {
                alphabets.add(element)
            })
        ));
    })

    let nonDeterministicStates = []

    Object.entries(nodeMap).map(([id, node]) => {
        const transitionsOfNode = transitionMap[node.id];
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

export function DeterminismChecker4Mealy(nodeMap,transitionMap){
    let alphabets = new Set()

    Object.entries(transitionMap).map(([key, transitions]) => {
        return transitions.map((transition) => (
            transition.label.split(',').forEach(element => {
                const [symbol,] = element.split('/')
                alphabets.add(symbol)
            })
        ));
    })

    let nonDeterministicStates = []

    Object.entries(nodeMap).map(([id, node]) => {
        const transitionsOfNode = transitionMap[node.id];
        let allLabels = []
        if(transitionsOfNode){
            for(const trans of transitionsOfNode){
                trans.label.split(',').map((symb)=>{
                    const [symbol,] = symb.split('/')
                    allLabels.push(symbol)
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