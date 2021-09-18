import styled from 'styled-components'

const ButtonBoard = styled.button`
    background-color: transparent;
    width: 33%;
    height: 33%;
    border: 0px solid black;
    border-right: ${props => props.right};
    border-left: ${props => props.left};
    border-top: ${props => props.top};
    border-bottom: ${props => props.bottom};

    :disabled{
        cursor: not-allowed;
    }
`

export default ButtonBoard;