export const getToken = () => localStorage.getItem('token')
export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null')
export const getClinic = () => JSON.parse(localStorage.getItem('clinic') || 'null')

export function saveAuth({ token, user, clinicId, clinicName }) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('clinic', JSON.stringify({ id: clinicId, name: clinicName }))
}

export function logout() {
  localStorage.clear()
  window.location.href = '/login'
}

export function isLoggedIn() {
  return !!getToken()
}
