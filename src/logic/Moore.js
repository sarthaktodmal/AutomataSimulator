
export async function Moore(inputString, transitionMap, nodeMap, setShowQuestion, setIsRunning, 
    setAcceptanceResult, sleep, highlightTransitions, setCurrNode, 
    setStepIndex, getNodeById,stateOutput){
   
    setIsRunning(true);
    let currentState = nodeMap["q0"];
    setCurrNode([currentState])
    let output = `${stateOutput['q0']}`;
    setAcceptanceResult(`✔ Output: ${stateOutput['q0']}`)
    
    for (const char of inputString) {
        //await sleep(100);
        const transitions = transitionMap[currentState.id];
        let transition = transitions ? transitions.filter(t => {
            return t.label.split(',').some((ahh)=>{
                if(ahh===char){
                    return true
                }
            })
        }):null;

        if (!transition || transition.length===0) {
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
        output += stateOutput[currentState.id];

        await sleep(400);
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

export async function MooreStep(
    currNode, setCurrNode, inputString, acceptanceResult,transitionMap, stepIndex,setStepIndex,getNodeById
    ,highlightTransitions, setAcceptanceResult, setShowQuestion, setIsRunningStepWise,
    setIsStepCompleted,sleep,stateOutput
) {
    let output = acceptanceResult?acceptanceResult.replace('✔ Output: ',""):'';
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
    let transition = transitions ? transitions.filter(t => {
        return t.label.split(',').some((ahh)=>{
            if(ahh===char){
                return true
            }
        })
    }):null;

    if (!transition || transition.length===0) {
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
    transition = transition[0]
    // Update current state and output
    currentState = getNodeById(transition.targetid);
    output += stateOutput[currentState.id];
    
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