import ReactDOM from 'react-dom';



export async function NFA(initialNodes,setStepIndex,sleep,inputString,
    setIsRunning,finalNodes,setAcceptanceResult,transitionMap,getNodeById,setShowQuestion,
    setCurrNode,highlightTransitions,setCurrEpsilonTrans,epsilonClosure
){
    setStepIndex(0);
    const stack = [{ nodes: initialNodes, charIndex: 0 }];
    while (stack.length > 0) {
        await sleep(100);
        const { nodes, charIndex } = stack.pop();
        const currentNodes = epsilonClosure(nodes);

        if (charIndex === inputString.length) {
          setIsRunning(false);
          if (currentNodes.some(node => finalNodes.has(node.id))) {
            setAcceptanceResult("String Accepted");
          } else {
            setAcceptanceResult("String Rejected");
          }
          return;
        }
        const char = inputString[charIndex];
        let nextNodes = [];
        let transitionsToHighlight = [];
        let noTransitionFound = true;

        for (const currNode of currentNodes) {
            const transitions = transitionMap[currNode.id];
            const availablePaths = transitions ? transitions.filter(t => t.label.split(',').includes(char)) : [];
            if (availablePaths && availablePaths.length > 0) {
                for (const path of availablePaths) {
                    const nextNode = getNodeById(path.targetid);
                    if (nextNode) {
                        nextNodes.push(nextNode);
                        transitionsToHighlight.push(path);
                        noTransitionFound = false;
                    }
                }
            }
        }
        if (nextNodes.length === 0 && noTransitionFound) {
            setIsRunning(false);
            setShowQuestion(true);
            setAcceptanceResult(`String Rejected: No transition for '${char}' from any current state`);
            return;
        }
        await sleep(500);
        setCurrNode([]);
        highlightTransitions(transitionsToHighlight);
        setCurrEpsilonTrans([]);
        await sleep(500);

        stack.push({ nodes: nextNodes, charIndex: charIndex + 1 });
        setCurrNode(epsilonClosure(nextNodes));
        setStepIndex(charIndex + 1);
    }
  };


//StepWise
export async function NFAStep(
    currNode,setStepIndex,stepIndex,sleep,inputString,
    setIsRunningStepWise,finalNodes,setAcceptanceResult,transitionMap,getNodeById,setShowQuestion,
    setCurrNode,highlightTransitions,setCurrEpsilonTrans,setIsStepCompleted,epsilonClosure
){
    setIsStepCompleted(false);
    const char = inputString[stepIndex];
    let currentNodes = epsilonClosure(currNode);
    let nextNodes = [];
    let transitionsToHighlight = [];

    if(!char){
      const isAccepted = currentNodes.some(node => finalNodes.has(node.id));
      setAcceptanceResult(isAccepted ? "String Accepted" : "String Rejected");
      setIsRunningStepWise(false);
      return;
    }
    for (const currNode of currentNodes) {
      if (!transitionMap[currNode.id]) continue;
      const transitions = transitionMap[currNode.id];
      const availablePaths = transitions?transitions.filter(t => t.label.split(',').includes(char)):null;
      if (availablePaths&&availablePaths.length > 0) {
        for (const path of availablePaths) {
          const nextNode = getNodeById(path.targetid);
          if (nextNode && !nextNodes.includes(nextNode)) {
            nextNodes.push(nextNode);
            transitionsToHighlight.push(path);
          }
        }
      }
    }
    if (nextNodes.length === 0 && transitionsToHighlight.length === 0) {
      setIsRunningStepWise(false);
      setShowQuestion(true);
      setAcceptanceResult(`String Rejected: No transition for '${char}' from any current state`);
      return;
    }else{
      ReactDOM.unstable_batchedUpdates(() => {
      highlightTransitions(transitionsToHighlight)
      setCurrEpsilonTrans([])
      setCurrNode([])
      })
      await sleep(500);
      ReactDOM.unstable_batchedUpdates(() => {
        nextNodes = epsilonClosure(nextNodes)
        setCurrNode(nextNodes);
        setStepIndex(stepIndex + 1);
      })
    }
    if (stepIndex===inputString.length-1) {
      const isAccepted = nextNodes.some(node => finalNodes.has(node.id));
      setAcceptanceResult(isAccepted ? "String Accepted" : "String Rejected");
      setIsRunningStepWise(false);
      return;
    }
    setIsStepCompleted(true);
};