import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaGithubAlt, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa'

import api from '../../services/api'
import Container from '../../components/Container'
import { Form, SubmitButton, ErrorMessage, List } from './styles'

const STORAGE_KEY = 'repositories'
const REPOSITORY_FORMAT = /^[\w.-]+\/[\w.-]+$/

function loadRepositories() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
}

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

export default function Main() {
  const [newRepository, setNewRepository] = useState('')
  const [repositories, setRepositories] = useState(loadRepositories)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // A lista pode mudar durante a requisição de uma adição; o ref guarda a versão atual
  const repositoriesRef = useRef(repositories)

  function saveRepositories(list) {
    repositoriesRef.current = list
    setRepositories(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  function handleInputChange(e) {
    setNewRepository(e.target.value)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const name = newRepository.trim()
    if (!name) {
      setError('Digite o repositório no formato dono/nome.')
      return
    }
    if (!REPOSITORY_FORMAT.test(name)) {
      setError('Use o formato dono/nome, por exemplo facebook/react.')
      return
    }
    if (isInList(repositoriesRef.current, name)) {
      setError('Esse repositório já está na lista.')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/repos/${name}`)
      // A API devolve o nome atual de um repositório renomeado, que pode já estar na lista
      const fullName = response.data.full_name
      if (isInList(repositoriesRef.current, fullName)) {
        setError('Esse repositório já está na lista.')
      } else {
        saveRepositories([...repositoriesRef.current, { name: fullName }])
        setNewRepository('')
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function handleRemove(name) {
    saveRepositories(repositoriesRef.current.filter(repository => repository.name !== name))
  }

  return (
    <Container>
      <h1>
        <FaGithubAlt />
        Repositórios
      </h1>
      <Form onSubmit={handleSubmit} $error={Boolean(error)}>
        <input
          type="text"
          placeholder="Adicionar repositório"
          value={newRepository}
          onChange={handleInputChange}
        />
        <SubmitButton $loading={loading} aria-label="Adicionar repositório">
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
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
              <button
                type="button"
                title="Remover"
                aria-label={`Remover ${repository.name}`}
                onClick={() => handleRemove(repository.name)}
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
