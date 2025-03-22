
export async function Mealy(
    inputString, transitionMap, nodeMap, setShowQuestion, setIsRunning, 
    setAcceptanceResult, sleep, highlightTransitions, setCurrNode, 
    setStepIndex, getNodeById
) {
    setIsRunning(true);
    let currentState = nodeMap["q0"];
    setCurrNode([currentState])
    let output = "";
    setAcceptanceResult(`✔ Output: `)

    for (const char of inputString) {
        const transitions = transitionMap[currentState.id];
        let outputchar = ''
        let transition = transitions ? transitions.filter(t => {
            return t.label.split(',').some((ahh)=>{
                const [input,output] = ahh.split('/')
                if(input===char){
                    outputchar = output
                    return true
                }
            })
        }):null;

        if (!outputchar) {
            setShowQuestion(true);
            setIsRunning(false);
            setAcceptanceResult(`No transition for '${char}' from state '${currentState.id}'`);
            return;
        }
        if(transition.length>1){
            setShowQuestion(true);
            setIsRunning(false);
            setAcceptanceResult(`Multiple transition for '${char}' from state '${currentState.id}'`);
            return;
        }
        transition = transition[0]
        currentState = getNodeById(transition.targetid);
        output += outputchar;

        await sleep(500);
        setCurrNode([]);
        highlightTransitions([transition]);
        setAcceptanceResult(`✔ Output: ${output}`)
        await sleep(500);
        setCurrNode([currentState]);
        setStepIndex((prevStepIndex) => prevStepIndex + 1);
    }

    setAcceptanceResult(`✔ Output: ${output}`);
    setIsRunning(false);
}

// Stepwise execution function
export async function MealyStep(
    currNode, setCurrNode, inputString, acceptanceResult,transitionMap, stepIndex,setStepIndex,getNodeById
    ,highlightTransitions, setAcceptanceResult, setShowQuestion, setIsRunningStepWise,
    setIsStepCompleted,sleep
) {
    let output = acceptanceResult?acceptanceResult.replace('✔ Output: ',""):"";
    let currentState = currNode[0];
    const char = inputString[stepIndex];
    setIsStepCompleted(false)
    if (!char) {
        setIsRunningStepWise(false);
        setIsStepCompleted(true)
        setAcceptanceResult(`✔ Output: ${output}`);
        return;
    }

    const transitions = transitionMap[currentState.id];
    let outputchar = ''
    let transition = transitions ? transitions.filter(t => {
        return t.label.split(',').some((ahh)=>{
            const [input,output] = ahh.split('/')
            if(input===char){
                outputchar = output
                return true
            }
        })
    }):null;

    if (!outputchar) {
        setShowQuestion(true);
        setIsRunningStepWise(false);
        setIsStepCompleted(true)
        setAcceptanceResult(`No transition for '${char}' from state '${currentState.id}'`);
        return;
    }
    if(transition.length>1){
        setShowQuestion(true);
        setIsRunningStepWise(false);
        setIsStepCompleted(true)
        setAcceptanceResult(`Multiple transition for '${char}' from state '${currentState.id}'`);
        return;
    }
    output+=outputchar
    transition = transition[0]
    // Update current state and output
    currentState = getNodeById(transition.targetid);
    setCurrNode([])
    highlightTransitions([transition])
    setAcceptanceResult(`✔ Output: ${output}`)
    await sleep(500)
    setCurrNode([currentState]);
    setStepIndex((prevStepIndex) => prevStepIndex + 1);
    
    if (stepIndex >= inputString.length-1) {
        setIsRunningStepWise(false);
        setAcceptanceResult(`✔ Output: ${output}`);
    }
    setIsStepCompleted(true)
}

// validate transitions for each node
export function validateTransitions(node, transitionMap, inputString) {
    const transitions = transitionMap[node.id];
    const inputSymbols = Array.from(new Set(inputString.split(''))); // Unique input symbols

    for (const symbol of inputSymbols) {
        const transition = transitions.find(t => t.label.split(',')[0] === symbol);
        if (!transition) {
            return false; // No transition for this input symbol
        }
    }
    return true; // All input symbols have transitions
}
