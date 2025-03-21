export function computeEpsilonClosure(states,transitionMap,setCurrEpsilonTrans,getNodeById) {
    const closure = [...states]; // Start with the current states
    let added = true;
    while (added) {
        added = false;
        const newStates = [];
        let epsclose = []
        for (const state of closure) {
            const { node: mcurrNode, stack: mystack } = state;
            const transitions = transitionMap[mcurrNode.id];
            if (!transitions) continue;

            // Look only for epsilon transitions: input symbol must be 'ε'
            const epsilonTransitions = transitions.filter(t => {
                // Check if any operation qualifies as an epsilon move with the correct stack top.
                return t.label.split(" | ").some(operation => {
                    const [leftSide, _toPush] = operation.split('/');
                    const [inputSymbol, stackTop] = leftSide.split(',');
                    return inputSymbol === 'ε' && stackTop === mystack[mystack.length - 1];
                });
            });
            //process each epsilon transition
            for (const transition of epsilonTransitions) {
                const labels = transition.label.split(' | ');
                let newStack = [...mystack];
                let valid = false;
                // For epsilon,process each operation sequentially.
                for (const label of labels) {
                    const [leftSide, toPush] = label.split('/');
                    const [inputSymbol, stackTop] = leftSide.split(',');
                    if (inputSymbol === 'ε' && stackTop === newStack[newStack.length - 1]) {
                        valid = true;
                        newStack.pop(); //Pop the top of the stack
                        if (toPush !== 'ε') {
                            toPush.split(',').reverse().forEach(symbol => newStack.push(symbol));
                        }
                    }
                }
                if (valid) {
                    const newState = { node: getNodeById(transition.targetid), stack: newStack };
                    // Check if newState is already in the closure (based on node id and stack content)
                    const exists = closure.some(s => s.node.id === newState.node.id && 
                                                    s.stack.join(',') === newState.stack.join(','));
                    if (!exists) {
                        newStates.push(newState);
                        epsclose.push(transition)
                    }
                }
            }
        }
        if (newStates.length > 0) {
            closure.push(...newStates);
            setCurrEpsilonTrans(epsclose)
            added = true;
        }
    }
    return closure;
}

export async function NPDA(
    initialNodes, setIsRunning, setCurrNode, inputString,
    transitionMap, setStackContents, sleep, highlightTransitions, getNodeById,
    setStepIndex, finalNodes, setAcceptanceResult,setCurrEpsilonTrans,setShowQuestion
) {
    setIsRunning(true);
    let currentStates = [{ node: initialNodes, stack: ['z₀'] }];
    setCurrNode([initialNodes]);
    setStackContents([{ node: initialNodes.id, stack: ['z₀'] }]);

    // Initially, compute epsilon closure on the starting state
    currentStates = computeEpsilonClosure(currentStates,transitionMap,setCurrEpsilonTrans,getNodeById);
    setCurrNode(currentStates.map(state => state.node));
    setStackContents(currentStates.map(state => ({ node: state.node.id, stack: [...state.stack] })));

    const inputLength = inputString.length;
    setStepIndex(0);

    // Process each input character
    for (let stepIndex = 0; stepIndex < inputLength; stepIndex++) {
        const char = inputString[stepIndex];
        let nextStates = [];
        const highlightedTransitions = [];

        // Process transitions that consume the current character.
        for (const state of currentStates) {
            const { node: mcurrNode, stack: mystack } = state;
            const transitions = transitionMap[mcurrNode.id];
            if (!transitions) continue;

            // Get valid transitions for the current character
            const validTransitions = transitions.filter((t) => {
                return t.label.split(" | ").some(operation => {
                    const [leftSide, _toPush] = operation.split('/');
                    const [inputSymbol, stackTop] = leftSide.split(',');
                    return inputSymbol === char && stackTop === mystack[mystack.length - 1];
                });
            });

            // Process each valid transition
            for (const transition of validTransitions) {
                const labels = transition.label.split(' | ');
                // Process each operation (label) separately.
                for (const label of labels) {
                    let newStack = [...mystack];
                    const [leftSide, toPush] = label.split('/');
                    const [inputSymbol, stackTop] = leftSide.split(',');
                    //check match
                    if (inputSymbol === char && stackTop === newStack[newStack.length - 1]) {
                        newStack.pop();
                        if (toPush !== 'ε') {
                            toPush.split(',').reverse().forEach(symbol => newStack.push(symbol));
                        }
                        // Create a new state for this valid operation.
                        const newState = { node: getNodeById(transition.targetid), stack: newStack };
                        nextStates.push(newState);
                        highlightedTransitions.push(transition);
                    }
                }
            }
        }
        setStepIndex(stepIndex);
        // If no states are reachable, reject immediately.
        if (nextStates.length === 0) {
            setShowQuestion(true)
            setAcceptanceResult("String Rejected: No transition found for '" + char + "' from any current states");
            setIsRunning(false);
            return;
        }
        // Update visualization and states.
        currentStates = nextStates;
        await sleep(500); // Simulate delay for visualization
        setCurrNode([]);
        setCurrEpsilonTrans([])
        highlightTransitions(highlightedTransitions);
        await sleep(500); // Simulate delay for visualization
        setCurrNode(currentStates.map(state => state.node));
        setStackContents(currentStates.map(state => ({ node: state.node.id, stack: [...state.stack] })));
        nextStates = computeEpsilonClosure(nextStates,transitionMap,setCurrEpsilonTrans,getNodeById);
    }

    // Final epsilon closure after processing all input.
    currentStates = computeEpsilonClosure(currentStates,transitionMap,setCurrEpsilonTrans,getNodeById);
    setCurrNode(currentStates.map(state => state.node));
    setStackContents(currentStates.map(state => ({ node: state.node.id, stack: [...state.stack] })));

    // Check acceptance conditions after processing all characters
    let acceptedByFinalStateAndEmptyStack = false;
    let acceptedByFinalState = false;
    let acceptedByEmptyStack = false;

    for (const state of currentStates) {
        const { node: mcurrNode, stack: mystack } = state;
        if (finalNodes.has(mcurrNode.id) && mystack.length === 1 && mystack[0] === 'z₀') {
            acceptedByFinalStateAndEmptyStack = true;
        } else if (finalNodes.has(mcurrNode.id)) {
            acceptedByFinalState = true;
        } else if (mystack.length === 1 && mystack[0] === 'z₀') {
            acceptedByEmptyStack = true;
        }
    }

    if (acceptedByFinalStateAndEmptyStack) {
        setAcceptanceResult("String accepted by Final State & Empty Stack");
    } else if (acceptedByFinalState) {
        setAcceptanceResult("String accepted by Final State");
    } else if (acceptedByEmptyStack) {
        setAcceptanceResult("String accepted by Empty Stack");
    } else {
        setAcceptanceResult("String Rejected");
    }

    setIsRunning(false);
}


export async function NPDAStep(
    currentStatesNPDA,
    setCurrentStatesNPDA,
    inputString,
    stepIndex,
    transitionMap,
    setCurrNode,
    setStackContents,
    setStepIndex,
    setAcceptanceResult,
    setCurrEpsilonTrans,
    highlightTransitions,
    setIsRunningStepWise,
    getNodeById,
    finalNodes,
    sleep,
    setShowQuestion,
    setIsStepCompleted
) {
    let currentStates = currentStatesNPDA
    setIsStepCompleted(false)
    setCurrEpsilonTrans([])
    // Get the next character to process.
    const char = inputString[stepIndex];
    let nextStates = [];
    const highlightedTransitions = [];

    // If all characters in the input string have been processed, compute final acceptance.
    if (stepIndex >= inputString.length) {
        // Compute epsilon closure after processing all characters.
        currentStates = computeEpsilonClosure(currentStates,transitionMap,setCurrEpsilonTrans,getNodeById);
        setCurrNode(currentStates.map(state => state.node));
        setStackContents(currentStates.map(state => ({ node: state.node.id, stack: [...state.stack] })));

        // Check acceptance conditions.
        let acceptedByFinalStateAndEmptyStack = false;
        let acceptedByFinalState = false;
        let acceptedByEmptyStack = false;

        for (const state of currentStates) {
            const { node: mcurrNode, stack: mystack } = state;
            if (finalNodes.has(mcurrNode.id) && mystack.length === 1 && mystack[0] === 'z₀') {
                acceptedByFinalStateAndEmptyStack = true;
            } else if (finalNodes.has(mcurrNode.id)) {
                acceptedByFinalState = true;
            } else if (mystack.length === 1 && mystack[0] === 'z₀') {
                acceptedByEmptyStack = true;
            }
        }

        if (acceptedByFinalStateAndEmptyStack) {
            setAcceptanceResult("String accepted by Final State & Empty Stack");
        } else if (acceptedByFinalState) {
            setAcceptanceResult("String accepted by Final State");
        } else if (acceptedByEmptyStack) {
            setAcceptanceResult("String accepted by Empty Stack");
        } else {
            setAcceptanceResult("String Rejected");
        }
        setIsRunningStepWise(false)
        setCurrentStatesNPDA(currentStates)
        setIsStepCompleted(true)
        return;
    }

    // Process transitions that consume the current character.
    for (const state of currentStates) {
        const { node: mcurrNode, stack: mystack } = state;
        const transitions = transitionMap[mcurrNode.id];
        if (!transitions) continue;

        // Get valid transitions for the current character.
        const validTransitions = transitions.filter((t) => {
            return t.label.split(" | ").some(operation => {
                const [leftSide, _toPush] = operation.split('/');
                const [inputSymbol, stackTop] = leftSide.split(',');
                return inputSymbol === char && stackTop === mystack[mystack.length - 1];
            });
        });
        // Process each valid transition.
        for (const transition of validTransitions) {
            const labels = transition.label.split(' | ');
            // Process each operation (label) separately.
            for (const label of labels) {
                let newStack = [...mystack];
                const [leftSide, toPush] = label.split('/');
                const [inputSymbol, stackTop] = leftSide.split(',');
                // Check match.
                if (inputSymbol === char && stackTop === newStack[newStack.length - 1]) {
                    newStack.pop();
                    if (toPush !== 'ε') {
                        toPush.split(',').reverse().forEach(symbol => newStack.push(symbol));
                    }
                    // Create a new state for this valid operation.
                    const newState = { node: getNodeById(transition.targetid), stack: newStack };
                    nextStates.push(newState);
                    highlightedTransitions.push(transition);
                }
            }
        }
    }


    if (nextStates.length === 0) {
        setAcceptanceResult("String Rejected: No transition found for '" + char + "' from any current states");
        setShowQuestion(true)
        setIsRunningStepWise(false)
        setCurrentStatesNPDA(currentStates)
        setIsStepCompleted(true)
        return;
    }

    currentStates = nextStates;
    currentStates = computeEpsilonClosure(currentStates,transitionMap,setCurrEpsilonTrans,getNodeById);
    highlightTransitions(highlightedTransitions)
    setCurrNode([])
    await sleep(500);
    setStepIndex(stepIndex + 1);
    setCurrNode(currentStates.map(state => state.node));
    setStackContents(currentStates.map(state => ({ node: state.node.id, stack: [...state.stack] })));
    setCurrentStatesNPDA(currentStates)


    // If all characters in the input string have been processed, compute final acceptance.
    if (stepIndex === inputString.length-1) {
        // Compute epsilon closure after processing all characters.
        currentStates = computeEpsilonClosure(currentStates,transitionMap,setCurrEpsilonTrans,getNodeById);
        setCurrNode(currentStates.map(state => state.node));
        setStackContents(currentStates.map(state => ({ node: state.node.id, stack: [...state.stack] })));

        // Check acceptance conditions.
        let acceptedByFinalStateAndEmptyStack = false;
        let acceptedByFinalState = false;
        let acceptedByEmptyStack = false;

        for (const state of currentStates) {
            const { node: mcurrNode, stack: mystack } = state;
            if (finalNodes.has(mcurrNode.id) && mystack.length === 1 && mystack[0] === 'z₀') {
                acceptedByFinalStateAndEmptyStack = true;
            } else if (finalNodes.has(mcurrNode.id)) {
                acceptedByFinalState = true;
            } else if (mystack.length === 1 && mystack[0] === 'z₀') {
                acceptedByEmptyStack = true;
            }
        }

        if (acceptedByFinalStateAndEmptyStack) {
            setAcceptanceResult("String accepted by Final State & Empty Stack");
        } else if (acceptedByFinalState) {
            setAcceptanceResult("String accepted by Final State");
        } else if (acceptedByEmptyStack) {
            setAcceptanceResult("String accepted by Empty Stack");
        } else {
            setAcceptanceResult("String Rejected");
        }
        setIsRunningStepWise(false)
        setCurrentStatesNPDA(currentStates)
    }
    setIsStepCompleted(true)
}