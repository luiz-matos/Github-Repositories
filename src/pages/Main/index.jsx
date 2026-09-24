import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa'

import api from '../../services/api'
import Container from '../../components/Container'
import { Form, SubmitButton, List } from './styles'

class Main extends Component {
  state = {
    newRepository: '',
    repositories: [],
    loading: false,
  }
  componentDidMount() {
    const repositories = localStorage.getItem('repositories')
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) })
    }
  }
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories))
    }
  }

  hundleInputChange = e => {
    this.setState({ newRepository: e.target.value })
  }
  hundleSubmit = async e => {
    e.preventDefault()
    this.setState({ loading: true })

    const { newRepository, repositories } = this.state

    const response = await api.get(`/repos/${newRepository}`)
    const data = {
      name: response.data.full_name,
    }
    this.setState({
      repositories: [...repositories, data],
      newRepository: '',
      loading: false,
    })
  }
  render() {
    const { newRepository, loading, repositories } = this.state
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.hundleSubmit}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepository}
            onChange={this.hundleInputChange}
          />
          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#ffffff" size={14} />
            ) : (
              <FaPlus color="#ffffff" size={14} />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    )
  }
}

export default Main
