import styled from 'styled-components'

const MessageWidget = styled.div`
    width: max-content;
    max-width: 16vw;
    height: max-content;
    padding: 10px;
    margin: 10px;
    margin-left: 15px;
    position: relative;
    background: ${props => props.bgColor};
    border-radius: 16px;
    ::before{
        content: '';
        position: absolute;
        left: ${props => props.Left};
        right: ${props => props.Right};
        background-image: url(${props => props.bubblePoint});
        background-repeat: no-repeat;
        width: 13%;
        height: 24px;
    }
    display: flex;
    align-items: center;
    background-repeat: no-repeat;
`

export default MessageWidget;