export let boxSelectedX = [];
export let boxSelectedO = [];
let turno = 'X';
let bestScore = -Infinity;
export let bestMove;
let lastMove;
export let iaPlay = false;
export let gameFinished = false;
export let gameResult;
let finalResult;
export function clicked(boxNumber, isTesting, gameMode){
    if (boxSelectedX.includes(boxNumber) || boxSelectedO.includes(boxNumber)){
        console.log('ja foi clickado')
        return false;
    }else{
        lastMove = boxNumber
        if (turno == 'X'){
            boxSelectedX.push(boxNumber)
            if (venceu() == true){
                stopGame('X', isTesting)
            }else if(boxSelectedX.length + boxSelectedO.length == 9){
                console.log('empatou')
                stopGame('tie', isTesting)
            }
            turno = 'O'
            if(gameMode == 'local'){
                console.log('tua vez de jogar ai boy')
            }else if(gameMode == 'ia'){
                if(isTesting == false){
                    //setTimeout(() => {playingIA(); iaPlay = !iaPlay}, 1000); 
                    playingIA()
                    iaPlay = !iaPlay;
                }
            }
        }else{
            boxSelectedO.push(boxNumber)
            if (venceu() == true){
                stopGame('O', isTesting)
            }else if(boxSelectedX.length + boxSelectedO.length == 9){
                console.log('empatou')
                stopGame('tie', isTesting)
            }
           
            turno = 'X'
            
        }
    }
}

function venceu(){
    const possibilidadesVitoriaX = [
        boxSelectedX.includes(1) && boxSelectedX.includes(2) && boxSelectedX.includes(3),
        boxSelectedX.includes(1) && boxSelectedX.includes(5) && boxSelectedX.includes(9),
        boxSelectedX.includes(1) && boxSelectedX.includes(4) && boxSelectedX.includes(7),
        boxSelectedX.includes(2) && boxSelectedX.includes(5) && boxSelectedX.includes(8),
        boxSelectedX.includes(3) && boxSelectedX.includes(5) && boxSelectedX.includes(7),
        boxSelectedX.includes(3) && boxSelectedX.includes(6) && boxSelectedX.includes(9),
        boxSelectedX.includes(4) && boxSelectedX.includes(5) && boxSelectedX.includes(6),
        boxSelectedX.includes(7) && boxSelectedX.includes(8) && boxSelectedX.includes(9)
    ]
    const possibilidadesVitoriaO = [
        boxSelectedO.includes(1) && boxSelectedO.includes(2) && boxSelectedO.includes(3),
        boxSelectedO.includes(1) && boxSelectedO.includes(5) && boxSelectedO.includes(9),
        boxSelectedO.includes(1) && boxSelectedO.includes(4) && boxSelectedO.includes(7),
        boxSelectedO.includes(2) && boxSelectedO.includes(5) && boxSelectedO.includes(8),
        boxSelectedO.includes(3) && boxSelectedO.includes(5) && boxSelectedO.includes(7),
        boxSelectedO.includes(3) && boxSelectedO.includes(6) && boxSelectedO.includes(9),
        boxSelectedO.includes(4) && boxSelectedO.includes(5) && boxSelectedO.includes(6),
        boxSelectedO.includes(7) && boxSelectedO.includes(8) && boxSelectedO.includes(9)
    ]
    if (turno == 'X'){
        for (let i = 0; i < possibilidadesVitoriaX.length; i++){
            if (possibilidadesVitoriaX[i]){
                console.log('X venceu IA perdeu')
                return true
            }
        }
    }else{
        for (let i = 0; i < possibilidadesVitoriaO.length; i++){
            if (possibilidadesVitoriaO[i]){
                console.log('O venceu IA venceu')
                return true
            }
        }
    }
}

function stopGame(result, isTesting){
    console.log('para tudo! ' + isTesting + result)
    if(isTesting == false){
        gameFinished = true;
        gameResult = result;
    }
    finalResult = result;
}
export function restartGame(){
    if(boxSelectedX.length > 0 || boxSelectedO.length > 0){
        boxSelectedX = [];
        boxSelectedO = [];
        turno = 'X';
        for (let i = 0; i < document.getElementsByClassName('ButtonBoard').length; i++){
            document.getElementsByClassName('ButtonBoardImage')[i].src = '/blank.png'
        }
        gameFinished = false;
    }
}

function undo(){
    if (turno == 'O'){
        document.getElementsByClassName('ButtonBoardImage')[boxSelectedX[boxSelectedX.length - 1] - 1].src = '/blank.png'
        boxSelectedX.pop()
        turno = 'X'
        
    }else{
        document.getElementsByClassName('ButtonBoardImage')[boxSelectedX[boxSelectedX.length - 1] - 1].src = '/blank.png'
        boxSelectedO.pop()
        turno = 'O'
        
    }
}

function playingIA() {
    console.log('///////////////////////////////////////////////////')
    if (boxSelectedX.length == 0 && boxSelectedO.length == 0){
        const initialRandomNumber = Math.round(Math.random() * (9 - 1) + 1);
        clicked(initialRandomNumber, false);
    }else{
        let bestScore = -Infinity;
            for (let i = 1; i < 10; i++){
                if (!boxSelectedX.includes(i) && !boxSelectedO.includes(i)){
                   // console.log('vou testar' + i)
                    clicked(i, true)
                    let score = minimax(boxSelectedX, boxSelectedO, 0, false);
                   // console.log(score)
                    undo()
                    if (score > bestScore) {
                        //console.log('joguei com o score' + score + 'e o move' + i)
                        bestScore = score
                        console.log('o melhor score que achei foi ' + bestScore)
                        bestMove = i
                    }
            }
        }
        console.log('a melhor play que achei foi ' + bestMove)
        clicked(bestMove, false);
        finalResult = undefined;
    }
}

let scores = {
    X: -1,
    O: 1,
    tie: 0
}
let scoreO = {
    X: -1,
    O: 1,
    tie: 0
}

function minimax(boxSelectedX, boxSelectedO, depth, isMaximizing){
    if (finalResult !== undefined){
        const bestResult = scores[finalResult]
        finalResult = undefined;
        return bestResult;
    }
    if (isMaximizing){
        let bestScore = -Infinity;
        for (let i = 1; i < 10; i++){
            if (!boxSelectedX.includes(i) && !boxSelectedO.includes(i)){
                clicked(i, true)
                let score = minimax(boxSelectedX, boxSelectedO, depth + 1, false);
                undo()
                bestScore = Math.max(score, bestScore)
        }
    }
    return bestScore
    }else{
        let bestScore = Infinity;
        for (let i = 1; i < 10; i++){
            if (!boxSelectedX.includes(i) && !boxSelectedO.includes(i)){
                clicked(i, true)
                let score = minimax(boxSelectedX, boxSelectedO, depth + 1, true);
                undo()
                bestScore = Math.min(score, bestScore)
        }
    }
    return bestScore
    }
}
