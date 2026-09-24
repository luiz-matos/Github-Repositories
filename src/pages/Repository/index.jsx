import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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

export default function Repository() {
  const params = useParams()
  const repositoryName = decodeURIComponent(params.repository)

  const [repository, setRepository] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [issues, setIssues] = useState([])
  const [filter, setFilter] = useState('open')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [issuesError, setIssuesError] = useState('')
  // Número da última busca de issues, para descartar respostas que chegam atrasadas
  const issuesRequest = useRef(0)

  useEffect(() => {
    let ignore = false

    async function loadRepository() {
      try {
        const response = await api.get(`repos/${repositoryName}`)
        const firstPage = await fetchIssues(response.data.full_name, 'open', 1)
        if (ignore) return
        setRepository(response.data)
        setIssues(firstPage.issues)
        setTotalPages(firstPage.totalPages)
      } catch (err) {
        if (ignore) return
        const notFound = err.response && err.response.status === 404
        setError(
          notFound
            ? 'Repositório não encontrado.'
            : 'Não foi possível carregar o repositório. Tente de novo em alguns minutos.'
        )
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadRepository()
    return () => {
      ignore = true
    }
  }, [repositoryName])

  async function loadIssues(newFilter, newPage) {
    const request = ++issuesRequest.current
    setFilter(newFilter)
    setPage(newPage)
    setIssuesLoading(true)
    setIssuesError('')
    try {
      const result = await fetchIssues(repository.full_name, newFilter, newPage)
      if (request === issuesRequest.current) {
        setIssues(result.issues)
        setTotalPages(result.totalPages)
      }
    } catch {
      if (request === issuesRequest.current) {
        setIssuesError('Não foi possível carregar as issues. Tente de novo em alguns minutos.')
      }
    } finally {
      if (request === issuesRequest.current) setIssuesLoading(false)
    }
  }

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
            onClick={() => loadIssues(option.state, 1)}
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
          <li key={issue.id}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>
                {issue.labels.map(label => (
                  <span key={label.id}>{label.name}</span>
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
            onClick={() => loadIssues(filter, page - 1)}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={issuesLoading || page === totalPages}
            onClick={() => loadIssues(filter, page + 1)}
          >
            Próxima
          </button>
        </Pagination>
      )}
    </Container>
  )
}
