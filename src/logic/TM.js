
function replaceChar(str, index, char) {
    return str.slice(0, index) + char + str.slice(index + 1);
}
export async function TM(nodeMap,transitionMap,inputString,setIsRunning,setShowQuestion,
    setAcceptanceResult,sleep,setStepIndex,setTape,finalNodes,getNodeById,setCurrNode,highlightTransitions){
    setIsRunning(true)
    let state = nodeMap['q0'];
    let tape = "BB"+inputString+"B";
    setTape(tape)
    let direction = 1;
    let char = ''

    for(let i = 2; true; i+=direction){
        if (i < 0 || i >= tape.length) {
            setAcceptanceResult(`String Rejected: Out of bounds`);
            setIsRunning(false);
            return;
        }
        setCurrNode([state])
        await sleep(500)
        setStepIndex(i)

        char = tape[i]
        const transitions = transitionMap[state.id]
        let transition = transitions?transitions.filter((tr)=>
            tr.label.split(',').some((label)=>{
                return label.split('/')[0] === char
            })
        ):null;

        //Check if transition is nice
        if(!transition || transition.length===0){
            setIsRunning(false);
            setShowQuestion(true);
            setAcceptanceResult(`String Rejected: No transition for '${char}' from state '${state.id}'`);
            return
        }
        if(transition&&transition.length>1){
            setIsRunning(false);
            setShowQuestion(true);
            setAcceptanceResult(`String Rejected: Multiple transition for '${char}' from state '${state.id}'`);
            return
        }
        transition = transition[0] //ony one transition as DTM

        //PERFORM THE MENTIONED OPERATION
        let right = ''
        transition.label.split(',').some((label)=>{
            const [input,output_dir] = label.split('/')
            if(input===char) right = output_dir.split('')
        })
        setTape(tape)
        setCurrNode([])
        highlightTransitions([transition])
        await sleep(500)
        tape = replaceChar(tape,i,right[0])

        if(right[1]==='R') direction = 1
        else direction = -1
        //console.log(JSON.stringify(tape)," - ",char,right,right[1])
        state = getNodeById(transition.targetid)
        setTape(tape)
        
        //Stop Execution if final state reached
        if(finalNodes&&finalNodes.has(state.id)){
            setCurrNode([state])
            setAcceptanceResult(`✔ String Accepted`);
            setIsRunning(false)
            return
        }
    }
}

export async function TMStep(transitionMap,setIsRunningStepWise,
    setAcceptanceResult,sleep,stepIndex,setStepIndex,tape,setTape,finalNodes,getNodeById,currNode,
    setCurrNode,highlightTransitions,setIsStepCompleted){
    setIsStepCompleted(false)
    let state = currNode[0];
    setTape(tape)

    if (stepIndex < 0 || stepIndex >= tape.length) {
        setAcceptanceResult(`String Rejected: Out of bounds`);
        setIsStepCompleted(true)
        setIsRunningStepWise(false);
        return;
    }
    setCurrNode([])

    let char = tape[stepIndex]
    const transitions = transitionMap[state.id]
    let transition = transitions?transitions.filter((tr)=>
        tr.label.split(',').some((label)=>{
            return label.split('/')[0] === char
        })
    ):null;
    console.log(transition)
    //Check if transition is nice
    if(!transition || transition.length===0){
        setIsStepCompleted(true)
        setIsRunningStepWise(false);
        setCurrNode([state])
        setAcceptanceResult(`String Rejected: No transition for '${char}' from state '${state.id}'`);
        return
    }
    if(transition&&transition.length>1){
        setIsStepCompleted(true)
        setIsRunningStepWise(false);
        setCurrNode([state])
        setAcceptanceResult(`String Rejected: Multiple transition for '${char}' from state '${state.id}'`);
        return
    }
    transition = transition[0] //ony one transition as DTM

    //PERFORM THE MENTIONED OPERATION
    let right = ''
    transition.label.split(',').some((label)=>{
        const [input,output_dir] = label.split('/')
        if(input===char) right = output_dir.split('')
    })
    
    highlightTransitions([transition])
    await sleep(500)
    setTape((prev)=>replaceChar(prev,stepIndex,right[0]))

    state = getNodeById(transition.targetid)
    setCurrNode([state])

    //Stop Execution if final state reached
    if(finalNodes&&finalNodes.has(state.id)){
        setCurrNode([state])
        setAcceptanceResult(`✔ String Accepted`);
        setIsStepCompleted(true)
        setIsRunningStepWise(false);
        return
    }

    if(right[1]==='R') setStepIndex((prev)=>prev+1)
    else setStepIndex((prev)=>prev-1)    
    setIsStepCompleted(true)
}