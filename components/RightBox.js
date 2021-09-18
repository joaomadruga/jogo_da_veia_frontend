import styled from 'styled-components'

const RightBox = styled.div`
    align-self: center;
    width: 25vw;
    height: 150px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    ::after{
      content: '';
      position: absolute;
      width: 400px;
      height: 150px;
      border: solid 6px #1DB954;
      z-index: -999;
    }
`

export default RightBox;