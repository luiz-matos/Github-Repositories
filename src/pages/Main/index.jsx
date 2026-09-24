import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FaGithubAlt, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa'

import api from '../../services/api'
import Container from '../../components/Container'
import { Form, SubmitButton, ErrorMessage, List } from './styles'

const REPOSITORY_FORMAT = /^[\w.-]+\/[\w.-]+$/

function isInList(repositories, fullName) {
  return repositories.some(
    repository => repository.name.toLowerCase() === fullName.toLowerCase()
  )
}

function errorMessage(err) {
  const status = err.response && err.response.status
  if (status === 404) return 'Repositório não encontrado.'
  if (status === 403 || status === 429) {
    return 'Limite de requisições da API do GitHub atingido. Tente de novo em alguns minutos.'
  }
  return 'Não foi possível consultar o GitHub. Verifique a conexão e tente de novo.'
}

class Main extends Component {
  state = {
    newRepository: '',
    repositories: [],
    loading: false,
    error: '',
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
    this.setState({ newRepository: e.target.value, error: '' })
  }
  hundleSubmit = async e => {
    e.preventDefault()

    const { newRepository, repositories } = this.state
    const name = newRepository.trim()

    if (!name) {
      this.setState({ error: 'Digite o repositório no formato dono/nome.' })
      return
    }
    if (!REPOSITORY_FORMAT.test(name)) {
      this.setState({ error: 'Use o formato dono/nome, por exemplo facebook/react.' })
      return
    }
    if (isInList(repositories, name)) {
      this.setState({ error: 'Esse repositório já está na lista.' })
      return
    }

    this.setState({ loading: true })
    try {
      const response = await api.get(`/repos/${name}`)
      const data = {
        name: response.data.full_name,
      }
      // A lista atual vem do setState: ela pode ter mudado durante a requisição.
      // A API devolve o nome atual de um repositório renomeado, que pode já estar nela.
      this.setState(state =>
        isInList(state.repositories, data.name)
          ? { error: 'Esse repositório já está na lista.' }
          : { repositories: [...state.repositories, data], newRepository: '' }
      )
    } catch (err) {
      this.setState({ error: errorMessage(err) })
    } finally {
      this.setState({ loading: false })
    }
  }
  hundleRemove = name => {
    this.setState(({ repositories }) => ({
      repositories: repositories.filter(repository => repository.name !== name),
    }))
  }
  render() {
    const { newRepository, loading, repositories, error } = this.state
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.hundleSubmit} $error={Boolean(error)}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepository}
            onChange={this.hundleInputChange}
          />
          <SubmitButton $loading={loading}>
            {loading ? (
              <FaSpinner color="#ffffff" size={14} />
            ) : (
              <FaPlus color="#ffffff" size={14} />
            )}
          </SubmitButton>
        </Form>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <div>
                <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                  Detalhes
                </Link>
                <button
                  type="button"
                  title="Remover"
                  aria-label={`Remover ${repository.name}`}
                  onClick={() => this.hundleRemove(repository.name)}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </li>
          ))}
        </List>
      </Container>
    )
  }
}

export default Main
