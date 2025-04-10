
export async function DFA(
    inputString,transitionMap,nodeMap,setShowQuestion,setIsRunning,setAcceptanceResult,
    sleep,highlightTransitions,setCurrNode,setStepIndex,finalNodes,getNodeById
){
    let mcurrNode = nodeMap["q0"];
    setCurrNode([mcurrNode])

    for (const char of inputString) {
        const transitions = transitionMap[mcurrNode.id];
        const transition = transitions?transitions.filter((t) => t.label.split(',').includes(char)):null;
        const epsilonPaths = transitions?transitions.filter(t => t.label.split(',').includes('ε')):null;
  
        if(epsilonPaths&&epsilonPaths.length>=1){
          setShowQuestion(true);
          setIsRunning(false)
          setAcceptanceResult("Epsilon Transitions not allowed in DFA")
          return;
        }
        await sleep(500);
        if(transition&&transition.length>1){
          setShowQuestion(true);
          setIsRunning(false)
          setAcceptanceResult("Multiple Transitions for Same Symbol")
          return;
        }
        if (!transition || transition.length<=0) {
          setShowQuestion(true);
          setIsRunning(false);
          setAcceptanceResult(`No transition for '${char}'`);
          return;
        }
        const nextNode = getNodeById(transition[0].targetid);
        highlightTransitions(transition)
        setCurrNode([]);
        await sleep(500);
        setCurrNode([nextNode]);
        mcurrNode = nextNode;
        setStepIndex((prevStepIndex) => prevStepIndex + 1);
      }
      
      if (mcurrNode && finalNodes.has(mcurrNode.id)) {
        setAcceptanceResult("✔ String Accepted");
      } else {
        setAcceptanceResult("String Rejected");
      }
      setIsRunning(false);
}

//Step Wise
export async function DFAStep(
inputString,stepIndex,setStepIndex,currNode,setCurrNode,transitionMap
,setShowQuestion,setIsRunningStepWise,setAcceptanceResult,highlightTransitions
,sleep,getNodeById,setIsStepCompleted,finalNodes,nodeMap
){
    const char = inputString[stepIndex];
    let mcurrNode = currNode[0];

    if (inputString && mcurrNode) {
      const transitions = transitionMap[mcurrNode.id];
      const transition = transitions?transitions.filter((t) => t.label.split(',').includes(char)):null;
      const epsilonPaths = transitions?transitions.filter(t => t.label.split(',').includes('ε')):null;
      
      if(epsilonPaths&&epsilonPaths.length>=1){
        setShowQuestion(true);
        setIsRunningStepWise(false)
        setAcceptanceResult("Epsilon Transitions not allowed in DFA")
        return;
      }
      if(transition&&transition.length>1){
        setShowQuestion(true);
        setIsRunningStepWise(false)
        setAcceptanceResult("Multiple Transitions for Same Symbol")
        return;
      }
      if (!transition || transition.length<=0) {
        setIsRunningStepWise(false);
        setShowQuestion(true);
        setAcceptanceResult(`No transition for '${char}'`);
        return;
      }
      setCurrNode([])
      highlightTransitions(transition)
      await sleep(500);
      const nextNode = getNodeById(transition[0].targetid);
      setCurrNode([nextNode]);
      mcurrNode = nextNode;
    }
    if (stepIndex >= inputString.length - 1) {
      setIsRunningStepWise(false);
      if (mcurrNode && finalNodes.has(mcurrNode.id)) {
        setAcceptanceResult("✔ String is Accepted");
      } else {
        setAcceptanceResult("String is Rejected");
      }
    }
    setStepIndex((prevStepIndex) => prevStepIndex + 1);
    setIsStepCompleted(true);
}