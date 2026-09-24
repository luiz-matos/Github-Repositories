import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Loading, Owner, IssueList } from './styles'
import Container from '../../components/Container'
import api from '../../services/api'

class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    error: '',
  }

  async componentDidMount() {
    const { match } = this.props
    const repositoryName = decodeURIComponent(match.params.repository)
    try {
      const repository = await api.get(`repos/${repositoryName}`)
      // O endpoint /issues mistura pull requests; a busca com is:issue traz só issues
      const issues = await api.get('search/issues', {
        params: {
          q: `repo:${repository.data.full_name} is:issue is:open`,
          sort: 'created',
          order: 'desc',
          per_page: 5,
        },
      })
      this.setState({
        loading: false,
        repository: repository.data,
        issues: issues.data.items,
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

  render() {
    const { repository, issues, loading, error } = this.state
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
        <IssueList>
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
