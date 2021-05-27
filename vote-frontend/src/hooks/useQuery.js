const {useLocation} = require('react-router-dom')

export function useQuery() {
  return new URLSearchParams(useLocation().search)
}
