import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <p className="text-sm font-semibold text-txt-primary">Page not found</p>
      <p className="text-sm text-txt-secondary mt-2 mb-6">
        The page you are looking for does not exist.
      </p>
      <Link to="/">
        <Button aria-label="Go home">Back home</Button>
      </Link>
    </div>
  )
}
