
export async function DPDA(
    initialNodes,setIsRunning,setCurrNode,inputString,
    transitionMap,setStack,sleep,highlightTransitions,getNodeById,
    setStepIndex,finalNodes,setAcceptanceResult,setShowQuestion
){
    setIsRunning(true)
    setCurrNode([initialNodes])

    let mcurrNode = initialNodes
    let mystack = ['z₀']
    setStack(mystack)

    for(const char of inputString){
        const transitions = transitionMap[mcurrNode.id]
        if (!transitions) {
            setShowQuestion(true);
            setIsRunning(false);
            setAcceptanceResult(`String Rejected: No transition for '${char}'`);
            return;
        }
        //getTransition
        const transition = transitions.find((t)=>{
            let found = false
            t.label.split(" | ").forEach(operation => {
                const [leftSide, toPush] = operation.split('/');
                const [inputSymbol, stackTop] = leftSide.split(',');
                if (inputSymbol === char && stackTop === mystack[mystack.length - 1]) {
                    found = true
                }
            });
            return found;
        })
        if (!transition) {
            setShowQuestion(true);
            setIsRunning(false);
            setAcceptanceResult(`String Rejected: No transition for '${char}' with stack symbol '${mystack[mystack.length - 1]}'`);
            return;
        }
        if (transition.length>1) {
            setShowQuestion(true);
            setIsRunning(false);
            setAcceptanceResult(`String Rejected: Multiple transitions for'${char}','${mystack[mystack.length - 1]}'`);
            return;
        }
        await sleep(500);
        setCurrNode([]);
        highlightTransitions([transition]);
        
        //do operation
        const labels = transition.label.split(' | ');
        for (const label of labels) {
            const [leftSide, toPush] = label.split('/');
            const [inputSymbol, stackTop] = leftSide.split(',');
            if (inputSymbol === char && stackTop === mystack[mystack.length - 1]) {
                mystack.pop();
                setStack(mystack)
                if (toPush !== 'ε') {
                    toPush.split(',').reverse().forEach((symbol) => mystack.push(symbol));
                }
                await sleep(500);
                setStack(mystack)
                break
            }
        }

        //prepare for next
        setCurrNode([getNodeById(transition.targetid)]);
        setStack(mystack);
        mcurrNode = getNodeById(transition.targetid);
        setStepIndex((prevStepIndex) => prevStepIndex + 1);
    }

    if (mcurrNode && finalNodes.has(mcurrNode.id) && mystack.length === 1 && mystack[0] === 'z₀') {
        setAcceptanceResult("String accepted by Final State & Empty Stack");
    } else if(mcurrNode && finalNodes.has(mcurrNode.id)) {
        setAcceptanceResult("String accepted by Final State");
    }else if(mcurrNode && mystack.length === 1 && mystack[0] === 'z₀'){
        setAcceptanceResult("String accepted by Empty Stack");
    }else{
        setAcceptanceResult("String Rejected");
    }
    setIsRunning(false);
}

//StepWise
export async function DPDAStep(
    currNode,setCurrNode,inputString,
    transitionMap,stack,setStack,sleep,highlightTransitions,getNodeById,stepIndex,
    setStepIndex,finalNodes,setAcceptanceResult,setShowQuestion,setIsRunningStepWise,
    setIsStepCompleted
){
    let mcurrNode = currNode[0]
    let mystack = stack
    setIsStepCompleted(false)
    const char = inputString[stepIndex]

    if(!char){
        if (mcurrNode && finalNodes.has(mcurrNode.id) && mystack.length === 1 && mystack[0] === 'z₀') {
            setAcceptanceResult("String accepted by Final State & Empty Stack");
        } else if(mcurrNode && finalNodes.has(mcurrNode.id)) {
            setAcceptanceResult("String accepted by Final State");
        }else if(mcurrNode && mystack.length === 1 && mystack[0] === 'z₀'){
            setAcceptanceResult("String accepted by Empty Stack");
        }else{
            setAcceptanceResult("String Rejected");
        }
        setIsRunningStepWise(false)
        setIsStepCompleted(true)
        return
    }

    //Loop Part
    const transitions = transitionMap[mcurrNode.id]
    if (!transitions) {
        setShowQuestion(true);
        setIsRunningStepWise(false);
        setAcceptanceResult(`No transition for '${char}'`);
        setIsStepCompleted(true)
        return;
    }
    //getTransition
    const transition = transitions.find((t)=>{
        let found = false
        t.label.split(" | ").forEach(operation => {
            const [leftSide, toPush] = operation.split('/');
            const [inputSymbol, stackTop] = leftSide.split(',');
            if (inputSymbol === char && stackTop === mystack[mystack.length - 1]) {
                found = true
                setAcceptanceResult(`Input: ${char} StackTop: ${mystack[mystack.length - 1]} | Pop: ${mystack[mystack.length - 1]} Push: ${toPush!=='ε'?toPush:"nothing"}`);
            }
        });
        return found;
    })

    if (!transition) {
        setShowQuestion(true);
        setIsRunningStepWise(false);
        setAcceptanceResult(`No transition for '${char}' with stack symbol '${mystack[mystack.length - 1]}'`);
        setIsStepCompleted(true)
        return;
    }
    if (transition.length>1) {
        setShowQuestion(true);
        setIsRunningStepWise(false);
        setAcceptanceResult(`Multiple transitions for'${char}'/'${mystack[mystack.length - 1]}'`);
        setIsStepCompleted(true)
        return;
    }
    setCurrNode([]);
    highlightTransitions([transition]);
    await sleep(500);
        
    //do operation
    const labels = transition.label.split(' | ');
    for (const label of labels) {
        const [leftSide, toPush] = label.split('/');
        const [inputSymbol, stackTop] = leftSide.split(',');
        if (inputSymbol === char && stackTop === mystack[mystack.length - 1]) {
            mystack.pop();
            setStack(mystack)
            if (toPush !== 'ε') {
                toPush.split(',').reverse().forEach((symbol) => mystack.push(symbol));
            }
            setStack(mystack)
            break
        }
    }

    //prepare for next
    setCurrNode([getNodeById(transition.targetid)]);
    setStack(mystack);
    mcurrNode = getNodeById(transition.targetid);
    setStepIndex((prevStepIndex) => prevStepIndex + 1);
    //Loop Part End

    if (stepIndex===inputString.length-1) {
        if (mcurrNode && finalNodes.has(mcurrNode.id) && mystack.length === 1 && mystack[0] === 'z₀') {
            setAcceptanceResult("String accepted by Final State & Empty Stack");
        } else if(mcurrNode && finalNodes.has(mcurrNode.id)) {
            setAcceptanceResult("String accepted by Final State");
        }else if(mcurrNode && mystack.length === 1 && mystack[0] === 'z₀'){
            setAcceptanceResult("String accepted by Empty Stack");
        }else{
            setAcceptanceResult("String Rejected");
        }
        setIsRunningStepWise(false);
    }
    setIsStepCompleted(true)
}