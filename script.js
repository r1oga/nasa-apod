const apiKey = 'DEMO_KEY'
const count = 10
const API_URL = 'https://api.nasa.gov/planetary/apod'
const url = `${API_URL}?api_key=${apiKey}&count=${count}`

const [resultsNav, favoritesNav] = ['resultsNav', 'favoritesNav'].map(id =>
  document.getElementById(id)
)
const [imagesContainer, saveConfirmed, loader] = [
  '.images-container',
  '.save-confirmed',
  '.loader'
].map(query => document.querySelector(query))

let results = []
let favorites = JSON.parse(localStorage.getItem('nasaFavorites')) || {}

const showContent = page => {
  scrollTo({ top: 0, behavior: 'instant' })
  if (page !== 'favorites') {
    resultsNav.classList.remove('hidden')
    favoritesNav.classList.add('hidden')
  } else {
    resultsNav.classList.add('hidden')
    favoritesNav.classList.remove('hidden')
  }
  loader.classList.add('hidden')
}

const saveFavorite = url => {
  results.forEach(item => {
    if (item.url === url && !favorites[url]) {
      favorites[url] = item
      saveConfirmed.hidden = false
      setTimeout(() => {
        saveConfirmed.hidden = true
      }, 2000)
    }
    localStorage.setItem('nasaFavorites', JSON.stringify(favorites))
  })
}

const deleteFavorite = url => {
  delete favorites[url]
  localStorage.setItem('nasaFavorites', JSON.stringify(favorites))
  updateDOM('favorites')
}

const createDOMNodes = page => {
  const items = page === 'favorites' ? Object.values(favorites) : results
  items.forEach(({ copyright, date, explanation, hdurl, url, title }) => {
    // create Elements
    const card = document.createElement('div')
    card.classList.add('card')

    const link = document.createElement('a')
    link.href = hdurl
    link.title = 'View Full Image'
    link.target = '_blank'

    const image = document.createElement('img')
    image.src = url
    image.alt = 'NASA Picture of the Day'
    image.loading = 'lazy'
    image.classList.add('card-img-top')

    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')

    const titleEl = document.createElement('h5')
    titleEl.textContent = title
    titleEl.classList.add('card-title')

    const action = document.createElement('p')
    action.classList.add('clickable')
    action.textContent =
      page !== 'favorites' ? 'Add to Favorites' : 'Remove from Favorites'
    action.setAttribute(
      'onclick',
      page !== 'favorites'
        ? `saveFavorite('${url}')`
        : `deleteFavorite('${url}')`
    )

    const description = document.createElement('p')
    description.textContent = explanation

    const footer = document.createElement('small')
    footer.classList.add('text-muted')

    const dateEl = document.createElement('strong')
    dateEl.textContent = date

    const copyrightEl = document.createElement('span')
    copyrightEl.textContent = copyright

    // Append everyting: bottom to top
    footer.append(dateEl, copyrightEl)
    cardBody.append(titleEl, action, description, footer)
    link.appendChild(image)
    card.append(link, cardBody)
    imagesContainer.appendChild(card)
  })
}

const updateDOM = async page => {
  // reset images container
  imagesContainer.textContent = ''

  if (page !== 'favorites') {
    await fetchNasaPictures()
  }
  createDOMNodes(page)
  showContent(page)
}

const fetchNasaPictures = async () => {
  loader.classList.remove('hidden')
  try {
    const response = await fetch(url)
    results = await response.json()
  } catch (error) {
    console.log(error)
  }
}

updateDOM('')

window.updateDOM = updateDOM
