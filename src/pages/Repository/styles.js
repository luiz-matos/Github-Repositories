import styled from 'styled-components'

export const Loading = styled.div`
  color: #ffffff;
  font-size: 30px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
export const Owner = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  a {
    text-decoration: none;
    font-size: 16px;
    color: #5aaeb8;
  }
  img {
    width: 120px;
    border-radius: 50%;
    margin-top: 20px;
  }
  h1 {
    font-size: 24px;
    margin-top: 10px;
  }
  p {
    margin-top: 5px;
    font-size: 14px;
    color: #666666;
    line-height: 1.4;
    text-align: center;
    max-width: 400px;
  }
`
export const IssueFilter = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 30px;
  margin-top: 30px;
  border-top: 1px solid #eeeeee;
  button {
    padding: 5px 15px;
    border: 1px solid #5aaeb8;
    background-color: #ffffff;
    color: #5aaeb8;
    & + button {
      margin-left: 5px;
    }
    &[aria-pressed='true'] {
      background-color: #5aaeb8;
      color: #ffffff;
    }
  }
  button:first-child {
    border-radius: 4px 0 0 4px;
  }
  button:last-child {
    border-radius: 0 4px 4px 0;
  }
`
export const IssuesMessage = styled.p`
  margin-top: 20px;
  text-align: center;
  color: #999999;
`
export const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  span {
    color: #666666;
  }
  button {
    padding: 5px 15px;
    border: 0;
    border-radius: 4px;
    background-color: #5aaeb8;
    color: #ffffff;
    &[disabled] {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }
`
export const IssueList = styled.ul`
  margin-top: 20px;
  list-style: none;
  opacity: ${props => (props.$loading ? 0.5 : 1)};
  li {
    display: flex;
    padding: 15px 10px;
    border: 1px solid #eeeeee;
    border-radius: 4px;
    & + li {
      margin-top: 10px;
    }
    img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #eeeeee;
    }
    div {
      flex: 1;
      margin-left: 15px;
      strong {
        font-size: 16px;
        a {
          text-decoration: none;
          color: #333333;
          &:hover {
            color: #5aaeb8;
          }
        }
        span {
          background-color: #eeeeee;
          color: #333333;
          border-radius: 2px;
          font-size: 12px;
          font-weight: 600;
          height: 20px;
          padding: 3px 4px;
          margin-left: 10px;
        }
      }
      p {
        margin-top: 5px;
        font-size: 12px;
        color: #999999;
      }
    }
  }
`
