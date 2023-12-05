export const genTicket = () => {
  const date = new Date()
  const year = date.getFullYear() % 1000
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  const ticketInt = '' + year + month + day + hours + minutes + seconds

  const parte1 = ticketInt.slice(0, 2)
  const parte2 = ticketInt.slice(2, 7)
  const parte3 = ticketInt.slice(7)

  return `${parte1}-${parte2}-${parte3}`
}
