import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import styled from 'styled-components';
import Board from '../components/board/Board';
import ButtonBoard from '../components/board/ButtonBoard';
import Header from '../components/Header';
import Logo from '../components/Logo';
import Subtitle from '../components/Subtitle';
import {clicked, gameFinished, iaPlay, bestMove, gameResult, restartGame, boxSelectedO, boxSelectedX} from './api/tictactoe';
import Image from 'next/image';
import ButtonBoardImage from '../components/board/ButtonBoardImage';
import Swal from 'sweetalert2';
import ButtonRestart from '../components/ButtonRestart';
import withReactContent from 'sweetalert2-react-content';
import EmojiIcon from '../components/EmojiIcon';

import {io} from 'socket.io-client';
import ChatDiv from '../components/chat/ChatDiv';
import MessageWidget from '../components/chat/MessageWidget';
import Author from '../components/chat/Author';
import Message from '../components/chat/Message';
import InputName from '../components/InputName';
import MessagesBox from '../components/chat/MessagesBox';
import RightBox from '../components/RightBox';
import InputChat from '../components/chat/InputChat';
import ButtonChat from '../components/chat/ButtonChat';

const socket = io('https://jogo-da-veiaa.herokuapp.com/', {transports: ['websocket']})


const MySwal = withReactContent(Swal);

export default function Home() {
  const [shift, setShift] = useState('X');
  const [isInitialSwalDismissed, setIsInitialSwalDismissed] = useState(false);
  const [isOnlineSwalDismissed, setIsOnlineSwalDismissed] = useState(false);
  const [isRoomSocketUpdated, setIsRoomSocketUpdated] = useState(false);
  const [isRoomCodeSocketUpdated, setisRoomCodeSocketUpdated] = useState(false);
  const [gameMode, setGameMode] = useState('');
  const [actualIaPlay, setActualIaPlay] = useState(false);
  const [WinXGameOnline, setWinXGameOnline] = useState('')
  const [WinOGameOnline, setWinOGameOnline] = useState('')
  const arrayBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const WinGameIA = 'Você venceu jogando com X! Parabéns 😄'
  const WinGameLocal = 'Vitória do X! Nice 😉'
  const LoseGameIA = ['😢', 'Não foi dessa vez. Mas na próxima você consegue! 😄']
  const LoseGameLocal = ['🎉', 'Vitória do O! Tá em casa 🙏']
  const [createOrJoinRoom, setCreateOrJoinRoom] = useState();
  const [roomCode, setRoomCode] = useState('');
  const [isRoom, setIsRoom] = useState(false)
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [previousMessages, setPreviousMessages] = useState([]);
  const [player, setPlayer] = useState();
  const [playersName, setPlayersName] = useState([]);
  const [isTurn, setIsTurn] = useState(true);
  const [receivedMessage, setReceivedMessage] = useState(false);
  useEffect(() => {
    socket.on('receivedMessage', (data) => {
      //setReceivedMessage(false)
      console.log('recebi uma msg')
      setPreviousMessages(previousMessages => [...previousMessages, data] );
      //setPreviousMessages(() => [...previousMessages, data])
      //setReceivedMessage(true)
    })
  
    socket.on('reloadPage', (data) => {
      if(data.adminSocket == socket.id || data.playerOSocket == socket.id){
        location.reload()
      }
    })

    socket.on('restartGame', (data) => {
      console.log('chegou pra reiniciar, lá vou eu!')
      restartGameAndSockets('backend')
    })

    socket.on('clicked', (data) => {
      console.log('chegou algo p mim')
      console.log(data)
      setPlayersName(data.playersName)
      console.log(data)
      setWinXGameOnline(`${data.playersName[0]} venceu! Parabéns :)`)
      setWinOGameOnline(`${data.playersName[1]} venceu! Parabéns :)`)
      data.shift == player ? setIsTurn(false) : setIsTurn(true)
      buttonClicked(data.play, true, data.shift)
    })
  }, [])

  useEffect(() => {
    if(receivedMessage == true){
      //console.log('recebi uma msg')
      setReceivedMessage(false)
    }
  }, [receivedMessage])

  function restartGameAndSockets(preventLoop){
    restartGame();
    if(preventLoop == 'player'){
      socket.emit('restartGame', roomCode);
    }
    setShift('X');
  }

  

  

  useEffect(() => {
    console.log('REFIZ')
    console.log(WinXGameOnline)
    console.log(WinOGameOnline)
    setWinGameMessage((
      <div>
        <EmojiIcon>🎉</EmojiIcon>
        <div style={{color: 'black', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {gameMode == 'ia' ? WinGameIA : (gameMode == 'local' ? WinGameLocal : gameResult == 'X' ? WinXGameOnline: WinOGameOnline)}
        </div>
      </div>
    ))
  }, [WinOGameOnline])
  function isRoomSocket(){
      setIsRoomSocketUpdated(false)
      socket.on('isRoom', (data) => {
        console.log(`ta aqui:  ${data}`)
        setIsRoom(data)
        setIsRoomSocketUpdated(true)
        socket.off('isRoom')
      })
  }

  function roomCodeSocket(){
    setisRoomCodeSocketUpdated(false)
    socket.on('roomCode', (data) => {
      console.log(`ta aqui o roomcode:  ${data}`)
      setRoomCode(data)
      setisRoomCodeSocketUpdated(true)
      socket.off('roomCode')
    })
  }

  useEffect(() => {
    socket.on('previousMessages', function(messages){
    setPreviousMessages(messages);
    socket.off('previousMessages')
    })
  }, [])

  useEffect(() => {
    if(isRoomSocketUpdated){
      LoginRoom()
    }
  }, [isRoomSocketUpdated])

  useEffect(() => {
    if (isRoomCodeSocketUpdated){
      Swal.fire(`Sala criada! O código dela é: ${roomCode}`, '', 'info')
    }
  }, [isRoomCodeSocketUpdated])
  function LoginRoom(){
    if(isRoom == false){
      Swal.fire({
        title: 'Para entrar numa sala, digite o código:',
        showDenyButton: true,
        showCancelButton: false,
        showConfirmButton: true,
        input: 'number',
        confirmButtonText: 'Entrar',
        denyButtonText: `Criar sala`,
      }).then((result) => {
        if (result.dismiss == 'backdrop' || result.dismiss == 'close' || result.dismiss == 'esc' || result.dismiss == 'timer'){
          console.log('saiu!')
          setIsOnlineSwalDismissed(false)
          setIsOnlineSwalDismissed(true)
        }else{
          setIsOnlineSwalDismissed(false)
          if (result.isConfirmed) {
            setRoomCode(result.value)
            const playerSocket = {socket: socket.id, roomCode: roomCode};
            socket.emit('joinRoom', playerSocket)
            setPlayer('O')
            setIsTurn(false)
            isRoomSocket()
          } else if (result.isDenied) {
            setCreateOrJoinRoom('create')
            setPlayer('X')
            roomCodeSocket()
          }
        }
      })
    }else{
      Swal.fire(`Você entrou na sessão ${roomCode}!`, '', '😄')
    }
  }

  function sendMessage(){
    if(message != ''){
      var messageObject = {
        author: author,
        message: message,
        player: player,
        roomCode: String(roomCode)
      };
      socket.emit('sendMessage', messageObject)
      setMessage('')
      document.getElementsByTagName('input')[0].value = ''
    }
  }

  const SwalTitle = (
    <div>
      <EmojiIcon>😄</EmojiIcon>
      <div style={{color: 'black', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Bem vindo ao 
      <Logo style={{transform: 'translate(5%, -10%)'}}>Jogo da ve
        <span style={{fontSize: '55px'}}>ia</span>
        !
      </Logo>
      </div>
      <div className='swal2-html-container' id='swal2-html-container' style={{display: 'block', margin: 0, fontSize: '0.8em', textAlign: 'left', marginLeft: 30}}>Qual seu nome?</div>
      <InputName placeholder='Digite aqui seu nome!' className="swal2-input" onChange={() => setAuthor(document.getElementsByTagName('input')[1].value)}/>
    </div>
  )
  const [WinGameMessage, setWinGameMessage] = useState((
    <div>
      <EmojiIcon>🎉</EmojiIcon>
      <div style={{color: 'black', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {gameMode == 'ia' ? WinGameIA : (gameMode == 'local' ? WinGameLocal : gameResult == 'X' ? WinXGameOnline: WinOGameOnline)}
      </div>
    </div>
  ))
  const LoseGameMessage = (
    <div>
      <EmojiIcon>{gameMode == 'ia' ? LoseGameIA[0] : LoseGameLocal[0]}</EmojiIcon>
      <div style={{color: 'black', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {gameMode == 'ia' ? LoseGameIA[1] : LoseGameLocal[1]}
      </div>
    </div>
  )
  const TieGameMessage = (
    <div>
      <EmojiIcon>🥶</EmojiIcon>
      <div style={{color: 'black', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        Jogo difícil, grandes mentes se enfrentando. Empate humilde! 😳
      </div>
    </div>
  )
  useEffect(async () => {
    await MySwal.fire({
      title: SwalTitle,
      text: 'Qual modo de jogo deseja jogar?',
      showDenyButton: true,
      showCancelButton: true,
      denyButtonColor: '#1DB954',
      confirmButtonColor: '#505050',
      cancelButtonColor: '#D0250D',
      confirmButtonText: 'Contra IA',
      denyButtonText: 'Online',
      cancelButtonText: 'Local',
      
    }).then((result) => {
      if (result.dismiss == 'backdrop' || result.dismiss == 'close' || result.dismiss == 'esc' || result.dismiss == 'timer' || document.getElementsByTagName('input')[1].value == ''){
        console.log(document.getElementsByTagName('input')[1].value)
        setIsInitialSwalDismissed(true)
      }else{
        setIsInitialSwalDismissed(false)
        if(result.isConfirmed){
          setGameMode('ia')
        }else if(result.isDenied){
          setGameMode('online')
        }else if(result.isDismissed){
          setGameMode('local')
        }
      }
    })
  }, [])
  useEffect(async () => {
    if(isInitialSwalDismissed){
        await MySwal.fire({
          title: SwalTitle,
          text: 'Qual modo de jogo deseja jogar?',
          showDenyButton: true,
          showCancelButton: true,
          denyButtonColor: '#1DB954',
          confirmButtonColor: '#505050',
          cancelButtonColor: '#D0250D',
          confirmButtonText: 'Contra IA',
          denyButtonText: 'Online',
          cancelButtonText: 'Local',
          
        }).then((result) => {
          if (result.dismiss == 'backdrop' || result.dismiss == 'close' || result.dismiss == 'esc' || result.dismiss == 'timer' || document.getElementsByTagName('input')[1].value == ''){
            console.log(document.getElementsByTagName('input')[1].value)
            setIsInitialSwalDismissed(false)
            setIsInitialSwalDismissed(true)
          }else{
            setIsInitialSwalDismissed(false)
            if(result.isConfirmed){
              setGameMode('ia')
            }else if(result.isDenied){
              setGameMode('online')
            }else if(result.isDismissed){
              setGameMode('local')
            }
            
          }
        })
      }
    
  }, [isInitialSwalDismissed])
  
  useEffect(() => {
    setIsRoomSocketUpdated(false)
    if(isOnlineSwalDismissed){
      console.log('era p eu rodar dnv')
      setIsRoom(false);
      setIsRoomSocketUpdated(true)
    }
  }, [isOnlineSwalDismissed])

  function buttonClicked(pos, isOnline, socketTurn){
      if(clicked(pos, false, gameMode) == false){
        console.log('ja foi clickado')
      }else{
        console.log(gameMode);
        if(isOnline == true || isOnline == false){
          console.log('to no online')
          if(isOnline == false){
            console.log('foi um player que jogou')
            if(player == 'X'){
              console.log('mandei')
              sendClickedSocket(pos, 'X')
              document.getElementsByClassName('ButtonBoardImage')[pos - 1].src = '/imageX.svg';
              setShift('O')
            }else{
              sendClickedSocket(pos, 'O')
              document.getElementsByClassName('ButtonBoardImage')[pos - 1].src = '/imageO.svg';
              setShift('X')
            }
          }else{
            console.log('eh o bot jogando')
            console.log(player)
            if(socketTurn == 'X'){
              document.getElementsByClassName('ButtonBoardImage')[pos - 1].src = '/imageX.svg';
              setShift('O')
            }else{
              document.getElementsByClassName('ButtonBoardImage')[pos - 1].src = '/imageO.svg';
              setShift('X')
            }
          }
        }else if (gameMode == 'local' || gameMode == 'ia'){
          console.log('entrei no local')
          if(shift == 'X'){
          document.getElementsByClassName('ButtonBoardImage')[pos - 1].src = '/imageX.svg';
          setShift('O')
          }else{
          document.getElementsByClassName('ButtonBoardImage')[pos - 1].src = '/imageO.svg';
          setShift('X')
        }
      }
    }
  }

  function sendClickedSocket(pos, shift){
    let clickedSocket;
    if(shift == 'O'){
      clickedSocket = {playsX: null, playsO: pos, roomCode: roomCode};
    }else if(shift == 'X'){
      clickedSocket = {playsX: pos, playsO: null, roomCode: roomCode};

    }
    socket.emit('clicked', clickedSocket)
  }


  useEffect(() => {
    if(gameMode == 'online'){
      Swal.fire({
        title: 'Para entrar numa sala, digite o código:',
        showDenyButton: true,
        showCancelButton: false,
        showConfirmButton: true,
        input: 'number',
        confirmButtonText: 'Entrar',
        denyButtonText: `Criar sala`,
      }).then((result) => {
        if (result.dismiss == 'backdrop' || result.dismiss == 'close' || result.dismiss == 'esc' || result.dismiss == 'timer'){
          console.log('saiu!')
          setIsOnlineSwalDismissed(true)
        }else{
          setIsOnlineSwalDismissed(false)
          if (result.isConfirmed) {
            setRoomCode(result.value)
            setCreateOrJoinRoom('login')
            setPlayer('O')
            setIsTurn(false)
            isRoomSocket()
  
          } else if (result.isDenied) {
            setCreateOrJoinRoom('create')
            setPlayer('X')
            roomCodeSocket()
          }
        }
        
        
      })
    }
  }, [gameMode])
  useEffect(() => {
    if(createOrJoinRoom == 'create'){
      const adminSocket = socket.id;
      const adminName = author;
      socket.emit('createRoom', {adminSocket: adminSocket, adminName: adminName})
    }else if (createOrJoinRoom == 'login'){
      setGameMode('online')
      const playerSocket = {socket: socket.id, roomCode: roomCode, playerO: author};
      socket.emit('joinRoom', playerSocket)
      
    }
  }, [createOrJoinRoom])
  useEffect(() => {
    if(iaPlay != actualIaPlay){
      const pos = Number(bestMove) - 1;
      if(shift == 'X'){
        document.getElementsByClassName('ButtonBoardImage')[pos].src = '/imageX.svg';
        setShift('O')
      }else{
        document.getElementsByClassName('ButtonBoardImage')[pos].src = '/imageO.svg';
        setShift('X')
      }
    }
    setActualIaPlay(iaPlay)
  }, [iaPlay])

  useEffect(() => {
    console.log('mudei' + gameFinished)
    if(gameFinished){
      if(gameMode == 'ia'){
        if(gameResult == 'X'){
          MySwal.fire({
            title: WinGameMessage,
            text: 'Que tal ir outra?',
            showConfirmButton: false
          })
        }else if(gameResult == 'O'){
          MySwal.fire({
            title: LoseGameMessage,
            text: 'Por que não tentar de novo?',
            showConfirmButton: false
          })
        }else{
          MySwal.fire({
            title: TieGameMessage,
            text: 'Na próxima vai!',
            showConfirmButton: false
          })
        }
      }else if (gameMode == 'local'){
        if(gameResult == 'X'){
          MySwal.fire({
            title: WinGameMessage,
            text: 'Que tal ir outra?',
            showConfirmButton: false
          })
        }else if(gameResult == 'O'){
          MySwal.fire({
            title: LoseGameMessage,
            text: 'Por que não tentar de novo?',
            showConfirmButton: false
          })
        }else{
          MySwal.fire({
            title: TieGameMessage,
            text: 'Na próxima vai!',
            showConfirmButton: false
          })
        }
      }else if (gameMode == 'online'){
        if(gameResult == 'X'){
          MySwal.fire({
            title: WinGameMessage,
            text: 'Que tal ir outra?',
            showConfirmButton: false
          })
        }else if(gameResult == 'O'){
          MySwal.fire({
            title: WinGameMessage,
            text: 'Por que não tentar de novo?',
            showConfirmButton: false
          })
        }else{
          MySwal.fire({
            title: TieGameMessage,
            text: 'Na próxima vai!',
            showConfirmButton: false
          })
        }
      }
    }
  }, [gameFinished])
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', width: '100vw'}}>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '25vw'}}>
      <ChatDiv>
        <MessagesBox>
        {previousMessages.map((p, index) => (
          <>
            <div key={index} style={{display: 'flex', alignItems: 'center', marginLeft: 10, justifyContent: p.player == 'O' ? 'left' : 'right', width: '21vw'}}>
              <div style={p.player == 'O' ? {height: 'fit-content'} : {display: 'none'}}>
                <Image src={'/imageO.svg'} width={50} height={50}/>
              </div>
              <MessageWidget key={index} bgColor={p.player == 'O' ? '#1DB954' : '#D0250D'} bubblePoint={p.player == 'O' ? 'bubblePointGreen.svg' : 'bubblePointRed.svg'} Left={p.player == 'O' ? '-11px' : 'initial'} Right={p.player == 'O' ? 'initial' : '-25px'}>
                <Author>{p.author}:</Author> <Message>{p.message}</Message>
              </MessageWidget>
              <div style={p.player == 'O' ? {display: 'none'} : {height: 'fit-content'}}>
                <Image src={'/imageX.svg'} width={50} height={50}/>
              </div>
            </div>
          </>
        ))}
        </MessagesBox>
      <div style={{display: 'flex', marginTop: 10, width: '100%', alignItems: 'center'}}>
        <InputChat onChange={() => setMessage(document.getElementsByTagName('input')[0].value)}/>
        <ButtonChat onClick={() => {sendMessage()}}>enviar</ButtonChat>
      </div>
      </ChatDiv>
      </div>
      <div style={{width: '50vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around'}}>
        <Header>
          <Logo>Jogo da ve<span style={{fontSize: '55px'}}>ia</span></Logo>
          <Subtitle className="subtitle">VEZ DO: <span style={{color: '#1DB954'}}>{shift}</span></Subtitle>
        </Header>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginTop: '20px'}}>
          <Board>
            {arrayBoard.map((currentValue, index) => {
              return (<ButtonBoard className='ButtonBoard' key={index} onClick={() => gameMode == 'online' ? buttonClicked(index + 1, false) : buttonClicked(index + 1, undefined)} disabled={gameFinished || !isTurn}>
                <ButtonBoardImage className='ButtonBoardImage' src='/blank.png'/>
              </ButtonBoard>)
            })}
          </Board>

        </div>
          <div style={{height: '25vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <ButtonRestart onClick={() => {restartGameAndSockets('player')}}>reiniciar</ButtonRestart>
          </div>
      </div>
      <RightBox>
        <Subtitle style={{alignSelf: 'flex-start'}}>Informações sobre a sala:</Subtitle>
        <div style={{display: 'flex', flexDirection: 'column', width: '350px', alignItems: 'start', justifyContent: 'flex-start'}}>
          <h2 className="subtitle" style={roomCode == '' ? {display: 'none'} : {display: 'block', margin: '0'}}>Código da sala: {roomCode}</h2>
          <h2 className="subtitle" style={playersName[0] == undefined || playersName[1] == undefined ? {display: 'none'} : {display: 'block', margin: '0'}}>Jogadores conectados: {playersName[0]} e {playersName[1]}</h2>
        </div>
      </RightBox>
    </div>
  )
}
