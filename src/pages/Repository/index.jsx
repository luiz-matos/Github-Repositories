import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Loading, Owner, IssueFilter, IssueList, IssuesMessage } from './styles'
import Container from '../../components/Container'
import api from '../../services/api'

const FILTERS = [
  { state: 'open', label: 'Abertas' },
  { state: 'closed', label: 'Fechadas' },
  { state: 'all', label: 'Todas' },
]

// O endpoint /issues mistura pull requests; a busca com is:issue traz só issues
async function fetchIssues(fullName, filter) {
  const stateQuery = filter === 'all' ? '' : ` is:${filter}`
  const response = await api.get('search/issues', {
    params: {
      q: `repo:${fullName} is:issue${stateQuery}`,
      sort: 'created',
      order: 'desc',
      per_page: 5,
    },
  })
  return response.data.items
}

class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    error: '',
    filter: 'open',
    issuesLoading: false,
    issuesError: '',
  }

  async componentDidMount() {
    const { match } = this.props
    const repositoryName = decodeURIComponent(match.params.repository)
    try {
      const repository = await api.get(`repos/${repositoryName}`)
      const issues = await fetchIssues(repository.data.full_name, this.state.filter)
      this.setState({
        loading: false,
        repository: repository.data,
        issues,
      })
    } catch (err) {
      const notFound = err.response && err.response.status === 404
      this.setState({
        loading: false,
        error: notFound
          ? 'Repositório não encontrado.'
          : 'Não foi possível carregar o repositório. Tente de novo em alguns minutos.',
      })
    }
  }

  hundleFilterChange = async filter => {
    const { repository } = this.state
    this.setState({ filter, issuesLoading: true, issuesError: '' })
    try {
      const issues = await fetchIssues(repository.full_name, filter)
      // Ignora a resposta se outro filtro foi escolhido enquanto ela chegava
      if (this.state.filter === filter) this.setState({ issues })
    } catch {
      if (this.state.filter === filter) {
        this.setState({
          issuesError: 'Não foi possível carregar as issues. Tente de novo em alguns minutos.',
        })
      }
    } finally {
      if (this.state.filter === filter) this.setState({ issuesLoading: false })
    }
  }

  render() {
    const {
      repository,
      issues,
      loading,
      error,
      filter,
      issuesLoading,
      issuesError,
    } = this.state
    if (loading) {
      return <Loading>Carregando</Loading>
    }
    if (error) {
      return (
        <Container>
          <Owner>
            <Link to="/">Voltar aos repositórios</Link>
            <p>{error}</p>
          </Owner>
        </Container>
      )
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueFilter>
          {FILTERS.map(option => (
            <button
              key={option.state}
              type="button"
              aria-pressed={filter === option.state}
              onClick={() => this.hundleFilterChange(option.state)}
            >
              {option.label}
            </button>
          ))}
        </IssueFilter>
        {issuesError && <IssuesMessage role="alert">{issuesError}</IssuesMessage>}
        {!issuesError && issues.length === 0 && (
          <IssuesMessage>Nenhuma issue encontrada.</IssuesMessage>
        )}
        <IssueList $loading={issuesLoading}>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    )
  }
}
export default Repository
