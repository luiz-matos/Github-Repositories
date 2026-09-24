import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Loading, Owner, IssueFilter, IssueList, IssuesMessage, Pagination } from './styles'
import Container from '../../components/Container'
import api from '../../services/api'

const FILTERS = [
  { state: 'open', label: 'Abertas' },
  { state: 'closed', label: 'Fechadas' },
  { state: 'all', label: 'Todas' },
]

const PER_PAGE = 5
// A busca do GitHub devolve no máximo os primeiros 1000 resultados
const SEARCH_LIMIT = 1000

// O endpoint /issues mistura pull requests; a busca com is:issue traz só issues
async function fetchIssues(fullName, filter, page) {
  const stateQuery = filter === 'all' ? '' : ` is:${filter}`
  const response = await api.get('search/issues', {
    params: {
      q: `repo:${fullName} is:issue${stateQuery}`,
      sort: 'created',
      order: 'desc',
      per_page: PER_PAGE,
      page,
    },
  })
  const total = Math.min(response.data.total_count, SEARCH_LIMIT)
  return {
    issues: response.data.items,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
  }
}

class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    error: '',
    filter: 'open',
    page: 1,
    totalPages: 1,
    issuesLoading: false,
    issuesError: '',
  }

  issuesRequest = 0

  async componentDidMount() {
    const { match } = this.props
    const repositoryName = decodeURIComponent(match.params.repository)
    try {
      const repository = await api.get(`repos/${repositoryName}`)
      const { issues, totalPages } = await fetchIssues(
        repository.data.full_name,
        this.state.filter,
        this.state.page
      )
      this.setState({
        loading: false,
        repository: repository.data,
        issues,
        totalPages,
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

  loadIssues = async (filter, page) => {
    const { repository } = this.state
    const request = ++this.issuesRequest
    this.setState({ filter, page, issuesLoading: true, issuesError: '' })
    try {
      const { issues, totalPages } = await fetchIssues(repository.full_name, filter, page)
      // Ignora a resposta se outro filtro ou página foi escolhido enquanto ela chegava
      if (request === this.issuesRequest) this.setState({ issues, totalPages })
    } catch {
      if (request === this.issuesRequest) {
        this.setState({
          issuesError: 'Não foi possível carregar as issues. Tente de novo em alguns minutos.',
        })
      }
    } finally {
      if (request === this.issuesRequest) this.setState({ issuesLoading: false })
    }
  }

  hundleFilterChange = filter => {
    this.loadIssues(filter, 1)
  }

  hundlePageChange = page => {
    this.loadIssues(this.state.filter, page)
  }

  render() {
    const {
      repository,
      issues,
      loading,
      error,
      filter,
      page,
      totalPages,
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
        {!issuesError && totalPages > 1 && (
          <Pagination>
            <button
              type="button"
              disabled={issuesLoading || page === 1}
              onClick={() => this.hundlePageChange(page - 1)}
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              disabled={issuesLoading || page === totalPages}
              onClick={() => this.hundlePageChange(page + 1)}
            >
              Próxima
            </button>
          </Pagination>
        )}
      </Container>
    )
  }
}
export default Repository
